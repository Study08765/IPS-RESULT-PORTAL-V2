import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const staffList = document.getElementById("staffList");

async function loadStaff() {

  staffList.innerHTML = "<h3 align='center'>Loading...</h3>";

  const snap = await getDocs(collection(db, "staff"));

  let html = "";

  snap.forEach(doc => {

    const s = doc.data();

    html += `
    <div class="card">

      <h3>${s.name}</h3>

      <p><b>Staff ID:</b> ${s.staffId}</p>

      <p><b>Class:</b> ${s.class}</p>

      <p><b>Mobile:</b> ${s.mobile}</p>

      <button class="edit"
onclick="location.href='editstaff.html?id=${s.staffId}'">
✏️ Edit
</button>

  <button class="delete"
onclick="deleteStaff('${s.staffId}')">
🗑️ Delete
</button>

    </div>
    `;

  });

  if (html === "") {
    html = "<h3 align='center'>No Staff Found</h3>";
  }

  staffList.innerHTML = html;

}

loadStaff();
window.deleteStaff = async function(staffId){

const ok = confirm("Delete this staff?");

if(!ok) return;

await deleteDoc(doc(db,"staff",staffId));

alert("✅ Staff Deleted Successfully");

loadStaff();

}
