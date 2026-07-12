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
<table>
<tr>
<th>Type</th>
<th>Subject</th>
<th>Time</th>
</tr>
`;

snap.forEach(d=>{

const t = d.data();

html += `
<tr>
<td>${t.Type}</td>
<td>${t.Subject}</td>
<td>${t.StartTime} - ${t.EndTime}</td>
</tr>
`;

});

html += "</table>";

document.querySelector(".container").innerHTML =
html +
`<a href="student-dashboard.html" class="back">⬅ Back</a>`;
