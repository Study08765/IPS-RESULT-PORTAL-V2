import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
location.href = "student-login.html";
}

const snapshot = await getDocs(collection(db,"homework"));

let html = "";

snapshot.forEach(doc=>{

const h = doc.data();

if(h.Class === student.Class){

html += `
<div class="card">
<h3>${h.Subject}</h3>
<p><b>Date :</b> ${h.Date}</p>
<p>${h.Homework}</p>
</div>
`;

}

});

if(html==""){
html="<div class='card'><h3>No Homework Available</h3></div>";
}

document.getElementById("homeworkList").innerHTML=html;
