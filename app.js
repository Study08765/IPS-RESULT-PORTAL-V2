import { db } from "./firebase.js";
import {
  doc,
  getDoc
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

  box.style.background = "#dc3545";
  box.innerHTML = "🔴 RESULT NOT DECLARED";
  box.style.animation = "none";

  }

}

loadResultLive();
window.searchResult = async function () {

  const roll = document.getElementById("roll").value.trim();

  if (!roll) {
    alert("Enter Roll Number");
    return;
  }
const publishRef = doc(db, "settings", "result");
const publishSnap = await getDoc(publishRef);

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
  const ref = doc(db, "students_v2", roll);
  const snap = await getDoc(ref);

  if (!snap.exists()) {

    document.getElementById("result").innerHTML =
      "<h2 style='color:red;text-align:center'>Result Not Found</h2>";

    return;

  }

  const s = snap.data();
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

<div style="background:#fff;border:2px solid #0b3d91;border-radius:10px;padding:15px;">

<h2 style="text-align:center;color:#0b3d91;">
IPS PUBLIC SCHOOL
</h2>

<h3 style="text-align:center;">
AHIRORI HARDOI
</h3>

<h3 style="text-align:center;">
${s.ExamType}
</h3>

<h3 style="text-align:center;">
RESULT ${s.Session}
</h3>

<hr>

<p><b>Roll No :</b> ${s.Roll}</p>

<p><b>Name :</b> ${s.Name}</p>

<p><b>Father :</b> ${s.Father}</p>

<p><b>Class :</b> ${s.Class}</p>

<p><b>Section :</b> ${s.Section}</p>

<table border="1" width="100%" cellspacing="0" cellpadding="8">

<tr>

<th>Subject</th>

<th>Full Marks</th>

<th>Obtained</th>

</tr>

${rows}

</table>

<br>

<p><b>Total :</b> ${total} / ${fullTotal}</p>

<p><b>Percentage :</b> ${percentage}%</p>

<p><b>Grade :</b> ${grade}</p>
<p><b>Division :</b> ${division}</p>
<p style="font-size:22px;color:${resultStatus==="PASS"?"green":"red"}">

<b>${resultStatus}</b>

</p>

<button onclick="window.print()">

🖨️ Print Result

</button>

</div>

`;

}
