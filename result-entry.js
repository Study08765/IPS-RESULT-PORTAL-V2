import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let studentData = null;

// Student Search
document.getElementById("admission").addEventListener("change", async () => {

const admission = document.getElementById("admission").value.trim();

const q = query(
collection(db,"students"),
where("admission","==",admission)
);

const snapshot = await getDocs(q);

if(snapshot.empty){
alert("Student Not Found");
return;
}

snapshot.forEach(doc=>{

studentData = doc.data();

document.getElementById("name").value = studentData.name || "";
document.getElementById("father").value = studentData.father || "";
document.getElementById("class").value = studentData.class || "";
document.getElementById("roll").value = studentData.roll || "";

});

});
// Add Subject
document.getElementById("addSubject").addEventListener("click", () => {

const row = document.createElement("div");

row.className = "subjectRow";

row.innerHTML = `
<input class="subjectName" placeholder="Subject Name">

<input class="fullMarks" type="number" value="100" placeholder="Full Marks">

<input class="obtainedMarks" type="number" placeholder="Obtained Marks">

<button type="button" class="removeBtn">❌ Remove</button>
`;

document.getElementById("subjects").appendChild(row);

row.querySelector(".removeBtn").onclick = () => row.remove();

});
// Save Result
document.getElementById("saveBtn").addEventListener("click", async () => {

const rows = document.querySelectorAll(".subjectRow");

let subjects = [];
let total = 0;
let fullTotal = 0;
let pass = true;

rows.forEach(row => {

const subject = row.querySelector(".subjectName").value.trim();
const fullMarks = Number(row.querySelector(".fullMarks").value || 100);
const obtained = Number(row.querySelector(".obtainedMarks").value || 0);

subjects.push({
subject,
fullMarks,
obtained
});

total += obtained;
fullTotal += fullMarks;

if(obtained < 33){
pass = false;
}

});

const percentage = fullTotal ? ((total / fullTotal) * 100).toFixed(2) : "0.00";

let grade = "F";

if(percentage >= 90) grade = "A+";
else if(percentage >= 80) grade = "A";
else if(percentage >= 70) grade = "B";
else if(percentage >= 60) grade = "C";
else if(percentage >= 50) grade = "D";

document.getElementById("total").value = total;
document.getElementById("percentage").value = percentage;
document.getElementById("grade").value = grade;
document.getElementById("result").value = pass ? "PASS" : "FAIL";

await addDoc(collection(db,"results"),{

admission: document.getElementById("admission").value,
name: document.getElementById("name").value,
father: document.getElementById("father").value,
class: document.getElementById("class").value,
roll: document.getElementById("roll").value,

examType: document.getElementById("examType").value,
session: document.getElementById("session").value,

subjects,
total,
percentage,
grade,
result: pass ? "PASS" : "FAIL",

createdAt: new Date()

});

alert("✅ Result Saved Successfully");

});
