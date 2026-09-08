import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  writeBatch,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const classSelect =
document.getElementById("classSelect");

const search =
document.getElementById("search");

const studentList =
document.getElementById("studentList");

const totalCount =
document.getElementById("totalCount");

const saveAllBtn =
document.getElementById("saveAllBtn");


let students = [];


/* =========================
   LOAD ALL STUDENTS
========================= */

async function loadStudents(){

try{

studentList.innerHTML =
`
<div class="empty">
⏳ Loading Students...
</div>
`;

const snap =
await getDocs(
collection(db,"students_v2")
);


students = [];

snap.forEach(item => {

const data = item.data();

students.push({

id:item.id,

...data

});

});


/* SORT BY CLASS + ROLL */

students.sort((a,b)=>{

const classA =
String(a.Class || "");

const classB =
String(b.Class || "");

if(classA !== classB){

return classA.localeCompare(
classB,
undefined,
{
numeric:true,
sensitivity:"base"
}
);

}

return String(a.Roll || "")
.localeCompare(
String(b.Roll || ""),
undefined,
{
numeric:true,
sensitivity:"base"
}
);

});


/* CREATE CLASS LIST */

const classSet =
new Set();


students.forEach(student=>{

if(student.Class){

classSet.add(
String(student.Class)
);

}

});


classSelect.innerHTML =
`
<option value="ALL">
ALL CLASSES
</option>
`;


Array.from(classSet)
.sort((a,b)=>
a.localeCompare(
b,
undefined,
{
numeric:true,
sensitivity:"base"
}
)
)
.forEach(classValue=>{

const option =
document.createElement("option");

option.value =
classValue;

option.textContent =
"CLASS " + classValue
.replace(/^class\s*/i,"");

classSelect.appendChild(option);

});


renderStudents();

}catch(error){

console.error(error);

studentList.innerHTML =
`
<div class="empty">

❌ Students Load Error

<br><br>

${escapeHtml(error.message)}

</div>
`;

}

}


/* =========================
   RENDER STUDENTS
========================= */

function renderStudents(){

const selectedClass =
classSelect.value;

const query =
search.value
.trim()
.toLowerCase();


const filtered =
students.filter(student=>{

const studentClass =
String(student.Class || "");

const name =
String(student.Name || "")
.toLowerCase();

const roll =
String(student.Roll || "")
.toLowerCase();


const classMatch =
selectedClass === "ALL" ||
studentClass === selectedClass;


const searchMatch =
!query ||
name.includes(query) ||
roll.includes(query);


return classMatch &&
searchMatch;

});


totalCount.textContent =
filtered.length +
(filtered.length === 1
? " Student"
: " Students");


if(filtered.length === 0){

studentList.innerHTML =
`
<div class="empty">

📭 No students found.

</div>
`;

return;

}


let html = "";


filtered.forEach((student,studentIndex)=>{

const subjects =
Array.isArray(student.Subjects)
? student.Subjects
: [];


const resultCreated =
student.ResultCreated === true;


html += `

<div
class="student-card"
data-id="${escapeAttr(student.id)}"
>

<div class="student-top">

<div>

<div class="student-name">

${escapeHtml(
student.Name || "-"
)}

</div>

<div class="student-info">

Roll No.:
${escapeHtml(
student.Roll || "-"
)}

&nbsp; • &nbsp;

Class:
${escapeHtml(
student.Class || "-"
)}

&nbsp; • &nbsp;

Section:
${escapeHtml(
student.Section || "-"
)}

</div>

</div>

<div class="status">

${
resultCreated
? "✓ RESULT SAVED"
: "PENDING"
}

</div>

</div>


<div class="marks-area">

${
subjects.length
? subjects.map((sub,subIndex)=>{

const full =
Number(sub.full || 0);

const obtained =
sub.obtained === undefined ||
sub.obtained === null
? ""
: sub.obtained;


return `

<div class="subject-box">

<div class="subject-name">

${escapeHtml(
sub.name || "Subject"
)}

</div>

<div class="maximum">

Maximum Marks:
${full}

</div>

<input
class="mark-input"
type="number"

data-student-id="${escapeAttr(student.id)}"

data-subject-index="${subIndex}"

data-full="${full}"

min="0"

max="${full}"

value="${escapeAttr(obtained)}"

inputmode="numeric"

placeholder="Marks"
>

</div>

`;

}).join("")

:

`

<div
style="
grid-column:1/-1;
text-align:center;
padding:20px;
color:#8a94a3;
font-size:12px;
"
>

⚠️ Subjects not found for this student.

</div>

`

}

</div>

</div>

`;

});


studentList.innerHTML =
html;

}


/* =========================
   CLASS FILTER
========================= */

classSelect.addEventListener(
"change",
renderStudents
);


/* =========================
   SEARCH
========================= */

search.addEventListener(
"input",
renderStudents
);


/* =========================
   SAVE ALL RESULTS
========================= */

saveAllBtn.addEventListener(
"click",
async()=>{

if(students.length === 0){

alert(
"❌ Students list is empty."
);

return;

}


const selectedClass =
classSelect.value;

const query =
search.value
.trim()
.toLowerCase();


const selectedStudents =
students.filter(student=>{

const studentClass =
String(student.Class || "");

const name =
String(student.Name || "")
.toLowerCase();

const roll =
String(student.Roll || "")
.toLowerCase();


const classMatch =
selectedClass === "ALL" ||
studentClass === selectedClass;


const searchMatch =
!query ||
name.includes(query) ||
roll.includes(query);


return classMatch &&
searchMatch;

});


if(selectedStudents.length === 0){

alert(
"❌ No students selected."
);

return;

}


/* CONFIRM */

const confirmSave =
confirm(

`क्या आप ${selectedStudents.length} विद्यार्थियों का Result Save करना चाहते हैं?`

);


if(!confirmSave){

return;

}


try{

saveAllBtn.disabled = true;

saveAllBtn.innerText =
"⏳ SAVING ALL RESULTS...";


const allUpdates = [];


/* =========================
   PREPARE RESULTS
========================= */

for(const student of selectedStudents){

const subjects =
Array.isArray(student.Subjects)
? student.Subjects
: [];


if(subjects.length === 0){

throw new Error(
`${student.Name || "Student"} के Subjects नहीं मिले।`
);

}


const updatedSubjects = [];


for(
let index=0;
index<subjects.length;
index++
){

const sub =
subjects[index];


const input =
document.querySelector(
`.mark-input[data-student-id="${cssEscape(student.id)}"][data-subject-index="${index}"]`
);


if(!input){

throw new Error(
`${student.Name || "Student"} के ${sub.name || "Subject"} marks input नहीं मिला।`
);

}


let value =
input.value.trim();


if(value === ""){

alert(
`❌ ${student.Name || "Student"} के ${sub.name || "Subject"} के marks भरें।`
);

input.focus();

throw new Error(
"Marks Missing"
);

}


let obtained =
Number(value);


const full =
Number(sub.full || 0);


if(
!Number.isFinite(obtained) ||
obtained < 0
){

alert(
`❌ ${student.Name || "Student"} के ${sub.name || "Subject"} के marks सही भरें।`
);

input.focus();

throw new Error(
"Invalid Marks"
);

}


if(obtained > full){

alert(
`❌ ${student.Name || "Student"} के ${sub.name || "Subject"} में maximum ${full} marks हैं।`
);

input.focus();

throw new Error(
"Maximum Marks Exceeded"
);

}


updatedSubjects.push({

name:sub.name,

full:full,

obtained:obtained

});

}


/* TOTAL */

let total = 0;

let fullTotal = 0;


updatedSubjects.forEach(sub=>{

total += Number(sub.obtained);

fullTotal += Number(sub.full);

});


/* PERCENTAGE */

const percentage =
fullTotal > 0
? ((total / fullTotal) * 100).toFixed(2)
: "0.00";


/* GRADE + DIVISION */

let grade = "";

let division = "";


const percentageNumber =
Number(percentage);


if(percentageNumber >= 90){

grade = "A+";
division = "First";

}
else if(percentageNumber >= 75){

grade = "A";
division = "First";

}
else if(percentageNumber >= 60){

grade = "B";
division = "First";

}
else if(percentageNumber >= 45){

grade = "C";
division = "Second";

}
else if(percentageNumber >= 33){

grade = "D";
division = "Third";

}
else{

grade = "F";
division = "Fail";

}


/* PASS / FAIL */

let result = "PASS";


for(const sub of updatedSubjects){

const passMarks =
Math.ceil(
Number(sub.full) * 0.33
);


if(
Number(sub.obtained) < passMarks
){

result = "FAIL";

break;

}

}


/* ADD UPDATE */

allUpdates.push({

id:student.id,

Subjects:updatedSubjects,

Total:total,

FullTotal:fullTotal,

Percentage:percentage,

Grade:grade,

Division:division,

Result:result,

ResultCreated:true

});

}


/* =========================
   FIRESTORE BATCH SAVE
========================= */

/*
   Firestore batch की सीमा 500 writes है।
   इसलिए 450-450 के chunks में save किया गया है।
*/

const chunkSize = 450;


for(
let start=0;
start<allUpdates.length;
start+=chunkSize
){

const chunk =
allUpdates.slice(
start,
start + chunkSize
);


const batch =
writeBatch(db);


chunk.forEach(item=>{

batch.update(

doc(
db,
"students_v2",
item.id
),

{

Subjects:item.Subjects,

Total:item.Total,

FullTotal:item.FullTotal,

Percentage:item.Percentage,

Grade:item.Grade,

Division:item.Division,

Result:item.Result,

ResultCreated:item.ResultCreated

}

);

});


await batch.commit();

}


/* UPDATE LOCAL DATA */

allUpdates.forEach(saved=>{

const student =
students.find(
s => s.id === saved.id
);

if(student){

student.Subjects =
saved.Subjects;

student.Total =
saved.Total;

student.FullTotal =
saved.FullTotal;

student.Percentage =
saved.Percentage;

student.Grade =
saved.Grade;

student.Division =
saved.Division;

student.Result =
saved.Result;

student.ResultCreated =
true;

}

});


renderStudents();


alert(

`✅ ${allUpdates.length} विद्यार्थियों का Result Successfully Save हो गया।`

);


saveAllBtn.disabled = false;

saveAllBtn.innerText =
"💾  SAVE ALL RESULTS";


}catch(error){

console.error(error);

if(
error.message !== "Marks Missing" &&
error.message !== "Invalid Marks" &&
error.message !== "Maximum Marks Exceeded"
){

alert(
"❌ Result Save Error\n\n"+
error.message
);

}

saveAllBtn.disabled = false;

saveAllBtn.innerText =
"💾  SAVE ALL RESULTS";

}

});


/* =========================
   SECURITY / HTML HELPERS
========================= */

function escapeHtml(value){

return String(value)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

}


function escapeAttr(value){

return escapeHtml(value);

}


function cssEscape(value){

if(
window.CSS &&
typeof window.CSS.escape === "function"
){

return window.CSS.escape(
String(value)
);

}


/* fallback */

return String(value)
.replace(/\\/g,"\\\\")
.replace(/"/g,'\\"');

}


/* START */

loadStudents();
