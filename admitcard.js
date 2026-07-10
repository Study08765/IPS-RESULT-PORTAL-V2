import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const roll=document.getElementById("roll");
const name=document.getElementById("name");
const father=document.getElementById("father");
const studentClass=document.getElementById("class");
const section=document.getElementById("section");
const exam=document.getElementById("exam");
const session=document.getElementById("session");
const result=document.getElementById("result");

document.getElementById("generateBtn").onclick=async()=>{

if(!roll.value.trim()){
alert("Enter Roll Number");
return;
}

const snap=await getDoc(doc(db,"students_v2",roll.value.trim()));

if(!snap.exists()){
alert("Student Not Found");
return;
}

const s=snap.data();

name.value=s.Name||"";
father.value=s.Father||"";
studentClass.value=s.Class||"";
section.value=s.Section||"";
exam.value=s.ExamType||"";
session.value=s.Session||"";
result.value=s.Result||"Pending";

alert("✅ Admit Card Generated");

};
