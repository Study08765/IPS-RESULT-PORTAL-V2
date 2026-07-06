import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.searchResult = async function () {

  const roll = document.getElementById("roll").value.trim();

  if (!roll) {
    alert("Enter Roll Number");
    return;
  }

  const ref = doc(db, "students_v2", roll);
  const snap = await getDoc(ref);

  if (!snap.exists()) {

    document.getElementById("result").innerHTML =
      "<h2 style='color:red;text-align:center'>Result Not Found</h2>";

    return;

  }

  const s = snap.data();

  let total = 0;
  let fullTotal = 0;

  let rows = "";

  if (s.Subjects) {

    s.Subjects.forEach(sub => {

      total += Number(sub.obtained);
      fullTotal += Number(sub.full);

      rows += `
      <tr>
        <td>${sub.name}</td>
        <td>${sub.full}</td>
        <td>${sub.obtained}</td>
      </tr>
      `;

    });

  }

  const percentage =
    fullTotal > 0
      ? ((total / fullTotal) * 100).toFixed(2)
      : "0.00";

  let grade = "";

  if (percentage >= 90) grade = "A+";
  else if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B+";
  else if (percentage >= 60) grade = "B";
  else if (percentage >= 50) grade = "C";
  else if (percentage >= 33) grade = "D";
  else grade = "F";

  const resultStatus =
    Number(percentage) >= 33 ? "PASS" : "FAIL";

  document.getElementById("result").innerHTML = `

<div style="background:#fff;border:2px solid #0b3d91;border-radius:10px;padding:15px;">

<h2 style="text-align:center;color:#0b3d91;">
IPS PUBLIC SCHOOL
</h2>

<h3 style="text-align:center;">
AHIRORI HARDOI
</h3>

<h3 style="text-align:center;">
${s.ExamType}
</h3>

<h3 style="text-align:center;">
RESULT ${s.Session}
</h3>

<hr>

<p><b>Roll No :</b> ${s.Roll}</p>

<p><b>Name :</b> ${s.Name}</p>

<p><b>Father :</b> ${s.Father}</p>

<p><b>Class :</b> ${s.Class}</p>

<p><b>Section :</b> ${s.Section}</p>

<table border="1" width="100%" cellspacing="0" cellpadding="8">

<tr>

<th>Subject</th>

<th>Full Marks</th>

<th>Obtained</th>

</tr>

${rows}

</table>

<br>

<p><b>Total :</b> ${total} / ${fullTotal}</p>

<p><b>Percentage :</b> ${percentage}%</p>

<p><b>Grade :</b> ${grade}</p>

<p style="font-size:22px;color:${resultStatus==="PASS"?"green":"red"}">

<b>${resultStatus}</b>

</p>

<button onclick="window.print()">

🖨️ Print Result

</button>

</div>

`;

}
