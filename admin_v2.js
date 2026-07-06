import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Edit Mode
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

// Subject Container
const subjectsDiv = document.getElementById("subjects");
const addSubjectBtn = document.getElementById("addSubject");

// Subject Box
function createSubject(name="",full="",obtained=""){

  const div=document.createElement("div");

  div.className="subject";

  div.innerHTML=`
    <input class="subjectName" placeholder="Subject Name" value="${name}">
    <input class="fullMarks" type="number" placeholder="Full Marks" value="${full}">
    <input class="obtainedMarks" type="number" placeholder="Obtained Marks" value="${obtained}">
    <button type="button" class="removeSubject">❌ Remove</button>
  `;

  div.querySelector(".removeSubject").onclick=()=>{
    div.remove();
  };

  subjectsDiv.appendChild(div);

}

// Add Subject
addSubjectBtn.onclick=()=>{
  createSubject();
};

// Edit Student
if(editId){

  const snap=await getDoc(doc(db,"students_v2",editId));

  if(snap.exists()){

    const s=snap.data();

    document.getElementById("roll").value=s.Roll;
    document.getElementById("roll").readOnly=true;

    document.getElementById("name").value=s.Name;
    document.getElementById("father").value=s.Father;
    document.getElementById("class").value=s.Class;

    document.getElementById("saveBtn").innerText="Update Student";

  }

}
// Save / Update Student
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

    if (name) {
      subjects.push({
        name,
        full,
        obtained
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

    alert(editId ? "✅ Student Updated Successfully"
                 : "✅ Student Saved Successfully");

    if (!editId) {

      document.getElementById("roll").value = "";
      document.getElementById("name").value = "";
      document.getElementById("father").value = "";
      document.getElementById("mother").value = "";
      document.getElementById("class").value = "";
      document.getElementById("section").value = "";

      subjectsDiv.innerHTML = "";

    }

  } catch (e) {

    alert("❌ " + e.message);

  }

});
