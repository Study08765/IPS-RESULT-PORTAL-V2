import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Dashboard Statistics
async function loadDashboard() {

  const snapshot = await getDocs(collection(db, "students_v2"));

  let totalStudents = 0;
  let topper = "";
  let topperPercentage = 0;

  snapshot.forEach((studentDoc) => {

    totalStudents++;

    const s = studentDoc.data();

    let total = 0;
    let full = 0;

    if (s.Subjects) {

      s.Subjects.forEach(sub => {

        total += Number(sub.obtained);
        full += Number(sub.full);

      });

    }

    const percentage =
      full > 0 ? (total / full) * 100 : 0;

    if (percentage > topperPercentage) {

      topperPercentage = percentage;
      topper = s.Name;

    }

  });

  document.getElementById("totalStudents").innerHTML =
    totalStudents;

  document.getElementById("topper").innerHTML =
    topper + " (" + topperPercentage.toFixed(2) + "%)";

}

loadDashboard();


// Result Publish System

const resultRef = doc(db, "settings", "result");

async function loadPublishStatus() {

  const snap = await getDoc(resultRef);

  if (!snap.exists()) {

    await setDoc(resultRef, {

      published: false,

      publishDate: "Not Published"

    });

    return loadPublishStatus();

  }

  const data = snap.data();

  document.getElementById("publishStatus").innerHTML =
    data.published ? "🟢 Published" : "🔴 Hidden";

}
window.publishResult = async function () {

  await updateDoc(resultRef, {
    published: true,
    publishDate: new Date().toLocaleString("en-IN")
  });

  alert("✅ Result Published Successfully");

  loadPublishStatus();

};

window.hideResult = async function () {

  await updateDoc(resultRef, {
    published: false,
    publishDate: "Not Published"
  });

  alert("🔴 Result Hidden Successfully");

  loadPublishStatus();

};

loadPublishStatus();
