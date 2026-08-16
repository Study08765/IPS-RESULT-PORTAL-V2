import { db } from "./firebase.js";

import {
doc,
getDoc,
setDoc,
getDocs,
collection,
writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const classSelect =
document.getElementById("classSelect");

const subjectsDiv =
document.getElementById("subjects");

const addSubjectBtn =
document.getElementById("addSubject");

const saveBtn =
document.getElementById("saveBtn");

const statusBox =
document.getElementById("status");

const studentCount =
document.getElementById("studentCount");


// =====================================================
// ESCAPE
// =====================================================

function escapeHTML(value){

return String(value || "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

}


// =====================================================
// ADD SUBJECT ROW
// =====================================================

function addSubjectRow(subjectName=""){

const row =
document.createElement("div");

row.className =
"subjectRow";

row.innerHTML = `

<input
type="text"
class="subjectName"
placeholder="Subject Name"
value="${escapeHTML(subjectName)}"
>

<button
type="button"
class="deleteBtn">
×
</button>

`;

row.querySelector(".deleteBtn").onclick = () => {

row.remove();

};

subjectsDiv.appendChild(row);

}


// =====================================================
// LOAD SUBJECTS
// =====================================================

async function loadSubjects(){

const className =
classSelect.value;

subjectsDiv.innerHTML = "";

if(!className){

studentCount.innerText =
"Select a class";

return;

}

try{

const snap =
await getDoc(
doc(
db,
"class_subjects",
className
)
);

if(
snap.exists() &&
Array.isArray(
snap.data().Subjects
)
){

snap.data().Subjects.forEach(
subject => {

addSubjectRow(subject);

});

}

if(subjectsDiv.children.length === 0){

addSubjectRow();

}

await updateStudentCount();

}
catch(error){

console.error(error);

alert(
"Subjects load नहीं हो सके:\n" +
error.message
);

}

}


// =====================================================
// STUDENT COUNT
// =====================================================

async function updateStudentCount(){

const className =
classSelect.value;

if(!className){

studentCount.innerText =
"Select a class";

return;

}

const snapshot =
await getDocs(
collection(
db,
"students_v2"
)
);

let count = 0;

snapshot.forEach(studentDoc => {

const student =
studentDoc.data();

if(
String(student.Class || "")
.trim()
.toLowerCase()
===
String(className)
.trim()
.toLowerCase()
){

count++;

}

});

studentCount.innerText =
`Class ${className} में ${count} students हैं`;

}


// =====================================================
// ADD
// =====================================================

addSubjectBtn.onclick = () => {

addSubjectRow();

};


// =====================================================
// CLASS CHANGE
// =====================================================

classSelect.onchange = () => {

loadSubjects();

};


// =====================================================
// SAVE
// =====================================================

saveBtn.onclick = async () => {

const className =
classSelect.value;

if(!className){

alert(
"Please select class"
);

return;

}

const subjects = [];

document
.querySelectorAll(".subjectName")
.forEach(input => {

const name =
input.value.trim();

if(name){

subjects.push(name);

}

});

const uniqueSubjects =
[
...new Set(
subjects.map(
s => s.trim()
)
)
];

if(uniqueSubjects.length === 0){

alert(
"कम से कम एक subject डालें."
);

return;

}

try{

saveBtn.disabled =
true;

statusBox.style.display =
"block";

statusBox.innerText =
"Saving subjects...";


// ===================================================
// SAVE CLASS TEMPLATE
// ===================================================

await setDoc(

doc(
db,
"class_subjects",
className
),

{
Class:className,
Subjects:uniqueSubjects,
UpdatedAt:
new Date().toISOString()
}

);


// ===================================================
// GET STUDENTS
// ===================================================

const snapshot =
await getDocs(
collection(
db,
"students_v2"
)
);

const students = [];

snapshot.forEach(studentDoc => {

const student =
studentDoc.data();

if(
String(student.Class || "")
.trim()
.toLowerCase()
===
String(className)
.trim()
.toLowerCase()
){

students.push({

id:studentDoc.id,
data:student

});

}

});


statusBox.innerText =
`Applying subjects to ${students.length} students...`;


// ===================================================
// BATCH UPDATE
// ===================================================

const batchSize = 400;

for(
let start=0;
start<students.length;
start+=batchSize
){

const batch =
writeBatch(db);

const group =
students.slice(
start,
start+batchSize
);

group.forEach(item => {

const oldSubjects =
Array.isArray(
item.data.Subjects
)
? item.data.Subjects
: [];


const newSubjects =
uniqueSubjects.map(
subjectName => {

const old =
oldSubjects.find(
s =>
String(
s.name || ""
)
.trim()
.toLowerCase()
===
subjectName
.trim()
.toLowerCase()
);


return {

name:subjectName,

full:
old
? old.full ?? 0
: 0,

obtained:
old
? old.obtained ?? 0
: 0

};

});


batch.set(

doc(
db,
"students_v2",
item.id
),

{
Subjects:
newSubjects
},

{
merge:true
}

);

});

await batch.commit();

}


statusBox.innerText =
`✅ Class ${className} subjects saved and applied to ${students.length} students.`;

await updateStudentCount();

}
catch(error){

console.error(error);

statusBox.innerText =
"❌ Error occurred.";

alert(
"Error:\n" +
error.message
);

}
finally{

saveBtn.disabled =
false;

}

};


// =====================================================
// START
// =====================================================

loadSubjects();
