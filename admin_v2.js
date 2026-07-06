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
