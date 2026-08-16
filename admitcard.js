import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    getDocs,
    collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const roll =
    document.getElementById("roll");

const generateBtn =
    document.getElementById("generateBtn");

const classSelect =
    document.getElementById("classSelect");

const cardsPerPage =
    document.getElementById("cardsPerPage");

const studentCount =
    document.getElementById("studentCount");

const downloadAllBtn =
    document.getElementById("downloadAllBtn");

const printAllBtn =
    document.getElementById("printAllBtn");

const admitCard =
    document.getElementById("admitCard");

const bulkContainer =
    document.getElementById("bulkContainer");

const bulkStatus =
    document.getElementById("bulkStatus");


let allStudents = [];

const scheduleCache = {};


// =====================================================
// HTML SECURITY
// =====================================================

function escapeHTML(value){

    if(value === null || value === undefined){
        return "";
    }

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


// =====================================================
// NORMALIZE CLASS
// =====================================================

function normalizeClass(value){

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g," ");

}


// =====================================================
// LOAD ALL STUDENTS
// =====================================================

async function loadStudents(){

    const snap =
        await getDocs(
            collection(db,"students_v2")
        );

    allStudents = [];

    snap.forEach(docSnap => {

        allStudents.push(
            docSnap.data()
        );

    });

    populateClasses();

    updateStudentCount();

}


// =====================================================
// CLASS DROPDOWN
// =====================================================

function populateClasses(){

    const classMap = {};

    allStudents.forEach(student => {

        const cls =
            String(
                student.Class || ""
            ).trim();

        if(cls){

            classMap[
                normalizeClass(cls)
            ] = cls;

        }

    });


    const classes =
        Object.values(classMap)
        .sort((a,b) => {

            return a.localeCompare(
                b,
                undefined,
                {
                    numeric:true
                }
            );

        });


    classSelect.innerHTML = `
        <option value="ALL">
            All Classes
        </option>
    `;


    classes.forEach(cls => {

        const option =
            document.createElement("option");

        option.value = cls;

        option.textContent = cls;

        classSelect.appendChild(option);

    });

}


// =====================================================
// SELECTED STUDENTS
// =====================================================

function getSelectedStudents(){

    const selected =
        classSelect.value;


    if(selected === "ALL"){

        return [...allStudents];

    }


    return allStudents.filter(student => {

        return normalizeClass(
            student.Class
        ) === normalizeClass(
            selected
        );

    });

}


// =====================================================
// COUNT
// =====================================================

function updateStudentCount(){

    const students =
        getSelectedStudents();


    const className =
        classSelect.value === "ALL"
        ? "All Classes"
        : classSelect.value;


    studentCount.innerHTML = `
        ${escapeHTML(className)}
        :
        <b>${students.length}</b>
        Students
    `;


    downloadAllBtn.innerText =
        `📥 Download ${className} Admit Cards (${students.length})`;


    printAllBtn.innerText =
        `🖨️ Print ${className} Admit Cards (${students.length})`;

}


// =====================================================
// EXAM SCHEDULE
// =====================================================

async function getExamSchedule(
    className,
    subjectName
){

    const key =
        className + "_" + subjectName;


    if(
        Object.prototype.hasOwnProperty
        .call(scheduleCache,key)
    ){

        return scheduleCache[key];

    }


    const snap =
        await getDoc(
            doc(
                db,
                "exam_schedule",
                key
            )
        );


    if(!snap.exists()){

        scheduleCache[key] = null;

        return null;

    }


    const exam =
        snap.data();


    scheduleCache[key] =
        exam;


    return exam;

}


// =====================================================
// SUBJECT TABLE
// =====================================================

async function createSubjectTable(student){

    let html = `

        <table class="subjectTable">

            <tr>
                <th>Subject</th>
                <th>Exam Date</th>
                <th>Time</th>
            </tr>

    `;


    let found = false;


    const subjects =
        Array.isArray(student.Subjects)
        ? student.Subjects
        : [];


    for(const sub of subjects){

        if(!sub || !sub.name){
            continue;
        }


        const exam =
            await getExamSchedule(
                student.Class,
                sub.name
            );


        if(!exam){
            continue;
        }


        if(
            !exam.Date ||
            !exam.StartTime ||
            !exam.EndTime
        ){

            continue;

        }


        found = true;


        let date =
            String(exam.Date);


        const parts =
            date.split("-");


        if(parts.length === 3){

            date =
                parts[2] +
                "-" +
                parts[1] +
                "-" +
                parts[0];

        }


        html += `

            <tr>

                <td>
                    ${escapeHTML(sub.name)}
                </td>

                <td>
                    ${escapeHTML(date)}
                </td>

                <td>
                    ${escapeHTML(exam.StartTime)}
                    -
                    ${escapeHTML(exam.EndTime)}
                </td>

            </tr>

        `;

    }


    if(!found){

        html += `

            <tr>

                <td colspan="3">
                    No Exam Schedule Available
                </td>

            </tr>

        `;

    }


    html += `</table>`;


    return html;

}


// =====================================================
// CREATE ADMIT CARD
// =====================================================

async function createAdmitCard(
    student,
    compact = false
){

    const subjectHTML =
        await createSubjectTable(student);


    return `

        <div class="${
            compact
            ? "bulkCard"
            : "individualCard"
        }">

            <div class="schoolName">
                IPS PUBLIC SCHOOL AHIRORI HARDOI
            </div>

            <div class="schoolLine"></div>

            <div class="admitTitle">
                ADMIT CARD
            </div>

            <table class="infoTable">

                <tr>

                    <td>
                        <b>Student Name :</b>
                        ${escapeHTML(
                            student.Name || ""
                        )}
                    </td>

                    <td>
                        <b>Roll No :</b>
                        ${escapeHTML(
                            student.Roll || ""
                        )}
                    </td>

                </tr>

                <tr>

                    <td>
                        <b>Father Name :</b>
                        ${escapeHTML(
                            student.Father || ""
                        )}
                    </td>

                    <td>
                        <b>Class :</b>
                        ${escapeHTML(
                            student.Class || ""
                        )}
                    </td>

                </tr>

                <tr>

                    <td>
                        <b>Examination :</b>
                        ${escapeHTML(
                            student.ExamType || ""
                        )}
                    </td>

                    <td>
                        <b>Session :</b>
                        ${escapeHTML(
                            student.Session || ""
                        )}
                    </td>

                </tr>

            </table>


            <div class="subjectHeading">
                SUBJECT & EXAMINATION SCHEDULE
            </div>

            ${subjectHTML}


            <div class="signatureRow">

                <div class="signatureBox">

                    ____________________<br>

                    Student Signature

                </div>


                <div class="signatureBox">

                    ____________________<br>

                    Principal Signature

                </div>

            </div>

        </div>

    `;

}


// =====================================================
// INDIVIDUAL ADMIT CARD
// =====================================================

generateBtn.onclick =
async () => {

    const rollNumber =
        roll.value.trim();


    if(!rollNumber){

        alert(
            "Enter Roll Number"
        );

        return;

    }


    try{

        generateBtn.disabled = true;

        generateBtn.innerText =
            "Loading...";


        const snap =
            await getDoc(
                doc(
                    db,
                    "students_v2",
                    rollNumber
                )
            );


        if(!snap.exists()){

            alert(
                "Student Not Found"
            );

            return;

        }


        const student =
            snap.data();


        admitCard.innerHTML =
            await createAdmitCard(
                student,
                false
            );


        admitCard.style.display =
            "block";


        window.scrollTo({

            top:
                admitCard.offsetTop - 20,

            behavior:
                "smooth"

        });


    }
    catch(error){

        console.error(error);

        alert(
            "Error loading admit card:\n" +
            error.message
        );

    }
    finally{

        generateBtn.disabled = false;

        generateBtn.innerText =
            "🎫 Generate Admit Card";

    }

};


// =====================================================
// CREATE BULK A4 PAGES
// =====================================================

async function createBulkPages(){

    const students =
        getSelectedStudents();


    if(students.length === 0){

        throw new Error(
            "Selected class में कोई student नहीं मिला."
        );

    }


    students.sort((a,b) => {

        return String(
            a.Roll || ""
        ).localeCompare(
            String(
                b.Roll || ""
            ),
            undefined,
            {
                numeric:true
            }
        );

    });


    const perPage =
        Number(
            cardsPerPage.value
        );


    bulkContainer.innerHTML =
        "";


    for(
        let i = 0;
        i < students.length;
        i += perPage
    ){

        const pageStudents =
            students.slice(
                i,
                i + perPage
            );


        const page =
            document.createElement(
                "div"
            );


        page.className =
            perPage === 2
            ? "pdfPage twoCards"
            : "pdfPage threeCards";


        for(
            let j = 0;
            j < pageStudents.length;
            j++
        ){

            bulkStatus.innerText =
                `Preparing Admit Cards... ${
                    i + j + 1
                } / ${students.length}`;


            const html =
                await createAdmitCard(
                    pageStudents[j],
                    true
                );


            page.insertAdjacentHTML(
                "beforeend",
                html
            );

        }


        bulkContainer.appendChild(
            page
        );

    }


    return students.length;

}


// =====================================================
// DOWNLOAD ALL PDF
// =====================================================

downloadAllBtn.onclick =
async () => {

    try{

        const students =
            getSelectedStudents();


        if(students.length === 0){

            alert(
                "इस class में कोई student नहीं मिला."
            );

            return;

        }


        downloadAllBtn.disabled =
            true;

        printAllBtn.disabled =
            true;


        bulkStatus.style.display =
            "block";


        const total =
            await createBulkPages();


        const selectedClass =
            classSelect.value === "ALL"
            ? "All_Classes"
            : classSelect.value
                .replace(/\s+/g,"_");


        const perPage =
            cardsPerPage.value;


        bulkStatus.innerText =
            `Generating PDF...`;


        const options = {

            margin:0,

            filename:
                `${selectedClass}_Admit_Cards_${perPage}_Per_Page.pdf`,

            image:{
                type:"jpeg",
                quality:.98
            },

            html2canvas:{
                scale:2,
                useCORS:true,
                backgroundColor:"#ffffff"
            },

            jsPDF:{
                unit:"mm",
                format:"a4",
                orientation:"portrait"
            },

            pagebreak:{
                mode:[
                    "css",
                    "legacy"
                ]
            }

        };


        await html2pdf()
            .set(options)
            .from(bulkContainer)
            .save();


        bulkStatus.innerText =
            `✅ ${total} Admit Cards downloaded successfully.`;

    }
    catch(error){

        console.error(error);

        alert(
            "PDF बनाने में error आया:\n" +
            error.message
        );

        bulkStatus.innerText =
            "❌ PDF generation failed.";

    }
    finally{

        downloadAllBtn.disabled =
            false;

        printAllBtn.disabled =
            false;

    }

};


// =====================================================
// PRINT ALL
// =====================================================

printAllBtn.onclick =
async () => {

    try{

        const students =
            getSelectedStudents();


        if(students.length === 0){

            alert(
                "इस class में कोई student नहीं मिला."
            );

            return;

        }


        downloadAllBtn.disabled =
            true;

        printAllBtn.disabled =
            true;


        bulkStatus.style.display =
            "block";


        const total =
            await createBulkPages();


        const printWindow =
            window.open(
                "",
                "_blank"
            );


        if(!printWindow){

            alert(
                "Please allow pop-ups for this website."
            );

            return;

        }


        printWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
All Admit Cards
</title>

<style>

*{
box-sizing:border-box;
font-family:Arial,sans-serif;
}

body{
margin:0;
background:#fff;
}

.pdfPage{

width:210mm;
height:297mm;

padding:7mm;

display:flex;
flex-direction:column;

gap:5mm;

page-break-after:always;
break-after:page;

}

.pdfPage.twoCards .bulkCard{
height:138mm;
}

.pdfPage.threeCards .bulkCard{
height:91mm;
}

.bulkCard{

width:100%;

background:#fff;

border:1.5px solid #0b3d91;

position:relative;

padding:5mm;

overflow:hidden;

}

.bulkCard:before{

content:"";

position:absolute;

left:0;

top:0;

width:100%;

height:3px;

background:#d4a72c;

}

.schoolName{

text-align:center;

color:#0b3d91;

font-size:16px;

font-weight:900;

}

.schoolLine{

width:65px;

height:2px;

background:#d4a72c;

margin:3px auto;

}

.admitTitle{

text-align:center;

font-size:12px;

font-weight:800;

letter-spacing:1.5px;

margin:3px 0 6px;

}

.infoTable{

width:100%;

border-collapse:collapse;

margin:5px 0;

}

.infoTable td{

border:1px solid #d5dce8;

padding:3px 4px;

font-size:9px;

}

.subjectHeading{

font-size:10px;

font-weight:700;

color:#0b3d91;

margin:5px 0 3px;

}

.subjectTable{

width:100%;

border-collapse:collapse;

}

.subjectTable th,
.subjectTable td{

border:1px solid #777;

padding:2.5px;

text-align:center;

font-size:8px;

}

.subjectTable th{

background:#edf3ff;

}

.signatureRow{

display:flex;

justify-content:space-between;

margin-top:10px;

font-size:8px;

text-align:center;

}

.signatureBox{
min-width:100px;
}

@media print{

@page{

size:A4;

margin:0;

}

body{
margin:0;
}

.pdfPage{

width:210mm;
height:297mm;

}

}

</style>

</head>

<body>

${bulkContainer.innerHTML}

</body>

</html>

        `);


        printWindow.document.close();

        printWindow.focus();


        setTimeout(() => {

            printWindow.print();

        },800);


        bulkStatus.innerText =
            `✅ ${total} Admit Cards ready for printing.`;

    }
    catch(error){

        console.error(error);

        alert(
            "Print error:\n" +
            error.message
        );

    }
    finally{

        downloadAllBtn.disabled =
            false;

        printAllBtn.disabled =
            false;

    }

};


// =====================================================
// CLASS CHANGE
// =====================================================

classSelect.onchange =
() => {

    updateStudentCount();

};


// =====================================================
// 2 / 3 PER PAGE CHANGE
// =====================================================

cardsPerPage.onchange =
() => {

    const students =
        getSelectedStudents();


    const pages =
        Math.ceil(
            students.length /
            Number(
                cardsPerPage.value
            )
        );


    bulkStatus.style.display =
        "block";


    bulkStatus.innerText =
        `${students.length} students → लगभग ${pages} A4 pages`;

};


// =====================================================
// START
// =====================================================

loadStudents()
.catch(error => {

    console.error(error);

    studentCount.innerText =
        "Students load नहीं हो सके.";

    alert(
        "Students load नहीं हो सके:\n" +
        error.message
    );

});
