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

<label>Start Time</label>
<input type="time" class="startTime">

<label>End Time</label>
<input type="time" class="endTime">

</div>
`;

});

saveBtn.onclick = async()=>{

const dates = document.querySelectorAll(".date");
const startTimes = document.querySelectorAll(".startTime");
const endTimes = document.querySelectorAll(".endTime");

for(let i=0;i<subjectList.length;i++){

await addDoc(collection(db,"exam_schedule"),{

Class:classBox.value,
Subject:subjectList[i],
Date:dates[i].value,
StartTime: startTimes[i].value,
EndTime: endTimes[i].value

});

}

alert("✅ Exam Schedule Saved");

};
