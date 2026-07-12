import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const roll = localStorage.getItem("studentRoll");

const student = await getDoc(doc(db,"students_v2",roll));

if(!student.exists()){

document.querySelector(".container").innerHTML="Student Not Found";

throw new Error();

}

const s = student.data();

const q = query(
collection(db,"time_table"),
where("Class","==",s.Class)
);

const snap = await getDocs(q);

let html = `
<h2 style="text-align:center;color:#0b3d91;margin-bottom:15px;">
📅 Class ${s.Class} Time Table
</h2>

<table style="width:100%;border-collapse:collapse;" border="1">

<tr style="background:#0b3d91;color:white;">
<th>Type</th>
<th>Subject</th>
<th>Time</th>
</tr>
`;

snap.forEach(d=>{

const t = d.data();

if(t.Type=="Lunch Break"){

html += `
<tr style="background:#fff3cd;font-weight:bold;">
<td>🍽️ Lunch Break</td>
<td colspan="2">
${t.StartTime} - ${t.EndTime}
</td>
</tr>
`;

}else{

html += `
<tr>
<td>📚 Period</td>
<td>${t.Subject}</td>
<td>${t.StartTime} - ${t.EndTime}</td>
</tr>
`;

}

});

html += "</table>";

document.getElementById("timeTable").innerHTML = html;
