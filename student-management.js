import { db } from "./firebase.js";
import {
  collection,
  addDoc
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

    document.querySelectorAll("input").forEach(input => input.value = "");

  } catch (error) {

    alert(error.message);

  }

});
