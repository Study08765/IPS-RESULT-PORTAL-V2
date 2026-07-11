import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Student Roll Number
const roll = localStorage.getItem("studentRoll");
alert("Roll = " + roll);
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

<h3>ADMIT CARD</h3>

<p><b>Name :</b> ${s.Name}</p>
<p><b>Father :</b> ${s.Father}</p>
<p><b>Roll :</b> ${s.Roll}</p>
<p><b>Class :</b> ${s.Class}</p>

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

<button onclick="window.print()">
🖨️ Print Admit Card
</button>

</div>
`;

admitBox.innerHTML = html;
