import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const params =
new URLSearchParams(window.location.search);

const studentId =
params.get("id");


const name =
document.getElementById("name");

const rollNo =
document.getElementById("roll");

const className =
document.getElementById("class");

const section =
document.getElementById("section");

const subjectsDiv =
document.getElementById("subjects");

const saveBtn =
document.getElementById("saveBtn");


/* STUDENT ID CHECK */

if(!studentId){

alert("Student ID Missing");

location.href="my-students.html";

}


/* LOAD STUDENT */

const snap =
await getDoc(
doc(db,"students_v2",studentId)
);


if(!snap.exists()){

alert("Student Not Found");

location.href="my-students.html";

}


const student =
snap.data();


/* STUDENT INFORMATION */

name.innerHTML =
student.Name || "-";

rollNo.innerHTML =
student.Roll || "-";

className.innerHTML =
student.Class || "-";

section.innerHTML =
student.Section || "-";


/* SUBJECTS */

let html="";


(student.Subjects || []).forEach(
(sub,index)=>{

html+=`

<div class="subject">

<label>
${sub.name}
<br>

<span style="
font-size:10px;
color:#8a94a3;
font-weight:normal;
">

Maximum Marks:
${sub.full}

</span>

</label>

<input
type="number"
id="m${index}"
min="0"
max="${sub.full}"
value="${sub.obtained || 0}"
>

</div>

`;

});


subjectsDiv.innerHTML=html;


/* SAVE RESULT */

saveBtn.addEventListener(
"click",
async()=>{


const updatedSubjects=[];


for(
let index=0;
index<(student.Subjects || []).length;
index++
){

const sub =
student.Subjects[index];


const input =
document.getElementById(
"m"+index
);


let obtained =
Number(input.value);


if(
isNaN(obtained) ||
obtained<0
){

alert(
`❌ ${sub.name} के marks सही भरें।`
);

input.focus();

return;

}


if(obtained>Number(sub.full)){

alert(
`❌ ${sub.name} में maximum ${sub.full} marks हैं।`
);

input.focus();

return;

}


updatedSubjects.push({

name:sub.name,

full:Number(sub.full),

obtained:obtained

});

}


/* TOTAL */

let total=0;

let fullTotal=0;


updatedSubjects.forEach(sub=>{

total+=sub.obtained;

fullTotal+=sub.full;

});


/* PERCENTAGE */

const percentage =
fullTotal>0
?((total/fullTotal)*100).toFixed(2)
:"0.00";


/* GRADE + DIVISION */

let grade="";
let division="";


if(percentage>=90){

grade="A+";
division="First";

}
else if(percentage>=75){

grade="A";
division="First";

}
else if(percentage>=60){

grade="B";
division="First";

}
else if(percentage>=45){

grade="C";
division="Second";

}
else if(percentage>=33){

grade="D";
division="Third";

}
else{

grade="F";
division="Fail";

}


/* PASS / FAIL */

let result="PASS";


for(
const sub of updatedSubjects
){

const passMarks =
Math.ceil(
sub.full*0.33
);


if(
sub.obtained<passMarks
){

result="FAIL";

break;

}

}


/* FIRESTORE SAVE */

try{


saveBtn.disabled=true;

saveBtn.innerText=
"⏳ SAVING RESULT...";


await updateDoc(

doc(
db,
"students_v2",
studentId
),

{

Subjects:
updatedSubjects,

Total:
total,

FullTotal:
fullTotal,

Percentage:
percentage,

Grade:
grade,

Division:
division,

Result:
result,

ResultCreated:
true

}

);


alert(
"✅ Result Saved Successfully"
);


location.href=
"my-students.html";


}catch(error){

alert(
"❌ Result Save Error\n\n"+
error.message
);


saveBtn.disabled=false;

saveBtn.innerText=
"💾  SAVE RESULT";

}

});
