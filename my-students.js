import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const studentList =
document.getElementById("studentList");

const search =
document.getElementById("search");

const totalCount =
document.getElementById("totalCount");


const staffId =
localStorage.getItem("staffLogin");

const adminLogin =
localStorage.getItem("adminLogin");


/* LOGIN CHECK */

if(!staffId && adminLogin !== "yes"){

location.href="staff-login.html";

}


let myClass="";
let students=[];


/* STAFF CLASS */

if(staffId){

try{

const staffSnap=
await getDoc(
doc(db,"staff",staffId)
);

if(staffSnap.exists()){

myClass=
staffSnap.data().class || "";

}

}catch(error){

console.error(error);

}

}


/* LOAD STUDENTS */

try{

const snap=
await getDocs(
collection(db,"students_v2")
);


snap.forEach(studentDoc=>{

const s=
studentDoc.data();


/* ADMIN */

if(adminLogin==="yes"){

if(!s.ResultCreated){

students.push({

id:studentDoc.id,

...s

});

}

}


/* STAFF */

else{

if(
String(s.Class || "") ===
String(myClass || "") &&
!s.ResultCreated
){

students.push({

id:studentDoc.id,

...s

});

}

}

});


showStudents(students);


}catch(error){

studentList.innerHTML=`

<div class="empty">

<div style="font-size:35px">
⚠️
</div>

<h3>Students Load Error</h3>

<p>${error.message}</p>

</div>

`;

}


/* SEARCH */

search.oninput=function(){

const text=
this.value
.trim()
.toLowerCase();


const filtered=
students.filter(s=>{

const name=
String(s.Name || "")
.toLowerCase();

const roll=
String(s.Roll || "")
.toLowerCase();


return(
name.includes(text) ||
roll.includes(text)
);

});


showStudents(filtered);

};


/* SHOW STUDENTS */

function showStudents(list){

totalCount.innerText=
`${list.length} Students`;


if(list.length===0){

studentList.innerHTML=`

<div class="empty">

<div style="font-size:35px">
🔎
</div>

<h3>No Students Found</h3>

<p>
कोई pending result student नहीं मिला।
</p>

</div>

`;

return;

}


/* GROUP */

const groups={};


list.forEach(s=>{

const cls=
s.Class || "Other";


if(!groups[cls]){
groups[cls]=[];
}

groups[cls].push(s);

});


/* SORT CLASS */

const classes=
Object.keys(groups).sort((a,b)=>{

const na=
parseInt(
String(a).match(/\d+/)?.[0]
) || 999;

const nb=
parseInt(
String(b).match(/\d+/)?.[0]
) || 999;

return na-nb;

});


let html="";


classes.forEach(
(className,index)=>{


const classStudents=
groups[className];


classStudents.sort((a,b)=>{

const ra=
parseInt(a.Roll) || 999999;

const rb=
parseInt(b.Roll) || 999999;

return ra-rb;

});


const classId=
"resultClass_"+index;


html+=`

<div
class="class-card"
id="${classId}"
>


<div
class="class-header"
onclick="toggleClass('${classId}')"
>

<div class="class-left">

<div class="class-icon">
🎓
</div>

<div>

<div class="class-title">
CLASS ${escapeHTML(className)}
</div>

<div class="class-count">
${classStudents.length}
Pending Result Students
</div>

</div>

</div>


<div class="arrow">
▼
</div>

</div>


<div class="student-area">

`;


classStudents.forEach(s=>{

html+=`

<div class="student-card">

<div>

<div class="student-name">

${escapeHTML(
s.Name || "Unnamed Student"
)}

</div>


<div class="student-info">

<b>Roll:</b>
${escapeHTML(
String(s.Roll || "-")
)}

&nbsp; • &nbsp;

<b>Class:</b>
${escapeHTML(
String(s.Class || "-")
)}

<br>

<b>Section:</b>
${escapeHTML(
String(s.Section || "-")
)}

</div>

</div>


<div class="actions">


<button
class="action edit"
onclick="editStudent('${s.id}')"
>

✏️ Edit

</button>


<button
class="action result"
onclick="createResult('${s.id}')"
>

📊 Create Result

</button>


</div>

</div>

`;

});


html+=`

</div>

</div>

`;

});


studentList.innerHTML=
html;

}


/* TOGGLE CLASS */

window.toggleClass=function(id){

const card=
document.getElementById(id);

if(card){

card.classList.toggle("closed");

}

};


/* EDIT */

window.editStudent=function(id){

location.href=
"addstudent_v2.html?id="+
encodeURIComponent(id);

};


/* CREATE RESULT */

window.createResult=function(id){

location.href=
"create-result.html?id="+
encodeURIComponent(id);

};


/* SECURITY */

function escapeHTML(value){

return String(value)

.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");

}
