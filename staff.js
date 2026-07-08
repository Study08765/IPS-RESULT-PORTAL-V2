import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.staffLogin = async function () {

  const staffId = document.getElementById("staffId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!staffId || !password) {
    alert("Enter Staff ID and Password");
    return;
  }

  const ref = doc(db, "staff", staffId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Staff ID not found");
    return;
  }

  const data = snap.data();

  if (data.enabled === false) {
    alert("Staff account is disabled");
    return;
  }

  if (data.password !== password) {
    alert("Wrong Password");
    return;
  }

  localStorage.removeItem("adminLogin");
localStorage.setItem("staffLogin", staffId);

window.location.href = "staff-dashboard.html";

};
