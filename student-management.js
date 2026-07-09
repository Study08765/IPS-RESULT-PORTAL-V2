import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");
const table = document.getElementById("studentTable");

async function loadStudents() {

  table.innerHTML = "";

  const snapshot = await getDocs(collection(db, "students"));

  snapshot.forEach((doc) => {

    const s = doc.data();

    table.innerHTML += `
      <tr>
        <td>${s.admission}</td>
        <td>${s.name}</td>
        <td>${s.class}</td>
        <td>${s.roll}</td>
        <td>👁️ ✏️ 🗑️</td>
      </tr>
    `;

  });

}

loadStudents();

saveBtn.addEventListener("click", async () => {

  const admission = document.getElementById("admission").value.trim();
  const name = document.getElementById("name").value.trim();
  const father = document.getElementById("father").value.trim();
  const dob = document.getElementById("dob").value;
  const studentClass = document.getElementById("class").value;
  const section = document.getElementById("section").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  if (!admission || !name || !father || !dob || !section || !roll) {
    alert("Please fill all required fields.");
    return;
  }

  await addDoc(collection(db, "students"), {
    admission,
    name,
    father,
    dob,
    class: studentClass,
    section,
    roll,
    mobile,
    createdAt: new Date()
  });

  alert("✅ Student Added Successfully");

  document.querySelectorAll("input").forEach(input => input.value = "");

  loadStudents();

});
