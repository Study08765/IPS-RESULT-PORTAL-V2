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

const snapshot = await getDocs(collection(db, "students_v2"));

snapshot.forEach(doc => {

const s = doc.data();

if (classBox.value === "" || s.Class === classBox.value) {

studentList.innerHTML += `
<div class="card">

<b>${s.Name}</b><br>

Roll : ${s.Roll}

<br><br>

<label>
<input type="radio" name="${doc.id}" value="Present" checked>
Present
</label>

&nbsp;&nbsp;

<label>
<input type="radio" name="${doc.id}" value="Absent">
Absent
</label>

</div>
`;

}

});

}

classBox.addEventListener("change", loadStudents);

loadStudents();
saveBtn.addEventListener("click", async () => {

const snapshot = await getDocs(collection(db, "students_v2"));

for (const d of snapshot.docs) {

const s = d.data();

if (s.Class !== classBox.value) continue;

const status = document.querySelector(`input[name="${d.id}"]:checked`).value;

await setDoc(doc(db, "attendance", d.id), {

Name: s.Name,
Roll: s.Roll,
Class: s.Class,
Status: status,
Date: new Date().toISOString().split("T")[0]

});

}

alert("✅ Attendance Saved Successfully");

});
