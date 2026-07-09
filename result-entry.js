import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let studentData = null;

// Student Search
document.getElementById("admission").addEventListener("change", async () => {

const admission = document.getElementById("admission").value.trim();

const q = query(
collection(db,"students"),
where("admission","==",admission)
);

const snapshot = await getDocs(q);

if(snapshot.empty){
alert("Student Not Found");
return;
}

snapshot.forEach(doc=>{

studentData = doc.data();

document.getElementById("name").value = studentData.name;

});

});

// Save Result
document.getElementById("saveBtn").addEventListener("click", async()=>{

const hindi = Number(document.getElementById("hindi").value);
const english = Number(document.getElementById("english").value);
const math = Number(document.getElementById("math").value);
const science = Number(document.getElementById("science").value);
const sst = Number(document.getElementById("sst").value);
const computer = Number(document.getElementById("computer").value);

const total = hindi+english+math+science+sst+computer;

const percentage = (total/600*100).toFixed(2);

const result =
(hindi>=33 &&
english>=33 &&
math>=33 &&
science>=33 &&
sst>=33 &&
computer>=33)
?
"PASS"
:
"FAIL";

await addDoc(collection(db,"results"),{

admission:document.getElementById("admission").value,

name:document.getElementById("name").value,

class:studentData?.class || "",

roll:studentData?.roll || "",

hindi,
english,
math,
science,
sst,
computer,

total,
percentage,
result,

createdAt:new Date()

});

alert("✅ Result Saved Successfully");

});
