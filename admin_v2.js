import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================================================
   EDIT ID
========================================================= */

const params = new URLSearchParams(window.location.search);

const editId = params.get("id");


/* =========================================================
   FORM ELEMENTS
========================================================= */

const roll =
  document.getElementById("roll");

const name =
  document.getElementById("name");

const father =
  document.getElementById("father");

const mother =
  document.getElementById("mother");

const studentClass =
  document.getElementById("class");

const section =
  document.getElementById("section");

const examType =
  document.getElementById("examType");

const session =
  document.getElementById("session");

const subjectsBox =
  document.getElementById("subjects");

const addSubjectBtn =
  document.getElementById("addSubject");

const saveBtn =
  document.getElementById("saveStudent");


/* =========================================================
   STAFF LOGIN
========================================================= */

const staffName =
  localStorage.getItem("staffName");

const staffRole =
  localStorage.getItem("staffRole");


if(staffName){

  console.log(
    "Logged in Staff:",
    staffName,
    staffRole || ""
  );

}


/* =========================================================
   CLASS NORMALIZATION
========================================================= */

function normalizeClass(value){

  const text =
    String(value || "").trim();

  const match =
    text.match(/\d+/);

  if(match){

    return "Class " + match[0];

  }

  return text;

}


/* =========================================================
   CLASS VARIANTS
========================================================= */

function getClassVariants(value){

  const text =
    String(value || "").trim();

  const match =
    text.match(/\d+/);

  const variants = [];

  if(text){
    variants.push(text);
  }

  if(match){

    const number =
      match[0];

    variants.push(
      "Class " + number
    );

    variants.push(
      number
    );

    variants.push(
      number + "th"
    );

  }

  return [
    ...new Set(variants)
  ];

}


/* =========================================================
   SUBJECT NORMALIZATION
========================================================= */

function normalizeSubject(value){

  let subject =
    String(value || "")
    .trim()
    .toLowerCase();

  if(
    subject === "math" ||
    subject === "maths"
  ){

    subject =
      "mathematics";

  }

  return subject;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================================
   GET SAVED FULL MARKS
========================================================= */

async function getSavedFullMarks(
  exam,
  className,
  subject
){

  if(
    !exam ||
    !className ||
    !subject
  ){

    return "";

  }


  const normalizedClass =
    normalizeClass(className);

  const normalizedSubject =
    normalizeSubject(subject);


  /* -------------------------------------------------------
     NEW DOCUMENT ID
  ------------------------------------------------------- */

  const newDocId =
    encodeURIComponent(
      exam.trim()
    ) +
    "__" +
    encodeURIComponent(
      normalizedClass
    ) +
    "__" +
    encodeURIComponent(
      normalizedSubject
    );


  try{

    const snap =
      await getDoc(
        doc(
          db,
          "exam_full_marks",
          newDocId
        )
      );


    if(snap.exists()){

      const data =
        snap.data();


      if(
        data.FullMarks !== undefined &&
        data.FullMarks !== null
      ){

        return data.FullMarks;

      }

    }


    /* -----------------------------------------------------
       OLD DOCUMENT ID SUPPORT
    ----------------------------------------------------- */

    const oldDocId =
      encodeURIComponent(
        exam.trim()
      ) +
      "__" +
      encodeURIComponent(
        String(className).trim()
      ) +
      "__" +
      encodeURIComponent(
        String(subject).trim()
      );


    if(oldDocId !== newDocId){

      const oldSnap =
        await getDoc(
          doc(
            db,
            "exam_full_marks",
            oldDocId
          )
        );


      if(oldSnap.exists()){

        const oldData =
          oldSnap.data();


        if(
          oldData.FullMarks !== undefined &&
          oldData.FullMarks !== null
        ){

          return oldData.FullMarks;

        }

      }

    }

  }
  catch(error){

    console.error(
      "Full Marks Load Error:",
      error
    );

  }


  return "";

}


/* =========================================================
   CREATE SUBJECT
========================================================= */

function createSubject(
  subjectName = "",
  fullMarks = "",
  obtainedMarks = ""
){

  const div =
    document.createElement("div");

  div.className =
    "subject-row";


  div.innerHTML = `

    <input
      type="text"
      class="subjectName"
      placeholder="Subject Name"
      value="${escapeHTML(subjectName)}"
    >

    <input
      type="number"
      class="fullMarks"
      placeholder="Full Marks"
      value="${escapeHTML(fullMarks)}"
      min="0"
    >

    <input
      type="number"
      class="obtainedMarks"
      placeholder="Obtained Marks"
      value="${escapeHTML(obtainedMarks)}"
      min="0"
    >

    <button
      type="button"
      class="removeSubject"
    >
      ❌
    </button>

  `;


  const subjectInput =
    div.querySelector(
      ".subjectName"
    );

  const fullMarksInput =
    div.querySelector(
      ".fullMarks"
    );


  /* -------------------------------------------------------
     SUBJECT CHANGE
  ------------------------------------------------------- */

  subjectInput.addEventListener(
    "change",
    async function(){

      if(
        !fullMarksInput.value &&
        examType.value &&
        studentClass.value &&
        subjectInput.value
      ){

        const saved =
          await getSavedFullMarks(
            examType.value,
            studentClass.value,
            subjectInput.value
          );


        if(saved !== ""){

          fullMarksInput.value =
            saved;

        }

      }

    }
  );


  /* -------------------------------------------------------
     REMOVE
  ------------------------------------------------------- */

  div
    .querySelector(".removeSubject")
    .addEventListener(
      "click",
      function(){

        div.remove();

      }
    );


  subjectsBox.appendChild(div);

}


/* =========================================================
   LOAD CLASS SUBJECTS
========================================================= */

async function loadClassSubjects(){

  const classValue =
    studentClass.value.trim();

  if(!classValue){

    return;

  }


  subjectsBox.innerHTML = "";


  const classVariants =
    getClassVariants(
      classValue
    );


  let found = false;


  try{

    for(
      const classKey
      of classVariants
    ){

      const snap =
        await getDoc(
          doc(
            db,
            "class_subjects",
            classKey
          )
        );


      if(
        snap.exists()
      ){

        const data =
          snap.data();


        const subjectList =
          Array.isArray(
            data.Subjects
          )
          ? data.Subjects
          : [];


        if(subjectList.length){

          for(
            const subject
            of subjectList
          ){

            const subjectName =
              typeof subject === "string"
              ? subject
              : (
                  subject.name ||
                  subject.Subject ||
                  ""
                );


            if(!subjectName){

              continue;

            }


            let savedFullMarks =
              "";


            if(examType.value){

              savedFullMarks =
                await getSavedFullMarks(
                  examType.value,
                  classValue,
                  subjectName
                );

            }


            createSubject(
              subjectName,
              savedFullMarks,
              ""
            );

          }


          found = true;

          break;

        }

      }

    }


    /* -----------------------------------------------------
       IF NO CLASS SUBJECTS FOUND
    ----------------------------------------------------- */

    if(!found){

      console.log(
        "No saved subjects found for:",
        classValue
      );

    }

  }
  catch(error){

    console.error(
      "Class Subjects Load Error:",
      error
    );

  }

}


/* =========================================================
   APPLY FULL MARKS TO EXISTING SUBJECT ROWS
========================================================= */

async function applyFullMarksToSubjects(){

  const rows =
    document.querySelectorAll(
      ".subject-row"
    );


  for(
    const row
    of rows
  ){

    const subjectInput =
      row.querySelector(
        ".subjectName"
      );

    const fullMarksInput =
      row.querySelector(
        ".fullMarks"
      );


    if(
      !subjectInput ||
      !fullMarksInput
    ){

      continue;

    }


    if(
      !examType.value ||
      !studentClass.value ||
      !subjectInput.value
    ){

      continue;

    }


    /*
      IMPORTANT:
      Existing manually entered Full Marks
      will NOT be overwritten.
    */

    if(
      fullMarksInput.value !== ""
    ){

      continue;

    }


    const saved =
      await getSavedFullMarks(
        examType.value,
        studentClass.value,
        subjectInput.value
      );


    if(saved !== ""){

      fullMarksInput.value =
        saved;

    }

  }

}


/* =========================================================
   CLASS CHANGE
========================================================= */

studentClass.addEventListener(
  "change",
  async function(){

    if(!editId){

      await loadClassSubjects();

    }
    else{

      await applyFullMarksToSubjects();

    }

  }
);


/* =========================================================
   EXAM CHANGE
========================================================= */

examType.addEventListener(
  "change",
  async function(){

    if(!editId){

      await loadClassSubjects();

    }
    else{

      await applyFullMarksToSubjects();

    }

  }
);


/* =========================================================
   ADD SUBJECT BUTTON
========================================================= */

if(addSubjectBtn){

  addSubjectBtn.addEventListener(
    "click",
    function(){

      createSubject();

    }
  );

}


/* =========================================================
   LOAD EDIT STUDENT
========================================================= */

async function loadStudent(){

  if(!editId){

    return;

  }


  try{

    const snap =
      await getDoc(
        doc(
          db,
          "students_v2",
          editId
        )
      );


    if(!snap.exists()){

      alert(
        "Student record not found."
      );

      return;

    }


    const s =
      snap.data();


    roll.value =
      s.Roll || editId;


    name.value =
      s.Name || "";


    father.value =
      s.Father || "";


    mother.value =
      s.Mother || "";


    studentClass.value =
      s.Class || "";


    section.value =
      s.Section || "";


    examType.value =
      s.ExamType || "";


    session.value =
      s.Session || "2026-27";


    subjectsBox.innerHTML =
      "";


    const savedSubjects =
      Array.isArray(s.Subjects)
      ? s.Subjects
      : [];


    for(
      const sub
      of savedSubjects
    ){

      createSubject(

        sub.name ||
        sub.Name ||
        sub.Subject ||
        "",

        sub.full ??
        sub.FullMarks ??
        "",

        sub.obtained ??
        sub.ObtainedMarks ??
        ""

      );

    }


    /*
      Apply saved class/exam Full Marks
      only where Full Marks is blank.
    */

    await applyFullMarksToSubjects();


  }
  catch(error){

    console.error(
      "Student Load Error:",
      error
    );


    alert(
      "Student Load Error\n\n" +
      error.message
    );

  }

}


/* =========================================================
   SAVE STUDENT
========================================================= */

if(saveBtn){

  saveBtn.addEventListener(
    "click",
    async function(){

      const rollValue =
        roll.value.trim();

      const nameValue =
        name.value.trim();


      if(!rollValue){

        alert(
          "Please enter Roll Number."
        );

        roll.focus();

        return;

      }


      if(!nameValue){

        alert(
          "Please enter Student Name."
        );

        name.focus();

        return;

      }


      const subjectRows =
        document.querySelectorAll(
          ".subject-row"
        );


      const subjects = [];


      subjectRows.forEach(
        row => {

          const subjectName =
            row
              .querySelector(
                ".subjectName"
              )
              ?.value
              .trim() || "";


          const fullMarks =
            row
              .querySelector(
                ".fullMarks"
              )
              ?.value
              .trim() || "";


          const obtainedMarks =
            row
              .querySelector(
                ".obtainedMarks"
              )
              ?.value
              .trim() || "";


          if(subjectName){

            subjects.push({

              name:
                subjectName,

              full:
                fullMarks,

              obtained:
                obtainedMarks

            });

          }

        }
      );


      const student = {

        Roll:
          rollValue,

        Name:
          nameValue,

        Father:
          father.value.trim(),

        Mother:
          mother.value.trim(),

        Class:
          studentClass.value.trim(),

        Section:
          section.value.trim(),

        ExamType:
          examType.value,

        Session:
          session.value.trim(),

        Subjects:
          subjects

      };


      saveBtn.disabled =
        true;


      saveBtn.innerText =
        "Saving...";


      try{

        await setDoc(

          doc(
            db,
            "students_v2",
            rollValue
          ),

          student

        );


        alert(
          "✅ Student Saved Successfully"
        );


        window.location.href =
          "viewstudents_v2.html";


      }
      catch(error){

        console.error(
          "Student Save Error:",
          error
        );


        alert(
          "❌ Save Error\n\n" +
          error.message
        );


        saveBtn.disabled =
          false;


        saveBtn.innerText =
          "SAVE STUDENT";

      }

    }
  );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadStudent();


/* =========================================================
   NEW STUDENT INITIAL CLASS LOAD
========================================================= */

if(!editId){

  if(
    studentClass.value.trim()
  ){

    loadClassSubjects();

  }

}
