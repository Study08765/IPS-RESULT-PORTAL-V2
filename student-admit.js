import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Student Roll Number
const roll = localStorage.getItem("studentRoll");
// Admit Card Box
const admitBox = document.getElementById("admitBox");

// Check Release
const setting = await getDoc(doc(db,"settings","portal"));

if(!setting.exists() || !setting.data().admitCardRelease){

admitBox.innerHTML = `
<div class="card">
<h2>Admit Card</h2>
<p>❌ Admit Card has not been released yet.</p>
</div>
`;

throw new Error("Not Released");

}

// Student Data
const snap = await getDoc(doc(db,"students_v2",roll));

if(!snap.exists()){

admitBox.innerHTML = `
<div class="card">
Student Not Found
</div>
`;

throw new Error("Student Not Found");

}

const s = snap.data();

let html = `
<div class="card">

<h2>IPS PUBLIC SCHOOL AHIRORI HARDOI</h2>

<p style="margin:5px 0;color:#666;font-size:14px;">
</p>

<h3>ADMIT CARD</h3>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0;text-align:left;">

<div><b>👤 Name :</b> ${s.Name}</div>
<div><b>🎫 Roll No :</b> ${s.Roll}</div>

<div><b>👨 Father :</b> ${s.Father}</div>
<div><b>🏫 Class :</b> ${s.Class}</div>

<div><b>📝 Exam :</b> ${s.ExamType || ""}</div>
<div><b>📅 Session :</b> ${s.Session || ""}</div>

</div>
<h4 style="margin:15px 0 8px 0;color:#0b3d91;">
📚 Examination Schedule
</h4>
<table border="1" style="width:100%;border-collapse:collapse;margin-top:15px;">
<tr>
<th>Subject</th>
<th>Date</th>
<th>Time</th>
</tr>
`;

s.Subjects.forEach(sub=>{

html += `
<tr>
<td>${sub.name}</td>
<td>${sub.date ? sub.date.split("-").reverse().join("-") : ""}</td>
<td>${sub.startTime} - ${sub.endTime}</td>
</tr>
`;

});

html += `
</table>

<br>
<div style="display:flex;justify-content:space-between;margin-top:25px;">

<div style="text-align:center;">
____________________<br>
Student Signature
</div>

<div style="text-align:center;">
____________________<br>
Principal Signature
</div>

</div>

<br>
<button onclick="window.print()">
🖨️ Print Admit Card
</button>

</div>
`;

admitBox.innerHTML = html;
