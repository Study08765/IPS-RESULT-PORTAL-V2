import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const classBox = document.getElementById("class");
const studentList = document.getElementById("studentList");
const saveBtn = document.getElementById("saveBtn");

async function loadStudents() {

studentList.innerHTML = "";

if(classBox.value=="") return;

const snapshot = await getDocs(collection(db,"students_v2"));

snapshot.forEach(d=>{

const s=d.data();

if(s.Class===classBox.value){

studentList.innerHTML += `
<div style="background:#fff;padding:10px;margin:10px 0;border-radius:8px;">

<b>${s.Roll} - ${s.Name}</b>

<br><br>

<label>
<input type="radio" name="${d.id}" value="Present" checked>
Present
</label>

&nbsp;&nbsp;

<label>
<input type="radio" name="${d.id}" value="Absent">
Absent
</label>

</div>
`;

}

});

}

classBox.onchange = loadStudents;

saveBtn.onclick = async ()=>{

const snapshot = await getDocs(collection(db,"students_v2"));

for(const d of snapshot.docs){

const s=d.data();

if(s.Class!==classBox.value) continue;

const status=document.querySelector(`input[name="${d.id}"]:checked`).value;

await setDoc(doc(db,"attendance",d.id),{

Name:s.Name,
Roll:s.Roll,
Class:s.Class,
Status:status,
Date:new Date().toISOString().split("T")[0]

});

}

alert("✅ Attendance Saved Successfully");

};

loadStudents();
