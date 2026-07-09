import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {

  const admission = document.getElementById("admission").value.trim();
  const name = document.getElementById("name").value.trim();
  const father = document.getElementById("father").value.trim();
  const dob = document.getElementById("dob").value;
  const studentClass = document.getElementById("class").value;
  const section = document.getElementById("section").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  if (
    !admission ||
    !name ||
    !father ||
    !dob ||
    !section ||
    !roll
  ) {
    alert("Please fill all required fields.");
    return;
  }

  try {

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
loadStudents();
    document.querySelectorAll("input").forEach(input => input.value = "");

  } catch (error) {

    alert(error.message);

  }

});
async function loadStudents() {

  const table = document.getElementById("studentTable");
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
