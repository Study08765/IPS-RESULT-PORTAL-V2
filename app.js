import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.searchResult = async function () {

  const roll = document.getElementById("roll").value.trim();

  if (!roll) {
    alert("Roll Number Enter Kare");
    return;
  }

  const ref = doc(db, "students", roll);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    document.getElementById("result").innerHTML =
      "<h2 style='color:red'>Result Not Found</h2>";
    return;
  }

  const s = snap.data();

  const total =
    Number(s.Hindi) +
    Number(s.English) +
    Number(s.Mathematics) +
    Number(s.Science) +
    Number(s.SocialScience);

  const percentage = ((total / 260) * 100).toFixed(2);

  document.getElementById("result").innerHTML = `
  <div style="border:2px solid #0b3d91;padding:15px;border-radius:10px;">

  <h3 style="text-align:center;">
QUARTERLY EXAMINATION RESULT 2026–27
</h3>

  <hr>

  <p><b>Name :</b> ${s.Name}</p>
  <p><b>Father :</b> ${s.Father}</p>
  <p><b>Class :</b> ${s.Class}</p>
  <p><b>Roll No :</b> ${roll}</p>

  <table border="1" width="100%" cellpadding="8" cellspacing="0">

  <tr>
  <th>Subject</th>
  <th>Marks</th>
  </tr>

  <tr><td>Hindi</td><td>${s.Hindi}/50</td></tr>
  <tr><td>English</td><td>${s.English}/50</td></tr>
  <tr><td>Mathematics</td><td>${s.Mathematics}/50</td></tr>
  <tr><td>Science</td><td>${s.Science}/50</td></tr>
  <tr><td>Social Science</td><td>${s.SocialScience}/60</td></tr>

  </table>

  <br>

  <p><b>Total :</b> ${total}/260</p>

  <p><b>Percentage :</b> ${percentage}%</p>

  <p style="font-size:22px;color:green;">
  <b>${s.Result}</b>
  </p>

  <button onclick="window.print()">
  🖨️ Print Result
  </button>

  </div>
  `;

}
