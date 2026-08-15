import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ================= URL PARAMETERS ================= */

const params =
  new URLSearchParams(window.location.search);

const roll =
  params.get("roll");

const selectedClass =
  params.get("class");

const resultBox =
  document.getElementById("result");


/* ================= ERROR ================= */

function showError(message) {

  resultBox.innerHTML = `

    <div class="error-box">

      <h2>⚠️ ${message}</h2>

      <p>
        Please check your details and try again.
      </p>

      <button
        onclick="history.back()"
        style="
          background:#0b3d91;
          color:#fff;
          border:none;
          padding:12px 25px;
          border-radius:8px;
          font-size:16px;
          cursor:pointer;
        "
      >
        ← Back
      </button>

    </div>

  `;
}


/* ================= LOAD RESULT ================= */

async function loadResult() {

  try {

    if (!roll) {

      showError("Roll Number Missing");

      return;
    }


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

      showError(
        "SITE UNDER MAINTENANCE"
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

      showError(
        "RESULT NOT PUBLISHED"
      );

      return;
    }


    /* ================= STUDENT ================= */

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


    if (!studentSnap.exists()) {

      showError(
        "Result Not Found"
      );

      return;
    }


    const s =
      studentSnap.data();


    /* ================= CLASS CHECK ================= */

    if (
      selectedClass &&
      String(s.Class) !==
      String(selectedClass)
    ) {

      showError(
        "Class and Roll Number do not match"
      );

      return;
    }


    /* ================= CLASS RANK ================= */

    const allStudents =
      await getDocs(
        collection(
          db,
          "students_v2"
        )
      );


    let classStudents = [];


    allStudents.forEach(
      d => {

        const st =
          d.data();


        if (
          String(st.Class) ===
          String(s.Class)
        ) {

          classStudents.push(st);

        }

      }
    );


    classStudents.sort(
      (a, b) =>
        Number(b.Percentage || 0) -
        Number(a.Percentage || 0)
    );


    let classRank = 1;


    const rankIndex =
      classStudents.findIndex(
        x =>
          String(x.Roll) ===
          String(s.Roll)
      );


    if (rankIndex >= 0) {

      classRank =
        rankIndex + 1;

    }


    /* ================= SUBJECTS ================= */

    let total = 0;

    let rows = "";


    if (Array.isArray(s.Subjects)) {

      s.Subjects.forEach(
        sub => {

          const obtained =
            Number(
              sub.obtained || 0
            );


          const full =
            Number(
              sub.full || 0
            );


          total += obtained;


          const failMark =
            obtained <
            (full * 0.33);


          rows += `

            <tr>

              <td>

                ${sub.name || "-"}

                ${
                  failMark
                  ?
                  "<span style='color:red;font-weight:bold'>(F)</span>"
                  :
                  ""
                }

              </td>

              <td>
                ${full}
              </td>

              <td>
                ${obtained}
              </td>

            </tr>

          `;

        }
      );

    }


    /* ================= RESULT DATA ================= */

    const percentage =
      s.Percentage || "0.00";


    const grade =
      s.Grade || "-";


    const division =
      s.Division || "-";


    const resultStatus =
      s.Result || "-";


    const isPass =
      String(resultStatus)
        .toUpperCase()
        .trim() === "PASS";


    /* ================= SUCCESS MESSAGE ================= */

    const resultMessage = isPass

      ? `

        <div style="
          margin-top:20px;
          padding:14px;
          border-radius:12px;
          text-align:center;
          background:#e8f7ed;
          color:#198754;
          font-weight:600;
        ">

          🎉 <strong>Congratulations on your success!</strong>
          Keep working hard and keep shining.
          Wishing you a bright and successful future!

        </div>

      `

      : `

        <div style="
          margin-top:20px;
          padding:14px;
          border-radius:12px;
          text-align:center;
          background:#fff3f3;
          color:#dc3545;
          font-weight:600;
        ">

          🌟 <strong>Keep Going, Keep Growing!</strong>
          Every result is a new opportunity to improve.
          Wishing you greater success next time!

        </div>

      `;


    /* ================= DISPLAY RESULT ================= */

    resultBox.innerHTML = `

      <div class="result-card">


        <div class="result-header">

          <h2>
            🏫 IPS PUBLIC SCHOOL
          </h2>

          <h3>
            AHIRORI HARDOI
          </h3>

          <h4 style="color:#0b3d91;">

            ${s.ExamType || ""}

          </h4>

          <h4 style="color:#666;">

            RESULT ${s.Session || ""}

          </h4>

        </div>


        <div class="info-grid">


          <div class="info-box">

            <b>🎓 Roll No :</b><br>

            ${s.Roll || roll}

          </div>


          <div class="info-box">

            <b>👨‍🎓 Student :</b><br>

            ${s.Name || "-"}

          </div>


          <div class="info-box">

            <b>👨 Father :</b><br>

            ${s.Father || "-"}

          </div>


          <div class="info-box">

            <b>🏫 Class :</b><br>

            ${s.Class || "-"}

            ${
              s.Section
              ?
              " (" + s.Section + ")"
              :
              ""
            }

          </div>


        </div>


        <hr>


        <table class="resultTable">

          <tr>

            <th>
              Subject
            </th>

            <th>
              Full Marks
            </th>

            <th>
              Obtained
            </th>

          </tr>

          ${rows}

        </table>


        <br>


        <div class="summary">


          <div>

            <h3>
              ${total}
            </h3>

            <p>
              Total Marks
            </p>

          </div>


          <div>

            <h3>
              ${percentage}%
            </h3>

            <p>
              Percentage
            </p>

          </div>


          <div>

            <h3>
              ${grade}
            </h3>

            <p>
              Grade
            </p>

          </div>


          <div>

            <h3>
              ${classRank}
            </h3>

            <p>
              Class Rank
            </p>

          </div>


          <div
            class="${
              isPass
              ? "pass"
              : "fail"
            }"
          >

            <h3>
              ${resultStatus}
            </h3>

            <p>
              Result
            </p>

          </div>


        </div>


        <br>


        <div style="
          text-align:center;
          background:#f8f9fa;
          padding:12px;
          border-radius:10px;
          font-weight:bold;
          color:#555;
        ">

          🏆 Division :
          ${division}

        </div>


        <!-- ================= MESSAGE ================= -->

        ${resultMessage}


        <!-- ================= PRINT ================= -->

        <button
          onclick="window.print()"
        >

          🖨️ Print Result

        </button>


      </div>

    `;

  }

  catch (error) {

    console.error(
      "Result Page Error:",
      error
    );

    showError(
      "Unable to load result"
    );

  }

}


/* ================= START ================= */

loadResult();
