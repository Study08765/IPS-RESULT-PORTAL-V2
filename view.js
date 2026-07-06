import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tbody = document.getElementById("students");

async function loadStudents() {
  tbody.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "students"));

    querySnapshot.forEach((student) => {
      const s = student.data();

      tbody.innerHTML += `
      <tr>
        <td>${student.id}</td>
        <td>${s.Name}</td>
        <td>${s.Class}</td>
        <td>${s.Result}</td>
        <td>
          <button class="edit" onclick="editStudent('${student.id}')">Edit</button>
          <button class="delete" onclick="deleteStudent('${student.id}')">Delete</button>
        </td>
      </tr>`;
    });

  } catch (e) {
    alert("Error: " + e.message);
  }
}

loadStudents();

window.editStudent = function(id) {
    window.location.href = "addstudent.html?id=" + id;
}

window.deleteStudent = async function(id) {
  if (!confirm("Delete this student?")) return;

  try {
    await deleteDoc(doc(db, "students", id));
    alert("Student Deleted Successfully");
    loadStudents();
  } catch (e) {
    alert("Error: " + e.message);
  }
}
