import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
doc,
updateDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let editId = "";

const classBox = document.getElementById("class");
const subjectBox = document.getElementById("subject");
const dateBox = document.getElementById("date");
const homeworkBox = document.getElementById("homework");
const saveBtn = document.getElementById("saveBtn");
const homeworkList = document.getElementById("homeworkList");

async function loadHomework(){

homeworkList.innerHTML="";

const snapshot = await getDocs(collection(db,"homework"));

snapshot.forEach(d=>{

const h = d.data();

homeworkList.innerHTML += `
<div class="card">

<h3>${h.Subject}</h3>

<p><b>Class :</b> ${h.Class}</p>

<p><b>Date :</b> ${h.Date}</p>

<p>${h.Homework}</p>

<button onclick="editHomework('${d.id}')">✏️ Edit</button>

<button onclick="deleteHomework('${d.id}')"
style="background:red;margin-top:8px;">
🗑️ Delete
</button>

</div>
`;

});

}

loadHomework();

window.editHomework = async function(id){

const snapshot = await getDocs(collection(db,"homework"));

snapshot.forEach(d=>{

if(d.id===id){

const h=d.data();

editId=id;

classBox.value=h.Class;
subjectBox.value=h.Subject;
dateBox.value=h.Date;
homeworkBox.value=h.Homework;

saveBtn.innerText="✅ Update Homework";

}

});

}

window.deleteHomework = async function(id){

if(!confirm("Delete Homework?")) return;

await deleteDoc(doc(db,"homework",id));

alert("Deleted Successfully");

loadHomework();

}

saveBtn.addEventListener("click",async()=>{

const data={

Class:classBox.value,
Subject:subjectBox.value,
Date:dateBox.value,
Homework:homeworkBox.value,
createdAt:new Date()

};

if(editId!=""){

await updateDoc(doc(db,"homework",editId),data);

alert("Homework Updated");

editId="";

saveBtn.innerText="💾 Save Homework";

}else{

await addDoc(collection(db,"homework"),data);

alert("Homework Saved");

}

classBox.selectedIndex=0;
subjectBox.selectedIndex=0;
dateBox.value="";
homeworkBox.value="";

loadHomework();

});
