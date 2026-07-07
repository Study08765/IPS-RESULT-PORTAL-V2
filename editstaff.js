import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);
const staffIdFromUrl = params.get("id");

window.addEventListener("DOMContentLoaded", () => {
  if (staffIdFromUrl) {
    document.getElementById("staffId").value = staffIdFromUrl;
    loadStaff();
  }
});
window.loadStaff = async function () {

  const staffId = document.getElementById("staffId").value.trim();

  if (!staffId) {
    alert("Enter Staff ID");
    return;
  }

  const ref = doc(db, "staff", staffId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Staff Not Found");
    return;
  }

  const s = snap.data();

  document.getElementById("staffName").value = s.name;
  document.getElementById("mobile").value = s.mobile;
  document.getElementById("password").value = s.password;
  document.getElementById("staffClass").value = s.class;
};

window.updateStaff = async function () {

  const staffId = document.getElementById("staffId").value.trim();

  await updateDoc(doc(db, "staff", staffId), {
    name: document.getElementById("staffName").value,
    mobile: document.getElementById("mobile").value,
    password: document.getElementById("password").value,
    class: document.getElementById("staffClass").value
  });

  alert("✅ Staff Updated Successfully");
};
