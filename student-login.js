import { db } from "./firebase.js";
import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("loginBtn").addEventListener("click", async ()=>{

const admission=document.getElementById("admission").value.trim();
const dob=document.getElementById("dob").value;

const snapshot=await getDocs(collection(db,"students"));

let found=false;

snapshot.forEach(doc=>{

const s=doc.data();

if(s.admission===admission && s.dob===dob){

localStorage.setItem("student",JSON.stringify(s));

window.location="student-dashboard.html";

found=true;

}

});

if(!found){

alert("Invalid Admission Number or Date of Birth");

}

});
