import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const container = document.getElementById("classContainer");
const search = document.getElementById("search");
const noResult = document.getElementById("noResult");

let allStudents = [];


/* ==============================
   LOAD STUDENTS
================================ */

async function loadStudents(){

  container.innerHTML = `
    <div class="empty">
      ⏳ Loading Students...
    </div>
  `;

  try{

    const snapshot =
      await getDocs(collection(db,"students_v2"));

    allStudents = [];

    snapshot.forEach((studentDoc)=>{

      allStudents.push({
        id:studentDoc.id,
        ...studentDoc.data()
      });

    });

    renderStudents(allStudents);

  }catch(error){

    console.error(error);

    container.innerHTML = `
      <div class="empty">
        ❌ Students load नहीं हो सके
        <br><br>
        ${error.message}
      </div>
    `;

  }

}


/* ==============================
   CLASS SORT
================================ */

function classNumber(value){

  const match =
    String(value || "").match(/\d+/);

  return match
    ? parseInt(match[0])
    : 999;

}


/* ==============================
   RENDER STUDENTS
================================ */

function renderStudents(students){

  container.innerHTML = "";

  noResult.style.display =
    students.length === 0
    ? "block"
    : "none";


  if(students.length === 0){
    return;
  }


  /* GROUP BY CLASS */

  const groups = {};


  students.forEach(student=>{

    const className =
      student.Class || "Other";

    if(!groups[className]){
      groups[className] = [];
    }

    groups[className].push(student);

  });


  /* SORT CLASSES */

  const classNames =
    Object.keys(groups).sort(
      (a,b)=>classNumber(a)-classNumber(b)
    );


  /* CREATE CLASS CARDS */

  classNames.forEach(className=>{

    const list =
      groups[className];


    /* SORT ROLL */

    list.sort((a,b)=>{

      const rollA =
        parseInt(a.Roll) || 999999;

      const rollB =
        parseInt(b.Roll) || 999999;

      return rollA-rollB;

    });


    const card =
      document.createElement("div");

    card.className = "class-card";

    const classId =
      "class_" +
      classNumber(className) +
      "_" +
      Math.random()
        .toString(36)
        .substring(2,7);


    card.innerHTML = `

      <div class="class-header">

        <div>

          <div class="class-title">
            CLASS ${className}
          </div>

          <div class="student-count">
            👨‍🎓 ${list.length} Students
          </div>

        </div>


        <button
          class="download-btn"
          onclick="downloadClassPDF('${className}')">

          📄 DOWNLOAD PDF

        </button>

      </div>


      <div class="table-wrap">

        <table>

          <thead>

            <tr>

              <th>S.No.</th>

              <th>Roll</th>

              <th>Student Name</th>

              <th>Class</th>

              <th>Exam</th>

              <th>Session</th>

              <th>Action</th>

            </tr>

          </thead>


          <tbody id="${classId}">

          </tbody>

        </table>

      </div>

    `;


    container.appendChild(card);


    const tbody =
      document.getElementById(classId);


    list.forEach((student,index)=>{

      const row =
        document.createElement("tr");


      row.dataset.search =
        `

        ${student.Roll || ""}

        ${student.Name || ""}

        ${student.Class || ""}

        ${student.ExamType || ""}

        ${student.Session || ""}

        `.toLowerCase();


      row.innerHTML = `

        <td>
          ${index + 1}
        </td>


        <td>
          <strong>
            ${student.Roll || "-"}
          </strong>
        </td>


        <td class="name-cell">
          ${student.Name || "-"}
        </td>


        <td>
          ${student.Class || "-"}
        </td>


        <td>
          ${student.ExamType || "-"}
        </td>


        <td>
          ${student.Session || "-"}
        </td>


        <td>

          <button
            class="action-btn edit"
            onclick="editStudent('${student.id}')">

            ✏️ Edit

          </button>


          <button
            class="action-btn delete"
            onclick="deleteStudent('${student.id}')">

            🗑 Delete

          </button>

        </td>

      `;


      tbody.appendChild(row);

    });

  });

}


/* ==============================
   SEARCH
================================ */

search.addEventListener("input",()=>{

  const value =
    search.value
      .trim()
      .toLowerCase();


  if(value === ""){

    renderStudents(allStudents);

    return;

  }


  const filtered =
    allStudents.filter(student=>{

      const text = `

        ${student.Roll || ""}

        ${student.Name || ""}

        ${student.Class || ""}

        ${student.ExamType || ""}

        ${student.Session || ""}

      `.toLowerCase();


      return text.includes(value);

    });


  renderStudents(filtered);

});


/* ==============================
   EDIT STUDENT
================================ */

window.editStudent = function(id){

  window.location.href =
    "addstudent_v2.html?id=" + id;

};


/* ==============================
   DELETE STUDENT
================================ */

window.deleteStudent =
async function(id){

  const student =
    allStudents.find(s=>s.id === id);


  if(!student){
    return;
  }


  const confirmDelete =
    confirm(

      `⚠️ Delete Student?\n\n` +

      `Name: ${student.Name || "-"}\n` +

      `Roll: ${student.Roll || "-"}\n` +

      `Class: ${student.Class || "-"}`

    );


  if(!confirmDelete){
    return;
  }


  try{

    await deleteDoc(
      doc(db,"students_v2",id)
    );


    alert("✅ Student Deleted Successfully");


    loadStudents();


  }catch(error){

    alert(
      "❌ Delete Error\n\n" +
      error.message
    );

  }

};


/* ==============================
   DOWNLOAD CLASS PDF
================================ */

window.downloadClassPDF =
function(className){

  const list =
    allStudents.filter(
      student =>
        String(student.Class || "") ===
        String(className)
    );


  if(list.length === 0){

    alert("इस class में कोई student नहीं है।");

    return;

  }


  /* SORT ROLL */

  list.sort((a,b)=>{

    const rollA =
      parseInt(a.Roll) || 999999;

    const rollB =
      parseInt(b.Roll) || 999999;

    return rollA-rollB;

  });


  const { jsPDF } =
    window.jspdf;


  const pdf =
    new jsPDF({
      orientation:"portrait",
      unit:"mm",
      format:"a4"
    });


  /* ==============================
     HEADER
  ============================== */

  pdf.setFillColor(7,27,61);

  pdf.rect(
    0,
    0,
    210,
    35,
    "F"
  );


  pdf.setTextColor(255,255,255);

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(17);

  pdf.text(
    "IPS PUBLIC SCHOOL AHIRORI HARDOI",
    105,
    14,
    {align:"center"}
  );


  pdf.setFontSize(10);

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.text(
    "STUDENT LIST",
    105,
    21,
    {align:"center"}
  );


  pdf.setFontSize(11);

  pdf.text(
    `CLASS ${className}  |  SESSION 2026-27`,
    105,
    28,
    {align:"center"}
  );


  /* ==============================
     DATE
  ============================== */

  const today =
    new Date().toLocaleDateString(
      "en-IN"
    );


  pdf.setTextColor(80,80,80);

  pdf.setFontSize(9);

  pdf.text(
    `Generated: ${today}`,
    195,
    43,
    {align:"right"}
  );


  /* ==============================
     TABLE
  ============================== */

  const rows =
    list.map((student,index)=>[

      index + 1,

      student.Roll || "-",

      student.Name || "-",

      student.Class || "-",

      student.ExamType || "-",

      student.Session || "-"

    ]);


  pdf.autoTable({

    startY:49,

    head:[[
      "S.No.",
      "Roll No.",
      "Student Name",
      "Class",
      "Exam",
      "Session"
    ]],

    body:rows,

    theme:"grid",

    styles:{
      font:"helvetica",
      fontSize:9,
      cellPadding:4,
      halign:"center",
      valign:"middle"
    },

    headStyles:{
      fillColor:[11,61,145],
      textColor:[255,255,255],
      fontStyle:"bold",
      halign:"center"
    },

    columnStyles:{
      0:{cellWidth:14},
      1:{cellWidth:20},
      2:{cellWidth:65,halign:"left"},
      3:{cellWidth:20},
      4:{cellWidth:35},
      5:{cellWidth:30}
    },

    alternateRowStyles:{
      fillColor:[246,248,252]
    },

    margin:{
      left:10,
      right:10
    }

  });


  /* ==============================
     FOOTER
  ============================== */

  const pageCount =
    pdf.internal.getNumberOfPages();


  for(
    let page=1;
    page<=pageCount;
    page++
  ){

    pdf.setPage(page);


    const pageHeight =
      pdf.internal.pageSize.height;


    pdf.setFontSize(8);

    pdf.setTextColor(100,100,100);


    pdf.text(
      `IPS PUBLIC SCHOOL AHIRORI HARDOI  •  CLASS ${className}  •  Page ${page} of ${pageCount}`,
      105,
      pageHeight - 8,
      {align:"center"}
    );

  }


  /* ==============================
     SAVE
  ============================== */

  const safeClass =
    String(className)
      .replace(/[^a-zA-Z0-9]/g,"_");


  pdf.save(
    `IPS_Student_List_Class_${safeClass}.pdf`
  );

};


/* ==============================
   START
================================ */

loadStudents();
