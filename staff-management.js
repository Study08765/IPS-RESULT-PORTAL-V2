import { db } from "./firebase.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.saveStaff = async function () {

  const staffId = document.getElementById("staffId").value.trim();
  const staffName = document.getElementById("staffName").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();
  const staffClass = document.getElementById("staffClass").value;

  if (!staffId || !staffName || !password || !staffClass) {
    alert("Please fill all required fields");
    return;
  }

  await setDoc(doc(db, "staff", staffId), {
    staffId: staffId,
    name: staffName,
    mobile: mobile,
    password: password,
    class: staffClass,
    enabled: true
  });

  alert("✅ Staff Saved Successfully");

  document.getElementById("staffId").value = "";
  document.getElementById("staffName").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("password").value = "";
  document.getElementById("staffClass").value = "";
};
