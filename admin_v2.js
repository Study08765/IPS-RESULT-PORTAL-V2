import { db } from "./firebase.js";

const subjectsDiv = document.getElementById("subjects");
const addSubjectBtn = document.getElementById("addSubject");

// नया Subject जोड़ने का फ़ंक्शन
function createSubject(name = "", full = "", obtained = "") {

  const div = document.createElement("div");
  div.className = "subject";

  div.innerHTML = `
    <input class="subjectName" placeholder="Subject Name" value="${name}">
    <input class="fullMarks" type="number" placeholder="Full Marks" value="${full}">
    <input class="obtainedMarks" type="number" placeholder="Obtained Marks" value="${obtained}">
    <button type="button" class="removeSubject">❌ Remove Subject</button>
  `;

  div.querySelector(".removeSubject").addEventListener("click", () => {
    div.remove();
  });

  subjectsDiv.appendChild(div);
}

// Add Subject Button
addSubjectBtn.addEventListener("click", () => {
  createSubject();
});
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("saveBtn").addEventListener("click", async () => {

  const roll = document.getElementById("roll").value.trim();

  if (!roll) {
    alert("Enter Roll Number");
    return;
  }

  const subjects = [];

  document.querySelectorAll(".subject").forEach((box) => {

    const name = box.querySelector(".subjectName").value.trim();
    const full = Number(box.querySelector(".fullMarks").value);
    const obtained = Number(box.querySelector(".obtainedMarks").value);

    if (name !== "") {
      subjects.push({
        name: name,
        full: full,
        obtained: obtained
      });
    }

  });

  const student = {

    Roll: roll,
    Name: document.getElementById("name").value,
    Father: document.getElementById("father").value,
    Mother: document.getElementById("mother").value,
    Class: document.getElementById("class").value,
    Section: document.getElementById("section").value,
    ExamType: document.getElementById("examType").value,
    Session: document.getElementById("session").value,

    Subjects: subjects

  };

  try {

    await setDoc(doc(db, "students_v2", roll), student);

    alert("✅ Student Saved Successfully");

  } catch (e) {

    alert(e.message);

  }

});
