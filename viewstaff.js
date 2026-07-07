import { db } from "./firebase.js";

import {
  collection,
  getDocs
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

      <button class="edit">✏️ Edit</button>

      <button class="delete">🗑️ Delete</button>

    </div>
    `;

  });

  if (html === "") {
    html = "<h3 align='center'>No Staff Found</h3>";
  }

  staffList.innerHTML = html;

}

loadStaff();
