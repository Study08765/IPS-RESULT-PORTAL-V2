import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================================================
   EDIT ID
========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );

const editId =
  params.get("id");


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

/*
 IMPORTANT:
 addstudent_v2.html में ID = saveBtn
*/
const saveBtn =
  document.getElementById("saveBtn");


/* =========================================================
   BASIC CHECK
========================================================= */

if(!studentClass){
  console.error("Class input not found.");
}

if(!examType){
  console.error("Exam Type input not found.");
}

if(!subjectsBox){
  console.error("Subjects box not found.");
}

if(!saveBtn){
  console.error("Save button not found.");
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

    const n =
      match[0];

    variants.push(
      "Class " + n
    );

    variants.push(n);

    variants.push(
      n + "th"
    );

    variants.push(
      n + "st"
    );

    variants.push(
      n + "nd"
    );

    variants.push(
      n + "rd"
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

  subject =
    subject.replace(
      /\s+/g,
      " "
    );


  if(
    subject === "math" ||
    subject === "maths" ||
    subject === "mathematics"
  ){

    return "mathematics";

  }


  if(
    subject === "social science" ||
    subject === "social sciences" ||
    subject === "sst"
  ){

    return "social science";

  }


  if(
    subject === "gk" ||
    subject === "general knowledge"
  ){

    return "general knowledge";

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
   GET FULL MARKS
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
    normalizeClass(
      className
    );

  const normalizedSubject =
    normalizeSubject(
      subject
    );


  /* =======================================================
     PRIMARY DOCUMENT ID
  ======================================================= */

  const docId =
    encodeURIComponent(
      String(exam).trim()
    ) +
    "__" +
    encodeURIComponent(
      normalizedClass
    ) +
    "__" +
    encodeURIComponent(
      normalizedSubject
    );


  console.log(
    "FULL MARKS SEARCH:",
    {
      exam,
      className,
      normalizedClass,
      subject,
      normalizedSubject,
      docId
    }
  );


  try{

    const snap =
      await getDoc(
        doc(
          db,
          "exam_full_marks",
          docId
        )
      );


    if(snap.exists()){

      const data =
        snap.data();


      console.log(
        "FULL MARKS FOUND:",
        data
      );


      if(
        data.FullMarks !== undefined &&
        data.FullMarks !== null &&
        data.FullMarks !== ""
      ){

        return String(
          data.FullMarks
        );

      }

    }


    /* =====================================================
       FALLBACK SEARCH THROUGH CLASS VARIANTS
       Useful for older saved records.
    ===================================================== */

    const classVariants =
      getClassVariants(
        className
      );


    const subjectVariants = [
      String(subject).trim(),
      normalizedSubject,
      "Mathematics",
      "Maths",
      "Math"
    ];


    for(
      const c
      of classVariants
    ){

      for(
        const s
        of [
          ...new Set(
            subjectVariants
          )
        ]
      ){

        const oldId =
          encodeURIComponent(
            String(exam).trim()
          ) +
          "__" +
          encodeURIComponent(
            c
          ) +
          "__" +
          encodeURIComponent(
            s
          );


        if(oldId === docId){

          continue;

        }


        const oldSnap =
          await getDoc(
            doc(
              db,
              "exam_full_marks",
              oldId
            )
          );


        if(
          oldSnap.exists()
        ){

          const oldData =
            oldSnap.data();


          if(
            oldData.FullMarks !== undefined &&
            oldData.FullMarks !== null &&
            oldData.FullMarks !== ""
          ){

            console.log(
              "FULL MARKS FOUND BY FALLBACK:",
              oldData
            );


            return String(
              oldData.FullMarks
            );

          }

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


  console.log(
    "FULL MARKS NOT FOUND"
  );


  return "";

}


/* =========================================================
   CREATE SUBJECT ROW
========================================================= */

function createSubject(
  subjectName = "",
  fullMarks = "",
  obtainedMarks = ""
){

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "subject";


  div.innerHTML = `

    <div class="subjectTitle">
      Subject
    </div>

    <input
      type="text"
      class="subjectName"
      placeholder="Subject Name"
      value="${escapeHTML(
        subjectName
      )}"
    >

    <input
      type="number"
      class="fullMarks"
      placeholder="Full Marks"
      value="${escapeHTML(
        fullMarks
      )}"
      min="0"
    >

    <input
      type="number"
      class="obtainedMarks"
      placeholder="Obtained Marks"
      value="${escapeHTML(
        obtainedMarks
      )}"
      min="0"
    >

    <button
      type="button"
      class="removeSubject"
    >
      ❌ Remove Subject
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


  /* =======================================================
     LOAD FULL MARKS WHEN SUBJECT IS ENTERED
  ======================================================= */

  async function loadMarks(){

    if(
      !subjectInput.value.trim()
    ){

      return;

    }


    if(
      !examType.value
    ){

      return;

    }


    if(
      !studentClass.value.trim()
    ){

      return;

    }


    /*
      Do not overwrite existing Full Marks.
    */

    if(
      fullMarksInput.value !== ""
    ){

      return;

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


  subjectInput.addEventListener(
    "change",
    loadMarks
  );


  subjectInput.addEventListener(
    "blur",
    loadMarks
  );


  /* =======================================================
     REMOVE
  ======================================================= */

  div
    .querySelector(
      ".removeSubject"
    )
    .addEventListener(
      "click",
      function(){

        div.remove();

      }
    );


  subjectsBox.appendChild(
    div
  );


  /*
    If subject already exists,
    immediately try loading Full Marks.
  */

  if(
    subjectName &&
    !fullMarks
  ){

    loadMarks();

  }

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

      console.log(
        "Checking class subjects:",
        classKey
      );


      const snap =
        await getDoc(
          doc(
            db,
            "class_subjects",
            classKey
          )
        );


      if(!snap.exists()){

        continue;

      }


      const data =
        snap.data();


      /*
        Support multiple possible field names.
      */

      let subjectList =
        data.Subjects;


      if(
        !Array.isArray(
          subjectList
        )
      ){

        subjectList =
          data.subjects;

      }


      if(
        !Array.isArray(
          subjectList
        )
      ){

        subjectList =
          data.SubjectList;

      }


      if(
        !Array.isArray(
          subjectList
        )
      ){

        subjectList = [];

      }


      if(
        subjectList.length === 0
      ){

        continue;

      }


      for(
        const item
        of subjectList
      ){

        let subjectName = "";


        if(
          typeof item === "string"
        ){

          subjectName =
            item.trim();

        }
        else if(
          item &&
          typeof item === "object"
        ){

          subjectName =
            item.name ||
            item.Name ||
            item.Subject ||
            item.subject ||
            "";

        }


        subjectName =
          String(
            subjectName
          ).trim();


        if(!subjectName){

          continue;

        }


        let fullMarks =
          "";


        if(
          examType.value
        ){

          fullMarks =
            await getSavedFullMarks(
              examType.value,
              classValue,
              subjectName
            );

        }


        createSubject(
          subjectName,
          fullMarks,
          ""
        );

      }


      found = true;

      break;

    }


    if(!found){

      /*
        Do not show error.
        User can use Add Subject manually.
      */

      console.log(
        "No class subjects found."
      );

    }

  }
  catch(error){

    console.error(
      "Class Subjects Error:",
      error
    );

  }

}


/* =========================================================
   APPLY FULL MARKS TO CURRENT SUBJECTS
========================================================= */

async function applyFullMarksToSubjects(){

  const rows =
    document.querySelectorAll(
      ".subject"
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
      fullMarksInput.value !== ""
    ){

      continue;

    }


    const subject =
      subjectInput.value.trim();


    if(
      !subject ||
      !studentClass.value.trim() ||
      !examType.value
    ){

      continue;

    }


    const saved =
      await getSavedFullMarks(
        examType.value,
        studentClass.value,
        subject
      );


    if(saved !== ""){

      fullMarksInput.value =
        saved;

    }

  }

}


/* =========================================================
   CLASS INPUT
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


/*
  Also listen to blur.
  This is important because Class is an INPUT,
  not a SELECT.
*/

studentClass.addEventListener(
  "blur",
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
   ADD SUBJECT
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
      s.ExamType ||
      "Quarterly Examination";


    session.value =
      s.Session ||
      "2026-27";


    subjectsBox.innerHTML =
      "";


    const savedSubjects =
      Array.isArray(
        s.Subjects
      )
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
          ".subject"
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
          "💾 Save Student";

      }

    }
  );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadStudent();


/*
  New student:
  if class already has a value,
  load subjects.
*/

if(!editId){

  if(
    studentClass.value.trim()
  ){

    loadClassSubjects();

  }

}
