import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const roll = document.getElementById("roll");
const name = document.getElementById("name");
const exam = document.getElementById("exam");

document.getElementById("generateBtn").onclick = async () => {

if(roll.value.trim()==""){

alert("Enter Roll Number");
return;

}

const snap = await getDoc(doc(db,"students_v2",roll.value.trim()));

if(!snap.exists()){

alert("Student Not Found");
return;

}

const s = snap.data();

name.value = s.Name;
exam.value = s.ExamType;

localStorage.setItem("admitStudent",JSON.stringify(s));

window.location = "student-admitcard.html";

};
