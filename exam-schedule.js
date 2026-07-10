import { db } from "./firebase.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const classBox = document.getElementById("class");
const subjects = document.getElementById("subjects");
const saveBtn = document.getElementById("saveBtn");

const subjectList = [
"Hindi",
"English",
"Mathematics",
"Science",
"Social Science",
"Computer",
"Sanskrit"
];

subjectList.forEach(name=>{

subjects.innerHTML += `
<div class="row">

<h3>${name}</h3>

<input type="date" class="date">

<input type="time" class="time">

</div>
`;

});

saveBtn.onclick = async()=>{

const dates = document.querySelectorAll(".date");
const times = document.querySelectorAll(".time");

for(let i=0;i<subjectList.length;i++){

await addDoc(collection(db,"exam_schedule"),{

Class:classBox.value,
Subject:subjectList[i],
Date:dates[i].value,
Time:times[i].value

});

}

alert("✅ Exam Schedule Saved");

};
