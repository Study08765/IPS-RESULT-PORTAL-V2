import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ================= PORTAL HEADER ================= */

async function loadPortalHeader() {

  const portalRef = doc(db, "settings", "portal");
  const portalSnap = await getDoc(portalRef);

  if (portalSnap.exists()) {

    const data = portalSnap.data();

    const examTitle =
      document.getElementById("examTitle");

    const sessionTitle =
      document.getElementById("sessionTitle");

    if (examTitle) {
      examTitle.innerHTML =
        data.examTitle || "";
    }

    if (sessionTitle) {
      sessionTitle.innerHTML =
        "RESULT " + (data.session || "");
    }

  }

}

loadPortalHeader();


/* ================= NOTICE ================= */

const noticeRef =
  doc(db, "settings", "notice");


async function loadNotice() {

  const snap =
    await getDoc(noticeRef);

  if (
    snap.exists() &&
    snap.data().enabled
  ) {

    const noticeBox =
      document.getElementById("noticeBox");

    const noticeTextShow =
      document.getElementById("noticeTextShow");


    if (noticeBox) {
      noticeBox.style.display = "block";
    }


    if (noticeTextShow) {
      noticeTextShow.innerText =
        snap.data().text || "";
    }

  }

}

loadNotice();


/* ================= COUNTDOWN ================= */

const countdownRef =
  doc(db, "settings", "countdown");


async function loadCountdown() {

  const snap =
    await getDoc(countdownRef);


  if (!snap.exists()) {
    return;
  }


  if (
    snap.data().enabled === false
  ) {

    const countdown =
      document.getElementById("countdown");

    if (countdown) {
      countdown.style.display = "none";
    }

    return;
  }


  const countdown =
    document.getElementById("countdown");


  if (!countdown) {
    return;
  }


  countdown.style.display = "block";


  const end =
    new Date(
      snap.data().date +
      "T" +
      snap.data().time
    ).getTime();


  setInterval(() => {

    const now =
      Date.now();


    const diff =
      end - now;


    if (diff <= 0) {

      countdown.innerHTML =
        "🎉 RESULT RELEASED";

      return;

    }


    const d =
      Math.floor(
        diff /
        (1000 * 60 * 60 * 24)
      );


    const h =
      Math.floor(
        (diff /
          (1000 * 60 * 60)) % 24
      );


    const m =
      Math.floor(
        (diff /
          (1000 * 60)) % 60
      );


    const s =
      Math.floor(
        (diff / 1000) % 60
      );


    countdown.innerHTML =
      `⏳ ${d}d ${h}h ${m}m ${s}s`;


  }, 1000);

}

loadCountdown();


/* ================= RESULT LIVE ================= */

async function loadResultLive() {

  const publishRef =
    doc(db, "settings", "result");


  const publishSnap =
    await getDoc(publishRef);


  if (!publishSnap.exists()) {
    return;
  }


  const box =
    document.getElementById("resultLive");


  if (!box) {
    return;
  }


  box.style.display =
    "block";


  if (
    publishSnap.data().published
  ) {

    box.style.background =
      "#198754";

    box.innerHTML =
      "🟢 RESULT LIVE";

    box.style.animation =
      "blink 1s infinite";


  } else {

    box.style.background =
      "linear-gradient(135deg,#ff9800,#ff5722)";

    box.style.color =
      "#fff";

    box.style.borderRadius =
      "14px";

    box.style.padding =
      "14px";

    box.style.fontWeight =
      "700";

    box.style.letterSpacing =
      "1px";

    box.style.boxShadow =
      "0 8px 20px rgba(255,87,34,.35)";

    box.innerHTML =
      "📅 RESULT WILL BE PUBLISHED SOON";

    box.style.animation =
      "blink 1s infinite";

  }

}

loadResultLive();


/* ================================================= */
/*                 SEARCH RESULT                     */
/* ================================================= */

window.searchResult =
  async function () {

  try {

    /* ================= MAINTENANCE ================= */

    const maintenanceRef =
      doc(
        db,
        "portal_settings",
        "system"
      );


    const maintenanceSnap =
      await getDoc(
        maintenanceRef
      );


    if (
      maintenanceSnap.exists() &&
      maintenanceSnap.data().maintenance === true
    ) {

      const resultBox =
        document.getElementById("result");


      if (resultBox) {

        resultBox.innerHTML = `

          <div style="
            background:#fff3cd;
            border:2px solid #ffc107;
            padding:25px;
            border-radius:12px;
            text-align:center;
          ">

            <h2 style="color:#dc3545;">
              🚧 SITE UNDER MAINTENANCE
            </h2>

            <p style="font-size:18px;">
              Result is being updated.<br>
              Please try again after some time.
            </p>

          </div>

        `;

      }

      return;

    }


    /* ================= ROLL NUMBER ================= */

    const rollElement =
      document.getElementById("roll");


    const classElement =
      document.getElementById("class");


    if (!rollElement) {

      alert(
        "Roll Number field not found."
      );

      return;

    }


    if (!classElement) {

      alert(
        "Class field not found."
      );

      return;

    }


    const roll =
      rollElement.value
        .trim()
        .padStart(4, "0");


    if (!roll) {

      alert(
        "Enter Roll Number"
      );

      return;

    }


    /* ================= CLASS ================= */

    const selectedClass =
      classElement.value
        .replace("Class ", "")
        .trim();


    if (!selectedClass) {

      alert(
        "Please Select Class"
      );

      return;

    }


    /* ================= RESULT PUBLISH ================= */

    const publishRef =
      doc(
        db,
        "settings",
        "result"
      );


    const publishSnap =
      await getDoc(
        publishRef
      );


    if (
      publishSnap.exists() &&
      publishSnap.data().published === false
    ) {

      const resultBox =
        document.getElementById("result");


      if (resultBox) {

        resultBox.innerHTML = `

          <div style="
            background:#fff;
            border:2px solid red;
            padding:20px;
            border-radius:10px;
            text-align:center;
          ">

            <h2 style="color:red;">
              ⚠️ RESULT NOT PUBLISHED
            </h2>

            <p>
              Please contact IPS PUBLIC SCHOOL.
            </p>

          </div>

        `;

      }

      return;

    }


    /* ================= FIND STUDENT ================= */

    const ref =
      doc(
        db,
        "students_v2",
        roll
      );


    const snap =
      await getDoc(ref);


    if (!snap.exists()) {

      const resultBox =
        document.getElementById("result");


      if (resultBox) {

        resultBox.innerHTML =
          `
          <h2 style="
            color:red;
            text-align:center;
          ">
            Result Not Found
          </h2>
          `;

      }

      return;

    }


    const s =
      snap.data();


    /* ================= CLASS MATCH ================= */

    if (
      String(s.Class) !==
      String(selectedClass)
    ) {

      const resultBox =
        document.getElementById("result");


      if (resultBox) {

        resultBox.innerHTML = `

          <h2 style="
            color:red;
            text-align:center;
          ">

            ❌ Class and Roll Number
            do not match

          </h2>

        `;

      }

      return;

    }


    /* ================================================= */
    /*       IMPORTANT: OPEN RESULT ON SEPARATE PAGE     */
    /* ================================================= */

    /*
      Result Card अब यहाँ नहीं बनाया जाएगा।

      Search सफल होने के बाद:
      result-page.html खुलेगा।

      Roll और Class URL में भेजे जा रहे हैं।
    */


    const params =
      new URLSearchParams();


    params.set(
      "roll",
      s.Roll || roll
    );


    params.set(
      "class",
      s.Class || selectedClass
    );


    window.location.href =
      "result-page.html?" +
      params.toString();


    return;


  } catch (e) {

    console.error(
      "Search Result Error:",
      e
    );


    alert(
      e.message ||
      "Something went wrong."
    );

  }

};
