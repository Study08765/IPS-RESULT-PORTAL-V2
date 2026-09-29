import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const classSelect =
  document.getElementById("classSelect");

const subjectsDiv =
  document.getElementById("subjects");

const addSubjectBtn =
  document.getElementById("addSubject");

const saveBtn =
  document.getElementById("saveBtn");

const statusBox =
  document.getElementById("status");

const studentCount =
  document.getElementById("studentCount");


/* =====================================================
   CLASS NORMALIZATION
===================================================== */

function normalizeClass(value){

  const match =
    String(value || "").match(/\d+/);

  return match
    ? "Class " + match[0]
    : String(value || "").trim();

}


/* =====================================================
   SUBJECT NORMALIZATION
===================================================== */

function normalizeSubject(value){

  let subject =
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g," ");


  if(
    subject === "math" ||
    subject === "maths"
  ){

    return "mathematics";

  }


  if(
    subject === "sst" ||
    subject === "social sciences"
  ){

    return "social science";

  }


  if(
    subject === "gk"
  ){

    return "general knowledge";

  }


  return subject;

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =====================================================
   ADD SUBJECT ROW
===================================================== */

function addSubjectRow(
  subjectName = ""
){

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "subjectRow";


  row.innerHTML = `

    <input
      type="text"
      class="subjectName"
      placeholder="Subject Name"
      value="${escapeHTML(
        subjectName
      )}"
    >

    <button
      type="button"
      class="deleteBtn"
    >
      ×
    </button>

  `;


  row
    .querySelector(
      ".deleteBtn"
    )
    .onclick = () => {

      row.remove();

    };


  subjectsDiv.appendChild(
    row
  );

}


/* =====================================================
   LOAD SUBJECTS
===================================================== */

async function loadSubjects(){

  const classNumber =
    classSelect.value;


  subjectsDiv.innerHTML =
    "";


  if(!classNumber){

    studentCount.innerText =
      "Select a class";

    return;

  }


  try{

    const snap =
      await getDoc(

        doc(
          db,
          "class_subjects",
          classNumber
        )

      );


    if(
      snap.exists() &&
      Array.isArray(
        snap.data().Subjects
      )
    ){

      snap
        .data()
        .Subjects
        .forEach(
          subject => {

            addSubjectRow(
              subject
            );

          }
        );

    }


    if(
      subjectsDiv.children.length === 0
    ){

      addSubjectRow();

    }


    await updateStudentCount();

  }
  catch(error){

    console.error(error);

    alert(
      "Subjects load नहीं हो सके:\n" +
      error.message
    );

  }

}


/* =====================================================
   STUDENT CLASS MATCH
===================================================== */

function isSameClass(
  studentClass,
  selectedClass
){

  const a =
    normalizeClass(
      studentClass
    ).toLowerCase();


  const b =
    normalizeClass(
      selectedClass
    ).toLowerCase();


  return a === b;

}


/* =====================================================
   STUDENT COUNT
===================================================== */

async function updateStudentCount(){

  const classNumber =
    classSelect.value;


  if(!classNumber){

    studentCount.innerText =
      "Select a class";

    return;

  }


  const snapshot =
    await getDocs(
      collection(
        db,
        "students_v2"
      )
    );


  let count = 0;


  snapshot.forEach(
    studentDoc => {

      const student =
        studentDoc.data();


      if(
        isSameClass(
          student.Class,
          classNumber
        )
      ){

        count++;

      }

    }
  );


  studentCount.innerText =
    `Class ${classNumber} में ${count} students हैं`;

}


/* =====================================================
   ADD SUBJECT
===================================================== */

addSubjectBtn.onclick = () => {

  addSubjectRow();

};


/* =====================================================
   CLASS CHANGE
===================================================== */

classSelect.onchange = () => {

  loadSubjects();

};


/* =====================================================
   LOAD FULL MARKS MAP
===================================================== */

async function loadFullMarksMap(){

  const snapshot =
    await getDocs(
      collection(
        db,
        "exam_full_marks"
      )
    );


  const map =
    new Map();


  snapshot.forEach(
    item => {

      const data =
        item.data();


      if(
        !data.Exam ||
        !data.Class ||
        !data.Subject
      ){

        return;

      }


      const key =
        String(
          data.Exam
        ).trim()
        .toLowerCase() +
        "||" +
        normalizeClass(
          data.Class
        ).toLowerCase() +
        "||" +
        normalizeSubject(
          data.Subject
        );


      map.set(
        key,
        data.FullMarks
      );

    }
  );


  return map;

}


/* =====================================================
   GET FULL MARKS
===================================================== */

function getFullMarks(
  fullMarksMap,
  exam,
  className,
  subject
){

  const key =
    String(
      exam || ""
    ).trim()
    .toLowerCase() +
    "||" +
    normalizeClass(
      className
    ).toLowerCase() +
    "||" +
    normalizeSubject(
      subject
    );


  return fullMarksMap.has(key)
    ? fullMarksMap.get(key)
    : "";
}


/* =====================================================
   SAVE
===================================================== */

saveBtn.onclick =
async () => {

  const classNumber =
    classSelect.value;


  if(!classNumber){

    alert(
      "Please select class"
    );

    return;

  }


  const subjects = [];


  document
    .querySelectorAll(
      ".subjectName"
    )
    .forEach(
      input => {

        const name =
          input.value.trim();


        if(name){

          subjects.push(
            name
          );

        }

      }
    );


  const uniqueSubjects = [];


  const seen =
    new Set();


  subjects.forEach(
    subject => {

      const key =
        normalizeSubject(
          subject
        );


      if(
        !seen.has(key)
      ){

        seen.add(key);

        uniqueSubjects.push(
          subject
        );

      }

    }
  );


  if(
    uniqueSubjects.length === 0
  ){

    alert(
      "कम से कम एक subject डालें."
    );

    return;

  }


  try{

    saveBtn.disabled =
      true;


    statusBox.style.display =
      "block";


    statusBox.innerText =
      "Saving subjects...";


    /* =================================================
       SAVE CLASS SUBJECT TEMPLATE
    ================================================= */

    await setDoc(

      doc(
        db,
        "class_subjects",
        classNumber
      ),

      {

        Class:
          classNumber,

        Subjects:
          uniqueSubjects,

        UpdatedAt:
          new Date().toISOString()

      },

      {
        merge:true
      }

    );


    /* =================================================
       LOAD FULL MARKS
    ================================================= */

    statusBox.innerText =
      "Loading Full Marks settings...";


    const fullMarksMap =
      await loadFullMarksMap();


    /* =================================================
       GET STUDENTS
    ================================================= */

    const snapshot =
      await getDocs(
        collection(
          db,
          "students_v2"
        )
      );


    const students = [];


    snapshot.forEach(
      studentDoc => {

        const student =
          studentDoc.data();


        if(
          isSameClass(
            student.Class,
            classNumber
          )
        ){

          students.push({

            id:
              studentDoc.id,

            data:
              student

          });

        }

      }
    );


    statusBox.innerText =
      `Applying subjects to ${students.length} students...`;


    /* =================================================
       BATCH UPDATE
    ================================================= */

    const batchSize =
      400;


    for(
      let start = 0;
      start < students.length;
      start += batchSize
    ){

      const batch =
        writeBatch(db);


      const group =
        students.slice(
          start,
          start + batchSize
        );


      group.forEach(
        item => {

          const oldSubjects =
            Array.isArray(
              item.data.Subjects
            )
            ? item.data.Subjects
            : [];


          const exam =
            item.data.ExamType ||
            "Quarterly Examination";


          const newSubjects =
            uniqueSubjects.map(
              subjectName => {

                const old =
                  oldSubjects.find(
                    s => {

                      return (
                        normalizeSubject(
                          s.name ||
                          s.Name ||
                          s.Subject ||
                          ""
                        )
                        ===
                        normalizeSubject(
                          subjectName
                        )
                      );

                    }
                  );


                /*
                  Existing obtained marks
                  are always preserved.
                */

                const oldObtained =
                  old
                    ? (
                        old.obtained ??
                        old.ObtainedMarks ??
                        ""
                      )
                    : "";


                /*
                  Existing Full Marks:
                  - If saved class/exam/subject
                    setting exists → use it.
                  - Otherwise preserve old.
                  - New subject without setting
                    remains blank.
                */

                const savedFullMarks =
                  getFullMarks(
                    fullMarksMap,
                    exam,
                    normalizeClass(
                      classNumber
                    ),
                    subjectName
                  );


                let finalFullMarks =
                  "";


                if(
                  savedFullMarks !== ""
                ){

                  finalFullMarks =
                    savedFullMarks;

                }
                else if(old){

                  finalFullMarks =
                    old.full ??
                    old.FullMarks ??
                    "";

                }


                return {

                  name:
                    subjectName,

                  full:
                    finalFullMarks,

                  obtained:
                    oldObtained

                };

              }
            );


          batch.set(

            doc(
              db,
              "students_v2",
              item.id
            ),

            {

              Subjects:
                newSubjects

            },

            {

              merge:true

            }

          );

        }
      );


      await batch.commit();

    }


    statusBox.innerText =
      `✅ Class ${classNumber} subjects saved and applied to ${students.length} students.`;


    await updateStudentCount();

  }
  catch(error){

    console.error(error);


    statusBox.innerText =
      "❌ Error occurred.";


    alert(
      "Error:\n" +
      error.message
    );

  }
  finally{

    saveBtn.disabled =
      false;

  }

};


/* =====================================================
   START
===================================================== */

loadSubjects();
