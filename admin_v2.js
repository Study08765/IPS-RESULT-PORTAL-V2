import { db } from "./firebase.js";

import {
doc,
getDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const params =
new URLSearchParams(
window.location.search
);

const editId =
params.get("id");


const roll =
document.getElementById("roll");

const name =
document.getElementById("name");

const father =
document.getElementById("father");

const mother =
document.getElementById("mother");

const studentClass =
document.getElementById("class");

const section =
document.getElementById("section");

const examType =
document.getElementById("examType");

const session =
document.getElementById("session");

const saveBtn =
document.getElementById("saveBtn");

const addSubjectBtn =
document.getElementById("addSubject");

const subjectsDiv =
document.getElementById("subjects");


// =====================================================
// LOGIN
// =====================================================

const staffLogin =
localStorage.getItem("staffLogin");

const adminLogin =
localStorage.getItem("adminLogin");


// =====================================================
// ADMIN CLASS EDIT
// =====================================================

studentClass.readOnly = false;


// =====================================================
// STAFF CLASS
// =====================================================

if(
staffLogin &&
adminLogin !== "yes"
){

const staffSnap =
await getDoc(
doc(
db,
"staff",
staffLogin
)
);

if(staffSnap.exists()){

const staff =
staffSnap.data();

studentClass.value =
staff.class;

studentClass.readOnly =
true;

}

}


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
// CREATE SUBJECT
// =====================================================

function createSubject(
subjectName="",
fullMarks="",
obtainedMarks=""
){

const div =
document.createElement("div");

div.className =
"subject";

div.innerHTML = `

<input
class="subjectName"
placeholder="Subject Name"
value="${escapeHTML(subjectName)}"
>

<input
class="fullMarks"
type="number"
placeholder="Full Marks"
value="${escapeHTML(fullMarks)}"
>

<input
class="obtainedMarks"
type="number"
placeholder="Obtained Marks"
value="${escapeHTML(obtainedMarks)}"
>

<button
type="button"
class="removeSubject">
❌ Remove
</button>

`;


div.querySelector(
".removeSubject"
).onclick = () => {

div.remove();

};


subjectsDiv.appendChild(div);

}


// =====================================================
// LOAD CLASS SUBJECTS
// =====================================================

async function loadClassSubjects(){

const className =
studentClass.value.trim();

if(!className){

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


if(!snap.exists()){

return;

}


const data =
snap.data();


if(
!Array.isArray(
data.Subjects
)
){

return;

}


subjectsDiv.innerHTML =
"";


data.Subjects.forEach(
subject => {

createSubject(
subject,
"",
""
);

});


}
catch(error){

console.error(
"Subject template error:",
error
);

}

}


// =====================================================
// CLASS CHANGE
// =====================================================

studentClass.addEventListener(
"change",
async () => {

if(!editId){

await loadClassSubjects();

}

}
);


// =====================================================
// ADD SUBJECT
// =====================================================

addSubjectBtn.onclick = () => {

createSubject();

};


// =====================================================
// EDIT STUDENT
// =====================================================

if(editId){

const snap =
await getDoc(
doc(
db,
"students_v2",
editId
)
);


if(snap.exists()){

const s =
snap.data();


roll.value =
s.Roll || "";

roll.readOnly =
true;


name.value =
s.Name || "";

father.value =
s.Father || "";

mother.value =
s.Mother || "";

studentClass.value =
s.Class || "";

section.value =
s.Section || "";

examType.value =
s.ExamType || "";

session.value =
s.Session || "2026-27";


saveBtn.innerText =
"Update Student";


subjectsDiv.innerHTML =
"";


if(
Array.isArray(s.Subjects) &&
s.Subjects.length > 0
){

s.Subjects.forEach(
sub => {

createSubject(

sub.name || "",

sub.full ?? "",

sub.obtained ?? ""

);

});

}
else{

await loadClassSubjects();

}

}

}
else{

subjectsDiv.innerHTML =
"";


if(
studentClass.value.trim()
){

await loadClassSubjects();

}
else{

createSubject();

}

}


// =====================================================
// SAVE STUDENT
// =====================================================

saveBtn.addEventListener(
"click",
async () => {

if(!roll.value.trim()){

alert(
"Enter Roll Number"
);

return;

}


const subjects = [];


document
.querySelectorAll(".subject")
.forEach(box => {

const subjectName =
box.querySelector(
".subjectName"
)
.value
.trim();


const fullMarks =
Number(
box.querySelector(
".fullMarks"
).value
);


const obtainedMarks =
Number(
box.querySelector(
".obtainedMarks"
).value
);


if(subjectName){

subjects.push({

name:
subjectName,

full:
fullMarks,

obtained:
obtainedMarks

});

}

});


const student = {

Roll:
roll.value.trim(),

Name:
name.value.trim(),

Father:
father.value.trim(),

Mother:
mother.value.trim(),

Class:
studentClass.value.trim(),

Section:
section.value.trim(),

ExamType:
examType.value,

Session:
session.value.trim(),

Subjects:
subjects

};


try{

saveBtn.disabled =
true;


await setDoc(

doc(
db,
"students_v2",
roll.value.trim()
),

student

);


alert(

editId
? "✅ Student Updated Successfully"
: "✅ Student Saved Successfully"

);


if(!editId){

roll.value = "";

name.value = "";

father.value = "";

mother.value = "";

studentClass.value = "";

section.value = "";

session.value =
"2026-27";


subjectsDiv.innerHTML =
"";

createSubject();

}
else{

window.location.href =
"my-students.html";

}


}
catch(err){

console.error(err);

alert(
"❌ " +
err.message
);

}
finally{

saveBtn.disabled =
false;

}

});
