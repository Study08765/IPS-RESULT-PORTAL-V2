import { db } from "./firebase.js";

import {
doc,
getDoc,
collection,
query,
where,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const roll = document.getElementById("roll");
const generateBtn = document.getElementById("generateBtn");

generateBtn.onclick = async () => {

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
alert("Student Class = " + s.Class);
document.getElementById("admitCard").style.display="block";

document.getElementById("showName").innerText = s.Name || "";
document.getElementById("showFather").innerText = s.Father || "";
document.getElementById("showRoll").innerText = s.Roll || "";
document.getElementById("showClass").innerText = s.Class || "";
document.getElementById("showExam").innerText = s.ExamType || "";
document.getElementById("showSession").innerText = s.Session || "";

const q = query(
collection(db, "exam_schedule"),
where("Class", "==", s.Class)
);

const schedule = await getDocs(q);
alert("Records: " + schedule.size);
let html = `
<table style="width:100%;border-collapse:collapse;" border="1">
<tr>
<th>Subject</th>
<th>Exam Date</th>
<th>Time</th>
</tr>
`;

schedule.forEach(d => {

const e = d.data();

html += `
<tr>
<td>${e.Subject}</td>
<td>${e.Date}</td>
<td>${e.StartTime} - ${e.EndTime}</td>
</tr>
`;

});

html += "</table>";

document.getElementById("subjectList").innerHTML = html;

};
