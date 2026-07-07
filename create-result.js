import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const roll = params.get("id");

const name = document.getElementById("name");
const rollNo = document.getElementById("roll");
const className = document.getElementById("class");
const section = document.getElementById("section");

const subjectsDiv = document.getElementById("subjects");
const saveBtn = document.getElementById("saveBtn");

const snap = await getDoc(doc(db, "students_v2", roll));

if (!snap.exists()) {

  alert("Student Not Found");
  location.href = "my-students.html";

}

const student = snap.data();

name.innerHTML = student.Name;
rollNo.innerHTML = student.Roll;
className.innerHTML = student.Class;
section.innerHTML = student.Section;

let html = "";

student.Subjects.forEach((sub, index) => {

html += `

<div class="subject">

<label>${sub.name}</label>

<input
type="number"
id="m${index}"
value="${sub.obtained}">

</div>

`;

});

subjectsDiv.innerHTML = html;
saveBtn.addEventListener("click", async () => {

  const updatedSubjects = [];

  student.Subjects.forEach((sub, index) => {

    updatedSubjects.push({
      name: sub.name,
      full: sub.full,
      obtained: Number(document.getElementById("m" + index).value)
    });

  });

  let total = 0;
  let fullTotal = 0;

  updatedSubjects.forEach(sub => {
    total += sub.obtained;
    fullTotal += sub.full;
  });

  const percentage = ((total / fullTotal) * 100).toFixed(2);

  const result =
    updatedSubjects.some(sub => sub.obtained < 33)
      ? "FAIL"
      : "PASS";

  await updateDoc(doc(db, "students_v2", roll), {
    Subjects: updatedSubjects,
    Total: total,
    FullTotal: fullTotal,
    Percentage: percentage,
    Result: result
  });

  alert("✅ Result Saved Successfully");

  location.href = "my-students.html";

});
