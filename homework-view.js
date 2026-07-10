import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const student = JSON.parse(localStorage.getItem("student"));

const q = query(
collection(db,"homework"),
where("Class","==",student.Class)
);

const snapshot = await getDocs(q);

let html = "";

snapshot.forEach(doc=>{

const h = doc.data();

html += `
<div class="card">
<h3>${h.Subject}</h3>
<p><b>Date:</b> ${h.Date}</p>
<p>${h.Homework}</p>
</div>
`;

});

if(html==""){
html="<div class='card'><h3>No Homework Available</h3></div>";
}

document.getElementById("homeworkList").innerHTML=html;
