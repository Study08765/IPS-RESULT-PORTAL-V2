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

  const status =
data.published ? "🟢 Published" : "🔴 Hidden";

document.getElementById("publishStatus").innerHTML = status;

const statusText = document.getElementById("publishStatusText");

if(statusText){
statusText.innerHTML = status;
}

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

  try {

    await updateDoc(resultRef, {
      published: false,
      publishDate: "Not Published"
    });

    alert("🔴 Result Hidden Successfully");

    loadPublishStatus();

  } catch (e) {

    alert("Error: " + e.message);

  }

};

loadPublishStatus();
const portalRef = doc(db, "settings", "portal");

async function loadPortalSettings() {

  const snap = await getDoc(portalRef);

  if (snap.exists()) {

    const data = snap.data();

    document.getElementById("examTitle").value = data.examTitle;
    document.getElementById("sessionTitle").value = data.session;

  }

}

window.savePortalSettings = async function () {

  await updateDoc(portalRef, {
    examTitle: document.getElementById("examTitle").value,
    session: document.getElementById("sessionTitle").value
  });

  alert("✅ Portal Settings Updated");

};

loadPortalSettings();
const noticeRef = doc(db, "settings", "notice");

async function loadNotice() {
  const snap = await getDoc(noticeRef);

  if (snap.exists()) {
    document.getElementById("noticeText").value = snap.data().text || "";
  }
}

window.saveNotice = async function () {
  await updateDoc(noticeRef, {
    text: document.getElementById("noticeText").value
  });

  alert("📢 Notice Saved Successfully");
};

loadNotice();
const countdownRef = doc(db, "settings", "countdown");

window.saveCountdown = async function () {
  const date = document.getElementById("countdownDate").value;
  const time = document.getElementById("countdownTime").value;

  if (!date || !time) {
    alert("Select Date & Time");
    return;
  }

  await setDoc(countdownRef, {
    date: date,
    time: time
  });

  alert("⏳ Countdown Saved Successfully");
};
window.enableCountdown = async function () {

  await updateDoc(countdownRef, {
    enabled: true
  });

  alert("🟢 Countdown Enabled");

};

window.disableCountdown = async function () {

  await updateDoc(countdownRef, {
    enabled: false
  });

  alert("🔴 Countdown Disabled");

};
// Admit Card Release
window.toggleAdmitCard = async function () {

  const snap = await getDoc(portalRef);

  let status = false;

  if (snap.exists()) {
    status = snap.data().admitCardRelease || false;
  }

  await updateDoc(portalRef, {
    admitCardRelease: !status
  });

  document.getElementById("admitStatus").innerHTML =
    !status ? "🟢 Released" : "🔴 Hidden";

  alert(!status
    ? "✅ Admit Card Released Successfully"
    : "🔴 Admit Card Hidden Successfully");

};

async function loadAdmitStatus() {

  const snap = await getDoc(portalRef);

  if (snap.exists()) {

    document.getElementById("admitStatus").innerHTML =
snap.data().admitCardRelease
? "🟢 Released"
: "🔴 Hidden";

  }

}

loadAdmitStatus();
// ================= Maintenance Mode =================

const maintenanceOn = document.getElementById("maintenanceOn");
const maintenanceOff = document.getElementById("maintenanceOff");

if (maintenanceOn) {
  maintenanceOn.onclick = async function () {

    alert("ON Button Click");

    await setDoc(doc(db, "portal_settings", "system"), {
      maintenance: true
    }, { merge: true });

    alert("🚧 Maintenance ON");
  };
}

if (maintenanceOff) {
  maintenanceOff.onclick = async function () {

    alert("OFF Button Click");

    await setDoc(doc(db, "portal_settings", "system"), {
      maintenance: false
    }, { merge: true });

    alert("✅ Maintenance OFF");
  };
}
