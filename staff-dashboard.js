import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const staffId = localStorage.getItem("staffLogin");

if (!staffId) {
  location.href = "staff-login.html";
}

const snap = await getDoc(doc(db, "staff", staffId));

if (!snap.exists()) {
  alert("Staff Not Found");
  location.href = "staff-login.html";
}

const staff = snap.data();

document.getElementById("staffName").innerHTML =
"👨‍🏫 " + staff.name;

document.getElementById("staffClass").innerHTML =
"📚 Assigned Class : " + staff.class;
