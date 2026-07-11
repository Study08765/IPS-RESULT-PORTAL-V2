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
// Staff Auto Class
const staffLogin = localStorage.getItem("staffLogin");
const adminLogin = localStorage.getItem("adminLogin");

// Default: Admin can edit class
studentClass.readOnly = false;

if (staffLogin && adminLogin !== "yes") {

  const staffSnap = await getDoc(doc(db, "staff", staffLogin));

  if (staffSnap.exists()) {

    const staff = staffSnap.data();

    studentClass.value = staff.class;
    studentClass.readOnly = true;

  }

}
// Create Subject
function createSubject(
subjectName="",
fullMarks="",
obtainedMarks="",
examDate="",
startTime="",
endTime=""
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

<input
class="examDate"
type="date"
value="${examDate}">

<label>Exam Date</label>
<input
class="examDate"
type="date"
value="${examDate}">

<label>Start Time</label>
<input
class="startTime"
type="time"
value="${startTime}">

<label>End Time</label>
<input
class="endTime"
type="time"
value="${endTime}">
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

  const snap = await getDoc(doc(db, "students_v2", editId));

  if (snap.exists()) {

    const s = snap.data();

    roll.value = s.Roll || "";
    roll.readOnly = true;

    name.value = s.Name || "";
    father.value = s.Father || "";
    mother.value = s.Mother || "";
    studentClass.value = s.Class || "";
    section.value = s.Section || "";
    examType.value = s.ExamType || "";
    session.value = s.Session || "";

    saveBtn.innerText = "Update Student";

    // पुराने Subject हटाओ
    subjectsDiv.innerHTML = "";

    // Subject वापस लाओ
    if (s.Subjects && s.Subjects.length > 0) {

      s.Subjects.forEach(sub => {

        createSubject(
  sub.name,
  sub.full,
  sub.obtained,
  sub.date || "",
  sub.startTime || "",
  sub.endTime || ""
);

      });

    } else {

      createSubject();

    }

  }

} else {

  // नया Student होने पर एक Subject Box दिखाओ
  subjectsDiv.innerHTML = "";
  createSubject();

}
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
obtained: obtainedMarks,
date: box.querySelector(".examDate").value,
startTime: box.querySelector(".startTime").value,
endTime: box.querySelector(".endTime").value
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

    alert(editId ? "✅ Student Updated Successfully"
                 : "✅ Student Saved Successfully");

    if (!editId) {

      roll.value = "";
      name.value = "";
      father.value = "";
      mother.value = "";
      studentClass.value = "";
      section.value = "";
      session.value = "2026-27";

      subjectsDiv.innerHTML = "";
      createSubject();

    } else {

      window.location.href = "my-students.html";

    }

  } catch (err) {

    alert("❌ " + err.message);

  }

});
