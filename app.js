import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
async function loadPortalHeader() {

  const portalRef = doc(db, "settings", "portal");
  const portalSnap = await getDoc(portalRef);

  if (portalSnap.exists()) {
    const data = portalSnap.data();

    document.getElementById("examTitle").innerHTML = data.examTitle;
    document.getElementById("sessionTitle").innerHTML = "RESULT " + data.session;
  }

}

loadPortalHeader();
const noticeRef = doc(db, "settings", "notice");

async function loadNotice() {

  const snap = await getDoc(noticeRef);

  if (snap.exists() && snap.data().enabled) {

    document.getElementById("noticeBox").style.display = "block";

    document.getElementById("noticeTextShow").innerText =
      snap.data().text;

  }

}

loadNotice();
const countdownRef = doc(db, "settings", "countdown");

async function loadCountdown() {
  const snap = await getDoc(countdownRef);
if (!snap.exists()) return;

if (snap.data().enabled === false) {
  document.getElementById("countdown").style.display = "none";
  return;
}

document.getElementById("countdown").style.display = "block";
  if (!snap.exists()) return;

  const end = new Date(
    snap.data().date + "T" + snap.data().time
  ).getTime();

  setInterval(() => {
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      document.getElementById("countdown").innerHTML = "🎉 RESULT RELEASED";
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    document.getElementById("countdown").innerHTML =
      `⏳ ${d}d ${h}h ${m}m ${s}s`;
  }, 1000);
}

loadCountdown();
async function loadResultLive() {

  const publishRef = doc(db, "settings", "result");
  const publishSnap = await getDoc(publishRef);

  if (!publishSnap.exists()) return;

  const box = document.getElementById("resultLive");

  box.style.display = "block";

  if (publishSnap.data().published) {

  box.style.background = "#198754";
  box.innerHTML = "🟢 RESULT LIVE";
  box.style.animation = "blink 1s infinite";

} else {

  box.style.background = "linear-gradient(135deg,#ff9800,#ff5722)";
box.style.color = "#fff";
box.style.borderRadius = "14px";
box.style.padding = "14px";
box.style.fontWeight = "700";
box.style.letterSpacing = "1px";
box.style.boxShadow = "0 8px 20px rgba(255,87,34,.35)";
box.innerHTML = "📅 RESULT WILL BE PUBLISHED SOON";
box.style.animation = "blink 1s infinite";

  }

}

loadResultLive();
window.searchResult = async function () {
  alert("searchResult started");
  try {
const maintenanceRef = doc(db, "portal_settings", "system");
const maintenanceSnap = await getDoc(maintenanceRef);

if (
  maintenanceSnap.exists() &&
  maintenanceSnap.data().maintenance === true
) {

  document.getElementById("result").innerHTML = `
  <div style="
    background:#fff3cd;
    border:2px solid #ffc107;
    padding:25px;
    border-radius:12px;
    text-align:center;
  ">
    <h2 style="color:#dc3545;">🚧 SITE UNDER MAINTENANCE</h2>

    <p style="font-size:18px;">
      Result is being updated.<br>
      Please try again after some time.
    </p>
  </div>
  `;

  return;
}
  const roll = document.getElementById("roll").value.trim().padStart(4, "0");

  if (!roll) {
    alert("Enter Roll Number");
    return;
  }
const publishRef = doc(db, "settings", "result");
const publishSnap = await getDoc(publishRef);
alert("Publish Exists = " + publishSnap.exists());
if (
  publishSnap.exists() &&
  publishSnap.data().published === false
) {
  document.getElementById("result").innerHTML = `
    <div style="background:#fff;border:2px solid red;padding:20px;border-radius:10px;text-align:center;">
      <h2 style="color:red;">⚠️ RESULT NOT PUBLISHED</h2>
      <p>Please contact IPS PUBLIC SCHOOL.</p>
    </div>
  `;
  return;
}
  
  alert("Roll = " + roll);
  const ref = doc(db, "students_v2", roll);
  const snap = await getDoc(ref);
alert("Document Exists = " + snap.exists());
  if (!snap.exists()) {

    document.getElementById("result").innerHTML =
      "<h2 style='color:red;text-align:center'>Result Not Found</h2>";

    return;

  }

  const s = snap.data();
  const selectedClass = document.getElementById("class").value.replace("Class ", "");

if (s.Class !== selectedClass) {
  document.getElementById("result").innerHTML = `
    <h2 style="color:red;text-align:center">
      ❌ Class and Roll Number do not match
    </h2>
  `;
  return;
}
  let classRank = 1;

const allStudents = await getDocs(collection(db, "students_v2"));

let classStudents = [];

allStudents.forEach(d => {

  const st = d.data();

  if (st.Class == s.Class) {

    classStudents.push(st);

  }

});

classStudents.sort((a, b) =>
  Number(b.Percentage || 0) - Number(a.Percentage || 0)
);

classRank =
  classStudents.findIndex(x => x.Roll == s.Roll) + 1;
document.getElementById("examTitle").innerHTML = s.ExamType;
document.getElementById("sessionTitle").innerHTML = "RESULT " + s.Session;
  let total = 0;
  let fullTotal = 0;

  let rows = "";

  if (s.Subjects) {

    s.Subjects.forEach(sub => {

      total += Number(sub.obtained);
      fullTotal += Number(sub.full);

const failMark = Number(sub.obtained) < (Number(sub.full) * 0.33);
rows += `
<tr>
<td>${sub.name} ${failMark ? "<span style='color:red;font-weight:bold'>(F)</span>" : ""}</td>
<td>${sub.full}</td>
<td>${sub.obtained}</td>
</tr>
`;

    });

  }

  const percentage = s.Percentage || "0.00";
const grade = s.Grade || "-";
const division = s.Division || "-";
const resultStatus = s.Result || "-";

  document.getElementById("result").innerHTML = `

<div class="result-card">

<div class="result-header">

<h2>🏫 IPS PUBLIC SCHOOL</h2>

<h3>AHIRORI HARDOI</h3>

<h4 style="color:#0b3d91;">
${s.ExamType}
</h4>

<h4 style="color:#666;">
RESULT ${s.Session}
</h4>

</div>

<div class="info-grid">

<div class="info-box">
<b>🎓 Roll No :</b><br>${s.Roll}
</div>

<div class="info-box">
<b>👨‍🎓 Student :</b><br>${s.Name}
</div>

<div class="info-box">
<b>👨 Father :</b><br>${s.Father}
</div>

<div class="info-box">
<b>🏫 Class :</b><br>${s.Class}${s.Section ? " (" + s.Section + ")" : ""}
</div>

</div>

<hr>


<table class="resultTable">

<tr>

<th>Subject</th>

<th>Full Marks</th>

<th>Obtained</th>

</tr>

${rows}

</table>

<br>

<div class="summary">

<div>
<h3>${total}</h3>
<p>Total Marks</p>
</div>

<div>
<h3>${percentage}%</h3>
<p>Percentage</p>
</div>

<div>
<h3>${grade}</h3>
<p>Grade</p>
</div>
<div>
<h3>${classRank}</h3>
<p>Class Rank</p>
</div>
<div class="${resultStatus==="PASS"?"pass":"fail"}">
<h3>${resultStatus}</h3>
<p>Result</p>
</div>

</div>

<br>

<div style="text-align:center;
background:#f8f9fa;
padding:12px;
border-radius:10px;
font-weight:bold;
color:#555;">

🏆 Division : ${division}

</div>

<button onclick="window.print()">

🖨️ Print Result

</button>

</div>

`;

}
