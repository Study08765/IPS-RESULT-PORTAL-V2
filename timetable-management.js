import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
where,
deleteDoc,
doc,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const rows = document.getElementById("rows");

function addRow(type){

const div=document.createElement("div");

div.className="row";

if(type=="Lunch"){

div.innerHTML=`

<select class="type">
<option>Lunch Break</option>
</select>

<input class="subject" value="Lunch Break" readonly>

<input class="start">

<input class="end">

`;

}else{

div.innerHTML=`

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

document.getElementById("addPeriod").onclick=()=>addRow("Period");

document.getElementById("addLunch").onclick=()=>addRow("Lunch");

document.getElementById("saveBtn").onclick=async()=>{

const cls=document.getElementById("class").value;

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
const list=document.querySelectorAll(".row");

for(const r of list){

const type=r.querySelector(".type").value;

const subject=r.querySelector(".subject").value;

const start=r.querySelector(".start").value;

const end=r.querySelector(".end").value;

await addDoc(collection(db,"time_table"),{

Class:cls,

Type:type,

Subject:subject,

StartTime:start,

EndTime:end

});

}

alert("✅ Time Table Saved Successfully");

};
