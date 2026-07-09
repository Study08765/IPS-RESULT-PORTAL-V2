import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.searchResult = async function(){

const roll = document.getElementById("roll").value.trim();

if(!roll){
alert("Enter Roll Number");
return;
}

const snap = await getDoc(doc(db,"results",roll));

if(!snap.exists()){

document.getElementById("result").innerHTML =
"<h2 style='color:red;text-align:center'>Result Not Found</h2>";

return;

}

const s = snap.data();

let rows = "";
let total = 0;
let fullTotal = 0;

s.subjects.forEach(sub=>{

rows += `
<tr>
<td>${sub.subject}</td>
<td>${sub.fullMarks}</td>
<td>${sub.obtained}</td>
</tr>
`;

total += Number(sub.obtained);
fullTotal += Number(sub.fullMarks);

});
  document.getElementById("result").innerHTML = `

<div style="background:#fff;border:2px solid #0b3d91;padding:15px;border-radius:10px;">

<h2 style="text-align:center;color:#0b3d91;">IPS PUBLIC SCHOOL</h2>

<p><b>Admission :</b> ${s.admission}</p>

<p><b>Name :</b> ${s.name}</p>

<p><b>Father :</b> ${s.father}</p>

<p><b>Class :</b> ${s.class}</p>

<p><b>Roll :</b> ${s.roll}</p>

<p><b>Exam :</b> ${s.examType}</p>

<p><b>Session :</b> ${s.session}</p>

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

<p><b>Percentage :</b> ${s.percentage}%</p>

<p><b>Grade :</b> ${s.grade}</p>

<p style="font-size:22px;font-weight:bold;color:${s.result==="PASS"?"green":"red"};">
${s.result}
</p>

<button onclick="window.print()">🖨️ Print Result</button>

</div>
`;

}
