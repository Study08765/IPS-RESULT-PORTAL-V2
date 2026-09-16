import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    getDocs,
    collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const roll = document.getElementById("roll");
const generateBtn = document.getElementById("generateBtn");
const classSelect = document.getElementById("classSelect");
const cardsPerPage = document.getElementById("cardsPerPage");
const studentCount = document.getElementById("studentCount");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const printAllBtn = document.getElementById("printAllBtn");
const admitCard = document.getElementById("admitCard");
const bulkContainer = document.getElementById("bulkContainer");
const bulkStatus = document.getElementById("bulkStatus");


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
// DATE PARSER
// =====================================================

function parseExamDate(value){

    if(!value){
        return null;
    }

    const dateString =
        String(value).trim();

    let parts;

    if(dateString.includes("-")){
        parts = dateString.split("-");
    }
    else if(dateString.includes("/")){
        parts = dateString.split("/");
    }
    else{
        return null;
    }

    if(parts.length !== 3){
        return null;
    }

    let year;
    let month;
    let day;


    if(parts[0].length === 4){

        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);

    }
    else{

        day = Number(parts[0]);
        month = Number(parts[1]);
        year = Number(parts[2]);

    }


    if(
        !year ||
        !month ||
        !day
    ){
        return null;
    }


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if(
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ){
        return null;
    }


    return date;
}


// =====================================================
// DISPLAY DATE
// =====================================================

function formatDisplayDate(value){

    const date =
        parseExamDate(value);

    if(!date){
        return String(value || "");
    }

    const day =
        String(
            date.getDate()
        ).padStart(2,"0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2,"0");

    const year =
        date.getFullYear();

    return `${day}-${month}-${year}`;
}


// =====================================================
// DAY NAME
// =====================================================

function getDayName(value){

    const date =
        parseExamDate(value);

    if(!date){
        return "";
    }

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    return days[
        date.getDay()
    ];
}


// =====================================================
// TIME TO MINUTES
// =====================================================

function timeToMinutes(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){
        return 0;
    }

    let time =
        String(value)
            .trim()
            .toUpperCase();

    let ampm = null;


    if(time.includes("AM")){
        ampm = "AM";
    }
    else if(time.includes("PM")){
        ampm = "PM";
    }


    time =
        time
            .replace("AM","")
            .replace("PM","")
            .trim();


    const parts =
        time.split(":");


    let hour =
        Number(parts[0]);

    let minute =
        Number(parts[1] || 0);


    if(
        isNaN(hour) ||
        isNaN(minute)
    ){
        return 0;
    }


    if(ampm === "AM"){

        if(hour === 12){
            hour = 0;
        }

    }
    else if(ampm === "PM"){

        if(hour !== 12){
            hour += 12;
        }

    }


    return (
        hour * 60
    ) + minute;
}


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){
        return "";
    }


    let time =
        String(value)
            .trim()
            .toUpperCase();


    let ampm = null;


    if(time.includes("AM")){
        ampm = "AM";
    }
    else if(time.includes("PM")){
        ampm = "PM";
    }


    time =
        time
            .replace("AM","")
            .replace("PM","")
            .trim();


    const parts =
        time.split(":");


    let hour =
        Number(parts[0]);

    let minute =
        Number(parts[1] || 0);


    if(
        isNaN(hour) ||
        isNaN(minute)
    ){
        return String(value);
    }


    if(!ampm){

        if(hour >= 0 && hour <= 23){

            ampm =
                hour >= 12
                ? "PM"
                : "AM";


            if(hour === 0){
                hour = 12;
            }
            else if(hour > 12){
                hour -= 12;
            }

        }

    }


    return (
        String(hour) +
        "." +
        String(minute).padStart(2,"0") +
        " " +
        ampm
    );
}


// =====================================================
// FORMAT TIME RANGE
// =====================================================

function formatTimeRange(
    startTime,
    endTime
){

    const start =
        formatTime(startTime);

    const end =
        formatTime(endTime);


    if(!start && !end){
        return "";
    }


    if(start && end){
        return `${start} - ${end}`;
    }


    return start || end;
}


// =====================================================
// LOAD ALL STUDENTS
// =====================================================

async function loadStudents(){

    const snap =
        await getDocs(
            collection(
                db,
                "students_v2"
            )
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
            document.createElement(
                "option"
            );


        option.value = cls;
        option.textContent = cls;


        classSelect.appendChild(
            option
        );

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


    return allStudents.filter(
        student => {

            return normalizeClass(
                student.Class
            ) === normalizeClass(
                selected
            );

        }
    );

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
        className +
        "_" +
        subjectName;


    if(
        Object.prototype.hasOwnProperty
        .call(
            scheduleCache,
            key
        )
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
// GET STUDENT SCHEDULE
// =====================================================

async function getStudentSchedule(
    student
){

    const schedule = [];


    const subjects =
        Array.isArray(
            student.Subjects
        )
        ? student.Subjects
        : [];


    for(
        const sub of subjects
    ){

        if(
            !sub ||
            !sub.name
        ){
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
            !exam.StartTime
        ){
            continue;
        }


        schedule.push({

            subject:
                sub.name,

            date:
                exam.Date,

            startTime:
                exam.StartTime,

            endTime:
                exam.EndTime || "",

            dateObject:
                parseExamDate(
                    exam.Date
                ),

            timeMinutes:
                timeToMinutes(
                    exam.StartTime
                )

        });

    }


    schedule.sort(
        (a,b) => {

            const dateA =
                a.dateObject
                ? a.dateObject.getTime()
                : Number.MAX_SAFE_INTEGER;


            const dateB =
                b.dateObject
                ? b.dateObject.getTime()
                : Number.MAX_SAFE_INTEGER;


            if(dateA !== dateB){
                return dateA - dateB;
            }


            return (
                a.timeMinutes -
                b.timeMinutes
            );

        }
    );


    return schedule;
}


// =====================================================
// SUBJECT TABLE
// =====================================================

async function createSubjectTable(
    student
){

    const schedule =
        await getStudentSchedule(
            student
        );


    let html = `

        <div class="scheduleBox">

            <div class="scheduleTitle">
                EXAMINATION SCHEDULE
            </div>


            <table class="subjectTable">

                <thead>

                    <tr>

                        <th class="subjectCol">
                            SUBJECT
                        </th>

                        <th class="dateCol">
                            DATE
                        </th>

                        <th class="dayCol">
                            DAY
                        </th>

                        <th class="timeCol">
                            TIME
                        </th>

                    </tr>

                </thead>


                <tbody>

    `;


    if(schedule.length === 0){

        html += `

            <tr>

                <td
                    colspan="4"
                    class="noSchedule"
                >
                    NO EXAM SCHEDULE AVAILABLE
                </td>

            </tr>

        `;


        html += `

                </tbody>

            </table>

        </div>

        `;


        return html;
    }


    schedule.forEach(item => {

        const displayDate =
            formatDisplayDate(
                item.date
            );


        const day =
            getDayName(
                item.date
            );


        const time =
            formatTimeRange(
                item.startTime,
                item.endTime
            );


        html += `

            <tr>

                <td class="subjectCell">
                    ${escapeHTML(
                        item.subject
                    )}
                </td>

                <td class="dateCell">
                    ${escapeHTML(
                        displayDate
                    )}
                </td>

                <td class="dayCell">
                    ${escapeHTML(
                        day
                    )}
                </td>

                <td class="timeCell">
                    ${escapeHTML(
                        time
                    )}
                </td>

            </tr>

        `;

    });


    html += `

                </tbody>

            </table>

        </div>

    `;


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
        await createSubjectTable(
            student
        );


    return `

        <div class="${
            compact
            ? "bulkCard"
            : "individualCard"
        }">


            <div class="cardBorder">


                <!-- SCHOOL HEADER -->

                <div class="schoolHeader">

                    <div class="schoolName">
                        IPS PUBLIC SCHOOL AHIRORI HARDOI
                    </div>


                    <div class="headerLine"></div>


                    <div class="admitTitle">
                        ADMIT CARD
                    </div>


                    <div class="examSession">

                        ${escapeHTML(
                            student.ExamType ||
                            "EXAMINATION"
                        )}

                        ${
                            student.Session
                            ? ` • ${escapeHTML(
                                student.Session
                              )}`
                            : ""
                        }

                    </div>

                </div>


                <!-- STUDENT DETAILS -->

                <div class="studentInfo">


                    <div class="infoLabel">
                        STUDENT NAME
                    </div>


                    <div class="infoValue">
                        ${escapeHTML(
                            student.Name || ""
                        )}
                    </div>


                    <div class="infoLabel">
                        ROLL NO.
                    </div>


                    <div class="infoValue rollValue">
                        ${escapeHTML(
                            student.Roll || ""
                        )}
                    </div>


                    <div class="infoLabel">
                        FATHER NAME
                    </div>


                    <div class="infoValue">
                        ${escapeHTML(
                            student.Father || ""
                        )}
                    </div>


                    <div class="infoLabel">
                        CLASS
                    </div>


                    <div class="infoValue">
                        ${escapeHTML(
                            student.Class || ""
                        )}
                    </div>


                </div>


                <!-- EXAMINATION SCHEDULE -->

                ${subjectHTML}


                <!-- BEST WISHES -->

                <div class="bestWishes">

                    BEST WISHES FOR YOUR EXAM

                </div>


                <!-- SIGNATURE -->

                <div class="signatureRow">


                    <div class="signatureBox">

                        <div class="signatureLine">
                            __________________
                        </div>

                        <div class="signatureText">
                            Student Signature
                        </div>

                    </div>


                    <div class="signatureBox">

                        <div class="signatureLine">
                            __________________
                        </div>

                        <div class="signatureText">
                            Principal Signature
                        </div>

                    </div>


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

        generateBtn.disabled =
            true;


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

        generateBtn.disabled =
            false;


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


    students.sort(
        (a,b) => {

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

        }
    );


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
                .replace(
                    /\s+/g,
                    "_"
                );


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

/* =====================================================
   BASIC
   ===================================================== */

*{
    box-sizing:border-box;
    font-family:Arial,Helvetica,sans-serif;
}


html,
body{

    margin:0;
    padding:0;

    width:100%;

    background:#fff;

    color:#18212f;

}


/* =====================================================
   A4 PAGE
   ===================================================== */

.pdfPage{

    width:210mm;

    height:297mm;

    padding:6mm 7mm;

    display:flex;

    flex-direction:column;

    justify-content:flex-start;

    gap:4mm;

    page-break-after:always;

    break-after:page;

    overflow:hidden;

}


/* =====================================================
   CARD
   ===================================================== */

.bulkCard{

    width:100%;

    background:#fff;

    border:1px solid #28558f;

    padding:3.5mm;

    page-break-inside:avoid;

    break-inside:avoid;

}


.cardBorder{

    width:100%;

    border:1px solid #d7dde5;

    padding:3mm;

}


/* =====================================================
   SCHOOL HEADER
   ===================================================== */

.schoolHeader{

    width:100%;

    text-align:center;

    padding:0 0 2.5mm;

}


.schoolName{

    width:100%;

    white-space:nowrap;

    color:#174b8f;

    font-size:21px;

    font-weight:900;

    letter-spacing:.2px;

    line-height:1.1;

    text-align:center;

}


.headerLine{

    width:60px;

    height:2px;

    background:#c8a52b;

    margin:3px auto 4px;

}


.admitTitle{

    color:#222;

    font-size:12px;

    font-weight:900;

    letter-spacing:1.8px;

    line-height:1.1;

}


.examSession{

    color:#666;

    font-size:8px;

    font-weight:700;

    margin-top:3px;

}


/* =====================================================
   STUDENT DETAILS
   4 COLUMN
   ===================================================== */

.studentInfo{

    width:100%;

    display:grid;

    grid-template-columns:
        18% 32% 18% 32%;

    border:1px solid #d4dbe5;

    margin-top:2.5mm;

    margin-bottom:3mm;

}


.studentInfo > div{

    min-width:0;

    min-height:30px;

    display:flex;

    align-items:center;

    padding:5px 7px;

    border-right:1px solid #d4dbe5;

    border-bottom:1px solid #d4dbe5;

}


.studentInfo > div:nth-child(4),
.studentInfo > div:nth-child(8){

    border-right:none;

}


.studentInfo > div:nth-child(5),
.studentInfo > div:nth-child(6),
.studentInfo > div:nth-child(7),
.studentInfo > div:nth-child(8){

    border-bottom:none;

}


.studentInfo .infoLabel{

    background:#f5f7fa;

    color:#3f4b5a;

    font-size:8px;

    font-weight:900;

    white-space:nowrap;

    letter-spacing:.2px;

}


.studentInfo .infoValue{

    color:#111827;

    font-size:10px;

    font-weight:900;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:ellipsis;

}


.studentInfo .rollValue{

    color:#174b8f;

}


/* =====================================================
   SCHEDULE
   ===================================================== */

.scheduleBox{

    width:100%;

    border:1px solid #d4dbe5;

}


.scheduleTitle{

    width:100%;

    background:#f1f4f8;

    color:#174b8f;

    font-size:8px;

    font-weight:900;

    letter-spacing:.6px;

    padding:4px 6px;

    border-bottom:1px solid #d4dbe5;

}


/* =====================================================
   SUBJECT TABLE
   ===================================================== */

.subjectTable{

    width:100%;

    border-collapse:collapse;

    table-layout:fixed;

}


.subjectTable th,
.subjectTable td{

    border-right:1px solid #d4dbe5;

    border-bottom:1px solid #d4dbe5;

    padding:3.5px 4px;

    vertical-align:middle;

}


.subjectTable th:last-child,
.subjectTable td:last-child{

    border-right:none;

}


.subjectTable tbody tr:last-child td{

    border-bottom:none;

}


/* =====================================================
   TABLE HEADINGS
   ===================================================== */

.subjectTable th{

    background:#fafbfd;

    color:#263342;

    font-size:7px;

    font-weight:900;

    text-align:center !important;

    text-transform:uppercase;

    letter-spacing:.3px;

}


/* =====================================================
   TABLE DATA
   ===================================================== */

.subjectTable td{

    font-size:7.7px;

    font-weight:700;

    color:#333;

    text-align:center;

}


/* =====================================================
   COLUMN WIDTH
   ===================================================== */

.subjectCol{

    width:34%;

}


.dateCol{

    width:21%;

}


.dayCol{

    width:19%;

}


.timeCol{

    width:26%;

}


/* =====================================================
   SUBJECT CENTER
   ===================================================== */

.subjectCell{

    text-align:center !important;

    color:#174b8f !important;

    font-weight:900 !important;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:ellipsis;

}


/* =====================================================
   DATE
   ===================================================== */

.dateCell{

    text-align:center !important;

    font-weight:800 !important;

}


/* =====================================================
   DAY
   ===================================================== */

.dayCell{

    text-align:center !important;

    font-weight:700 !important;

}


/* =====================================================
   TIME
   ===================================================== */

.timeCell{

    text-align:center !important;

    font-weight:800 !important;

    white-space:nowrap;

}


/* =====================================================
   NO SCHEDULE
   ===================================================== */

.noSchedule{

    text-align:center !important;

    color:#777 !important;

    font-weight:800 !important;

    padding:6px !important;

}


/* =====================================================
   BEST WISHES
   ===================================================== */

.bestWishes{

    text-align:center;

    color:#174b8f;

    font-size:7.5px;

    font-weight:900;

    margin-top:3.5mm;

    padding-top:2.5mm;

    border-top:1px solid #c8a52b;

    letter-spacing:.2px;

}


/* =====================================================
   SIGNATURE
   ===================================================== */

.signatureRow{

    display:flex;

    justify-content:space-between;

    align-items:flex-end;

    margin-top:5mm;

    padding:0 6mm;

}


.signatureBox{

    width:95px;

    text-align:center;

}


.signatureLine{

    color:#222;

    font-size:8px;

    line-height:1;

    margin-bottom:2px;

}


.signatureText{

    color:#555;

    font-size:7px;

    font-weight:700;

}


/* =====================================================
   TWO CARDS
   ===================================================== */

.pdfPage.twoCards{

    gap:5mm;

}


.pdfPage.twoCards .bulkCard{

    min-height:125mm;

}


/* =====================================================
   THREE CARDS
   ===================================================== */

.pdfPage.threeCards{

    gap:3mm;

}


.pdfPage.threeCards .bulkCard{

    min-height:93mm;

    padding:2.5mm;

}


.pdfPage.threeCards .cardBorder{

    padding:2.5mm;

}


.pdfPage.threeCards .schoolName{

    font-size:17px;

}


.pdfPage.threeCards .headerLine{

    margin:2px auto 3px;

}


.pdfPage.threeCards .admitTitle{

    font-size:10px;

}


.pdfPage.threeCards .examSession{

    font-size:6.5px;

    margin-top:2px;

}


/* =====================================================
   THREE CARD STUDENT DETAILS
   ===================================================== */

.pdfPage.threeCards .studentInfo{

    grid-template-columns:
        18% 32% 18% 32%;

    margin-top:2mm;

    margin-bottom:2mm;

}


.pdfPage.threeCards .studentInfo > div{

    min-height:23px;

    padding:3px 5px;

}


.pdfPage.threeCards .studentInfo .infoLabel{

    font-size:6.5px;

}


.pdfPage.threeCards .studentInfo .infoValue{

    font-size:8px;

    font-weight:900;

}


/* =====================================================
   THREE CARD TABLE
   ===================================================== */

.pdfPage.threeCards .scheduleTitle{

    font-size:6.5px;

    padding:3px 5px;

}


.pdfPage.threeCards .subjectTable th{

    font-size:5.8px;

    padding:2.5px 2px;

    font-weight:900;

}


.pdfPage.threeCards .subjectTable td{

    font-size:6.2px;

    padding:2.5px 2px;

}


.pdfPage.threeCards .subjectCell{

    text-align:center !important;

    font-weight:900 !important;

}


.pdfPage.threeCards .bestWishes{

    font-size:6px;

    margin-top:2mm;

    padding-top:1.8mm;

}


.pdfPage.threeCards .signatureRow{

    margin-top:3mm;

    padding:0 4mm;

}


.pdfPage.threeCards .signatureBox{

    width:78px;

}


.pdfPage.threeCards .signatureLine{

    font-size:6.5px;

}


.pdfPage.threeCards .signatureText{

    font-size:5.8px;

}


/* =====================================================
   PRINT
   ===================================================== */

@media print{

    @page{

        size:A4;

        margin:0;

    }


    html,
    body{

        margin:0;

        padding:0;

        width:210mm;

        background:#fff;

    }


    .pdfPage{

        width:210mm;

        height:297mm;

        page-break-after:always;

        break-after:page;

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


        setTimeout(
            () => {

                printWindow.print();

            },
            800
        );


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
