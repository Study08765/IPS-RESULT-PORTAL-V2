import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
query,
where,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const rows = document.getElementById("rows");
const classSelect = document.getElementById("class");
const savedTable = document.getElementById("savedTable");

function addRow(type="Period",data={}){

const div=document.createElement("div");
div.className="row";

div.innerHTML=`

<input class="periodNo" type="number" placeholder="Period"
value="${data.PeriodNo||""}">

<select class="type">

<option ${type=="Period"?"selected":""}>Period</option>

<option ${type=="Lunch Break"?"selected":""}>Lunch Break</option>

<option ${type=="School Closed"?"selected":""}>School Closed</option>

</select>

<input class="subject"
placeholder="Subject"
value="${data.Subject||""}">

<input class="start"
type="time"
value="${data.StartTime||""}">

<input class="end"
type="time"
value="${data.EndTime||""}">

`;

function updateType(){

if(typeBox.value=="Lunch Break"){

subject.value="Lunch Break";
subject.readOnly=true;

}else if(typeBox.value=="School Closed"){

subject.value="School Closed";
subject.readOnly=true;

}else{

subject.readOnly=false;

if(subject.value=="Lunch Break" || subject.value=="School Closed"){
subject.value="";
}

}

}

updateType();

typeBox.onchange = updateType;

rows.appendChild(div);

}

document.getElementById("addPeriod").onclick=()=>{
addRow("Period");
};

document.getElementById("addLunch").onclick=()=>{
addRow("Lunch Break");
};
document.getElementById("addClosed").onclick=()=>{
addRow("School Closed");
};
async function loadTimeTable(){

const cls = classSelect.value;

if(cls==""){
savedTable.innerHTML="";
return;
}

savedTable.innerHTML="";

const snap = await getDocs(
query(
collection(db,"time_table"),
where("Class","==",cls),
)
);

snap.forEach((d)=>{

const t = d.data();

savedTable.innerHTML += `

<tr>

<td>${t.PeriodNo}</td>

<td>${t.Type}</td>

<td>${t.Subject}</td>

<td>${t.StartTime}</td>

<td>${t.EndTime}</td>

<td>

<button onclick="deleteRow('${d.id}')">
🗑️
</button>

</td>

</tr>

`;

});

}

window.deleteRow = async(id)=>{

if(!confirm("Delete this Period?")) return;

await deleteDoc(doc(db,"time_table",id));

loadTimeTable();

};

classSelect.onchange = loadTimeTable;

document.getElementById("saveBtn").onclick = async()=>{

const cls = classSelect.value;

if(cls==""){
alert("Select Class");
return;
}

const list = rows.querySelectorAll(".row");

for(const r of list){

const periodNo = r.querySelector(".periodNo").value;
const type = r.querySelector(".type").value;
const subject = r.querySelector(".subject").value;
const start = r.querySelector(".start").value;
const end = r.querySelector(".end").value;

await addDoc(collection(db,"time_table"),{

Class:cls,
PeriodNo:Number(periodNo),
Type:type,
Subject:subject,
StartTime:start,
EndTime:end

});

}

rows.innerHTML="";

alert("✅ Time Table Saved Successfully");

await loadTimeTable();

};
window.onload = ()=>{
if(classSelect.value!=""){
loadTimeTable();
}
};
