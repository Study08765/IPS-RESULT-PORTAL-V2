import { db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   PORTAL HEADER
===================================================== */

async function loadPortalHeader() {

  try {

    const portalRef =
      doc(db, "settings", "portal");

    const portalSnap =
      await getDoc(portalRef);

    if (portalSnap.exists()) {

      const data =
        portalSnap.data();

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
          "RESULT " +
          (data.session || "");

      }

    }

  } catch (error) {

    console.error(
      "Portal Header Error:",
      error
    );

  }

}

loadPortalHeader();



/* =====================================================
   NOTICE
===================================================== */

const noticeRef =
  doc(db, "settings", "notice");


async function loadNotice() {

  try {

    const snap =
      await getDoc(noticeRef);


    if (
      snap.exists() &&
      snap.data().enabled
    ) {

      const noticeBox =
        document.getElementById("noticeBox");

      const noticeTextShow =
        document.getElementById(
          "noticeTextShow"
        );


      if (noticeBox) {

        noticeBox.style.display =
          "block";

      }


      if (noticeTextShow) {

        noticeTextShow.innerText =
          snap.data().text || "";

      }

    }

  } catch (error) {

    console.error(
      "Notice Error:",
      error
    );

  }

}

loadNotice();



/* =====================================================
   COUNTDOWN
===================================================== */

const countdownRef =
  doc(db, "settings", "countdown");


async function loadCountdown() {

  try {

    const snap =
      await getDoc(countdownRef);


    if (!snap.exists()) {

      return;

    }


    const countdown =
      document.getElementById(
        "countdown"
      );


    if (!countdown) {

      return;

    }


    if (
      snap.data().enabled === false
    ) {

      countdown.style.display =
        "none";

      return;

    }


    countdown.style.display =
      "block";


    const data =
      snap.data();


    if (
      !data.date ||
      !data.time
    ) {

      return;

    }


    const end =
      new Date(
        data.date +
        "T" +
        data.time
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
          (
            diff /
            (1000 * 60 * 60)
          ) % 24
        );


      const m =
        Math.floor(
          (
            diff /
            (1000 * 60)
          ) % 60
        );


      const s =
        Math.floor(
          (
            diff /
            1000
          ) % 60
        );


      countdown.innerHTML =
        `⏳ ${d}d ${h}h ${m}m ${s}s`;


    }, 1000);

  } catch (error) {

    console.error(
      "Countdown Error:",
      error
    );

  }

}

loadCountdown();



/* =====================================================
   RESULT LIVE
===================================================== */

async function loadResultLive() {

  try {

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


    if (!publishSnap.exists()) {

      return;

    }


    const box =
      document.getElementById(
        "resultLive"
      );


    if (!box) {

      return;

    }


    box.style.display =
      "block";


    if (
      publishSnap.data().published === true
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

  } catch (error) {

    console.error(
      "Result Live Error:",
      error
    );

  }

}

loadResultLive();



/* =====================================================
   SEARCH RESULT
===================================================== */

window.searchResult =
  async function () {

  try {


    /* =================================================
       MAINTENANCE CHECK
    ================================================= */

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
        document.getElementById(
          "result"
        );


      if (resultBox) {

        resultBox.innerHTML = `

          <div style="
            background:#fff3cd;
            border:2px solid #ffc107;
            padding:25px;
            border-radius:12px;
            text-align:center;
          ">

            <h2 style="
              color:#dc3545;
              margin-bottom:10px;
            ">
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



    /* =================================================
       GET INPUT ELEMENTS
    ================================================= */

    const rollElement =
      document.getElementById(
        "roll"
      );


    const classElement =
      document.getElementById(
        "class"
      );


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



    /* =================================================
       EXACT ROLL NUMBER
    ================================================= */

    /*
      IMPORTANT:

      Roll Number को बदला नहीं जाएगा।

      001 रहेगा 001
      01 रहेगा 01
      1 रहेगा 1
      0001 रहेगा 0001

      कोई padStart नहीं।
      कोई automatic conversion नहीं।
    */

    const roll =
      rollElement.value.trim();


    if (!roll) {

      alert(
        "Enter Roll Number"
      );

      return;

    }



    /* =================================================
       CLASS
    ================================================= */

    const selectedClass =
      classElement.value
        .replace(
          /^Class\s*/i,
          ""
        )
        .trim();


    if (!selectedClass) {

      alert(
        "Please Select Class"
      );

      return;

    }



    /* =================================================
       RESULT PUBLISH CHECK
    ================================================= */

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
        document.getElementById(
          "result"
        );


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



    /* =================================================
       FIND STUDENT BY EXACT DOCUMENT ID
    ================================================= */

    /*
      Firestore:

      students_v2
        └── 001

      अगर user ने 001 डाला है,
      तो केवल document "001" ही search होगा।

      1 डालने पर document "1" search होगा।
      01 डालने पर document "01" search होगा।

      कोई दूसरा Roll Number automatically नहीं खोजा जाएगा।
    */

    const studentRef =
      doc(
        db,
        "students_v2",
        roll
      );


    const studentSnap =
      await getDoc(
        studentRef
      );



    /* =================================================
       ROLL NUMBER NOT FOUND
    ================================================= */

    if (!studentSnap.exists()) {

      const resultBox =
        document.getElementById(
          "result"
        );


      if (resultBox) {

        resultBox.innerHTML = `

          <div style="
            background:#fff;
            border:2px solid #dc3545;
            padding:22px;
            border-radius:15px;
            text-align:center;
          ">

            <h2 style="
              color:#dc3545;
              margin-bottom:8px;
            ">
              ❌ RESULT NOT FOUND
            </h2>

            <p style="
              color:#555;
              font-size:15px;
            ">
              Roll Number
              <strong>${roll}</strong>
              was not found.
            </p>

          </div>

        `;

      }

      return;

    }



    /* =================================================
       STUDENT DATA
    ================================================= */

    const student =
      studentSnap.data();



    /* =================================================
       EXACT ROLL FIELD MATCH
    ================================================= */

    const firestoreRoll =
      String(
        student.Roll ?? ""
      ).trim();


    /*
      Document ID और Roll field
      दोनों exact match होने चाहिए।
    */

    if (
      firestoreRoll !== roll
    ) {

      const resultBox =
        document.getElementById(
          "result"
        );


      if (resultBox) {

        resultBox.innerHTML = `

          <div style="
            background:#fff;
            border:2px solid #dc3545;
            padding:22px;
            border-radius:15px;
            text-align:center;
          ">

            <h2 style="
              color:#dc3545;
            ">
              ❌ INVALID ROLL NUMBER
            </h2>

            <p>
              Roll Number does not match
              the student record.
            </p>

          </div>

        `;

      }

      return;

    }



    /* =================================================
       EXACT CLASS MATCH
    ================================================= */

    const firestoreClass =
      String(
        student.Class ?? ""
      )
      .replace(
        /^Class\s*/i,
        ""
      )
      .trim();


    if (
      firestoreClass !==
      selectedClass
    ) {

      const resultBox =
        document.getElementById(
          "result"
        );


      if (resultBox) {

        resultBox.innerHTML = `

          <div style="
            background:#fff;
            border:2px solid #dc3545;
            padding:22px;
            border-radius:15px;
            text-align:center;
          ">

            <h2 style="
              color:#dc3545;
              margin-bottom:10px;
            ">
              ❌ CLASS & ROLL NUMBER NOT MATCH
            </h2>

            <p style="
              color:#555;
              font-size:15px;
            ">
              Please check your Class and
              Roll Number.
            </p>

          </div>

        `;

      }

      return;

    }



    /* =================================================
       OPEN RESULT PAGE
    ================================================= */

    const params =
      new URLSearchParams();


    /*
      Exact Roll Number भेजेंगे।
      001 → 001
    */

    params.set(
      "roll",
      roll
    );


    /*
      Exact Class भेजेंगे।
      6 → 6
    */

    params.set(
      "class",
      selectedClass
    );


    window.location.href =
      "result-page.html?" +
      params.toString();


  } catch (error) {

    console.error(
      "Search Result Error:",
      error
    );


    alert(
      error.message ||
      "Something went wrong."
    );

  }

};
