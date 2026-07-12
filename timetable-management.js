import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
query,
where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const rows = document.getElementById("rows");

function addRow(type){

const div=document.createElement("div");
div.className="row";

if(type=="Lunch"){

div.innerHTML=`

<input class="periodNo" type="number" placeholder="No.">

<select class="type">
<option>Lunch Break</option>
</select>

<input class="subject" value="Lunch Break" readonly>

<input class="start" type="time">

<input class="end" type="time">

`;

}else{

div.innerHTML=`

<input class="periodNo" type="number" placeholder="Period">

<select class="type">
<option>Period</option>
</select>

<input class="subject" placeholder="Subject">

<input class="start" type="time">

<input class="end" type="time">

`;

}

rows.appendChild(div);

}

document.getElementById("addPeriod").onclick=()=>{
addRow("Period");
};

document.getElementById("addLunch").onclick=()=>{
addRow("Lunch");
};

async function loadTimeTable(){

const cls=document.getElementById("class").value;

if(cls=="") return;

const tbody=document.getElementById("savedTable");

tbody.innerHTML="";

const snap=await getDocs(
query(
collection(db,"time_table"),
where("Class","==",cls)
)
);

const list = [];

snap.forEach(d=>{
list.push(d.data());
});

list.sort((a,b)=>a.PeriodNo - b.PeriodNo);

list.forEach(t=>{

const t=d.data();

tbody.innerHTML+=`
<tr>

<td>${t.PeriodNo}</td>

<td>${t.Type}</td>

<td>${t.Subject}</td>

<td>${t.StartTime}</td>

<td>${t.EndTime}</td>

<td>

<button onclick="deleteTimeTable('${d.id}')">
🗑️
</button>

</td>

</tr>
`;

});

}

document.getElementById("class").onchange=loadTimeTable;
window.deleteTimeTable = async(id)=>{

if(!confirm("Delete this row?")) return;

await deleteDoc(doc(db,"time_table",id));

loadTimeTable();

};

document.getElementById("saveBtn").onclick = async()=>{

const cls = document.getElementById("class").value;

if(cls==""){
alert("Select Class");
return;
}

const oldData = await getDocs(
query(
collection(db,"time_table"),
where("Class","==",cls)
)
);

for(const d of oldData.docs){

await deleteDoc(doc(db,"time_table",d.id));

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

alert("✅ Time Table Saved Successfully");

rows.innerHTML="";

loadTimeTable();

};
