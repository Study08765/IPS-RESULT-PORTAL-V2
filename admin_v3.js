import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// URL Parameters
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

// Elements
const roll = document.getElementById("roll");
const name = document.getElementById("name");
const father = document.getElementById("father");
const mother = document.getElementById("mother");
const studentClass = document.getElementById("class");
const section = document.getElementById("section");
const examType = document.getElementById("examType");
const session = document.getElementById("session");

const saveBtn = document.getElementById("saveBtn");
const addSubjectBtn = document.getElementById("addSubject");
const subjectsDiv = document.getElementById("subjects");

// ===== Staff Auto Class =====
const staffLogin = localStorage.getItem("staffLogin");

if (staffLogin) {

  const staffSnap = await getDoc(doc(db, "staff", staffLogin));

  if (staffSnap.exists()) {

    const staff = staffSnap.data();

    studentClass.value = staff.class;
    alert("Staff Login = " + staffLogin);
    studentClass.readOnly = true;

  }

}
// Create Subject
function createSubject(
  subjectName = "",
  fullMarks = "",
  obtainedMarks = ""
){

  const div = document.createElement("div");

  div.className = "subject";

  div.innerHTML = `

<input
class="subjectName"
placeholder="Subject Name"
value="${subjectName}">

<input
class="fullMarks"
type="number"
placeholder="Full Marks"
value="${fullMarks}">

<input
class="obtainedMarks"
type="number"
placeholder="Obtained Marks"
value="${obtainedMarks}">

<button
type="button"
class="removeSubject">
❌ Remove
</button>

`;

  div.querySelector(".removeSubject").onclick = () => {
    div.remove();
  };

  subjectsDiv.appendChild(div);

}

// Add Subject
addSubjectBtn.onclick = () => {
  createSubject();
};

// Edit Student
if (editId) {

  const snap = await get
  // Save / Update Student
saveBtn.addEventListener("click", async () => {

  if (!roll.value.trim()) {
    alert("Enter Roll Number");
    return;
  }

  const subjects = [];

  document.querySelectorAll(".subject").forEach((box) => {

    const subjectName = box.querySelector(".subjectName").value.trim();
    const fullMarks = Number(box.querySelector(".fullMarks").value);
    const obtainedMarks = Number(box.querySelector(".obtainedMarks").value);

    if (subjectName) {
      subjects.push({
        name: subjectName,
        full: fullMarks,
        obtained: obtainedMarks
      });
    }

  });

  const student = {
    Roll: roll.value.trim(),
    Name: name.value.trim(),
    Father: father.value.trim(),
    Mother: mother.value.trim(),
    Class: studentClass.value.trim(),
    Section: section.value.trim(),
    ExamType: examType.value,
    Session: session.value.trim(),
    Subjects: subjects
  };

  try {

    await setDoc(doc(db, "students_v2", roll.value.trim()), student);

    alert(editId
      ? "✅ Student Updated Successfully"
      : "✅ Student Saved Successfully");

   
