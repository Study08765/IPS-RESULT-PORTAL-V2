import { db } from "./firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("saveBtn").addEventListener("click", async () => {

  try {

    await addDoc(collection(db, "homework"), {
      class: document.getElementById("class").value,
      subject: document.getElementById("subject").value,
      date: document.getElementById("date").value,
      homework: document.getElementById("homework").value,
      createdAt: new Date()
    });

    alert("✅ Homework Saved Successfully");

  } catch (e) {
    alert("❌ Error: " + e.message);
  }

});
