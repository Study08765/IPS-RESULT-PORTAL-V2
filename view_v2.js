import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tbody = document.getElementById("students");

async function loadStudents() {

  tbody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "students_v2"));

  snapshot.forEach((doc) => {

    const s = doc.data();

    tbody.innerHTML += `
    <tr>

      <td>${s.Roll}</td>

      <td>${s.Name}</td>

      <td>${s.Class}</td>

      <td>${s.ExamType}</td>

      <td>${s.Session}</td>

      <td>

      <button class="edit"
      onclick="editStudent('${doc.id}')">
      ✏️ Edit
      </button>

      <button class="delete"
      onclick="deleteStudent('${doc.id}')">
      🗑 Delete
      </button>

      </td>

    </tr>
    `;

  });

}

loadStudents();

// Live Search
const search = document.getElementById("search");

search.addEventListener("keyup", () => {

  const value = search.value.toLowerCase();

  document.querySelectorAll("#students tr").forEach((row) => {

    const text = row.innerText.toLowerCase();

    row.style.display = text.includes(value) ? "" : "none";

  });

});

// Edit Student
window.editStudent = function(id){

  window.location.href =
  "addstudent_v2.html?id=" + id;

}
