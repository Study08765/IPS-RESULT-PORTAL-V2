import { db } from "./firebase.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("saveBtn").addEventListener("click", async () => {

const studentClass = document.getElementById("class").value;
const subject = document.getElementById("subject").value;
const date = document.getElementById("date").value;
const homework = document.getElementById("homework").value.trim();

if (
studentClass === "Select Class" ||
subject === "Select Subject" ||
!date ||
!homework
) {
alert("Please fill all fields");
return;
}

try {

await addDoc(collection(db, "homework"), {

Class: studentClass,
Subject: subject,
Date: date,
Homework: homework,
createdAt: new Date()

});

alert("✅ Homework Saved Successfully");

document.getElementById("class").selectedIndex = 0;
document.getElementById("subject").selectedIndex = 0;
document.getElementById("date").value = "";
document.getElementById("homework").value = "";

} catch (e) {

alert("❌ " + e.message);

}

});
