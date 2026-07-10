import { db } from "./firebase.js";
import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("loginBtn").addEventListener("click", async ()=>{

const roll = document.getElementById("roll").value.trim();

if (!roll) {
  alert("Enter Roll Number");
  return;
}

const snap = await getDoc(doc(db, "students_v2", roll));

if (!snap.exists()) {
  alert("Invalid Roll Number");
  return;
}

localStorage.setItem("student", JSON.stringify(snap.data()));
window.location = "student-dashboard.html";



});
