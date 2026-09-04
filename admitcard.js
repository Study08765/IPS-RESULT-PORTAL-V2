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

        <div class="scheduleTitle">
            <span class="scheduleIcon">◆</span>
            SUBJECT & EXAMINATION SCHEDULE
        </div>

        <table class="subjectTable">

            <tr>

                <th>SUBJECT</th>

                <th>EXAM DATE</th>

                <th>DAY</th>

                <th>TIME</th>

            </tr>

    `;


    if(schedule.length === 0){

        html += `

            <tr>

                <td colspan="4" class="noSchedule">
                    No Exam Schedule Available
                </td>

            </tr>

        `;


        html += `</table>`;

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

                <td>
                    ${escapeHTML(
                        displayDate
                    )}
                </td>

                <td>
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
        await createSubjectTable(
            student
        );


    return `

        <div class="${
            compact
            ? "bulkCard"
            : "individualCard"
        }">

            <!-- PREMIUM BORDER -->

            <div class="cardTopAccent"></div>


            <!-- HEADER -->

            <div class="premiumHeader">

                <div class="schoolMonogram">
                    IPS
                </div>

                <div class="schoolHeaderText">

                    <div class="schoolName">
                        IPS PUBLIC SCHOOL
                    </div>

                    <div class="schoolLocation">
                        AHIRORI • HARDOI
                    </div>

                    <div class="schoolTagline">
                        DISCIPLINE • KNOWLEDGE • EXCELLENCE
                    </div>

                </div>

                <div class="headerBadge">
                    EXAM<br>
                    <span>2026–27</span>
                </div>

            </div>


            <div class="goldDivider">

                <span></span>
                <b>✦</b>
                <span></span>

            </div>


            <!-- TITLE -->

            <div class="admitTitleWrap">

                <div class="admitTitle">
                    ADMIT CARD
                </div>

                <div class="admitSubtitle">
                    EXAMINATION SESSION 2026–27
                </div>

            </div>


            <!-- ROLL NUMBER -->

            <div class="rollHighlight">

                <div class="rollLabel">
                    ROLL NUMBER
                </div>

                <div class="rollValue">
                    ${escapeHTML(
                        student.Roll || ""
                    )}
                </div>

            </div>


            <!-- STUDENT INFORMATION -->

            <div class="sectionLabel">
                <span>STUDENT INFORMATION</span>
            </div>


            <table class="infoTable">

                <tr>

                    <td>

                        <span class="infoLabel">
                            STUDENT NAME
                        </span>

                        <strong>
                            ${escapeHTML(
                                student.Name || ""
                            )}
                        </strong>

                    </td>

                    <td>

                        <span class="infoLabel">
                            FATHER'S NAME
                        </span>

                        <strong>
                            ${escapeHTML(
                                student.Father || ""
                            )}
                        </strong>

                    </td>

                </tr>


                <tr>

                    <td>

                        <span class="infoLabel">
                            CLASS
                        </span>

                        <strong>
                            ${escapeHTML(
                                student.Class || ""
                            )}
                        </strong>

                    </td>

                    <td>

                        <span class="infoLabel">
                            EXAMINATION
                        </span>

                        <strong>
                            ${escapeHTML(
                                student.ExamType || ""
                            )}
                        </strong>

                    </td>

                </tr>


                <tr>

                    <td colspan="2">

                        <span class="infoLabel">
                            SESSION
                        </span>

                        <strong>
                            ${escapeHTML(
                                student.Session || "2026-27"
                            )}
                        </strong>

                    </td>

                </tr>

            </table>


            <!-- SCHEDULE -->

            ${subjectHTML}


            <!-- IMPORTANT NOTE -->

            <div class="examNote">

                <span class="noteIcon">!</span>

                <div>

                    <b>IMPORTANT:</b>

                    Please report to the examination room
                    at least 15 minutes before the scheduled
                    examination time.

                </div>

            </div>


            <!-- BEST WISHES -->

            <div class="bestWishes">

                <span>✦</span>

                BEST WISHES FOR YOUR EXAM

                <span>✦</span>

                <small>
                    Stay Confident • Stay Focused • Do Your Best
                </small>

            </div>


            <!-- SIGNATURE -->

            <div class="signatureRow">

                <div class="signatureBox">

                    <div class="signatureLine"></div>

                    <b>Student Signature</b>

                    <small>
                        Candidate
                    </small>

                </div>


                <div class="officialSeal">
                    <span>OFFICIAL</span>
                    <b>IPS</b>
                    <small>EXAM CELL</small>
                </div>


                <div class="signatureBox">

                    <div class="signatureLine"></div>

                    <b>Principal Signature</b>

                    <small>
                        IPS Public School
                    </small>

                </div>

            </div>


            <div class="cardFooter">

                <span>
                    IPS PUBLIC SCHOOL • AHIRORI HARDOI
                </span>

                <span>
                    SESSION 2026–27
                </span>

            </div>

        </div>

    `;

}


// =====================================================
// PREMIUM CSS
// =====================================================

const premiumStyle = document.createElement("style");

premiumStyle.innerHTML = `

/* =====================================================
   PREMIUM ADMIT CARD
===================================================== */

.individualCard,
.bulkCard{

    --navy:#0a2f63;
    --navyDark:#061d3d;
    --gold:#c79a28;
    --goldLight:#e8cc72;
    --border:#d8dee8;
    --soft:#f5f8fc;

    position:relative;

    background:#ffffff;

    color:#172235;

    border:1px solid #c9d1df;

    overflow:hidden;

    box-shadow:
        0 5px 18px rgba(7,34,70,.10);

}


/* Premium outer line */

.individualCard:after,
.bulkCard:after{

    content:"";

    position:absolute;

    inset:5px;

    border:1px solid rgba(199,154,40,.35);

    pointer-events:none;

}


/* Top gold accent */

.cardTopAccent{

    height:5px;

    width:100%;

    background:
        linear-gradient(
            90deg,
            var(--navyDark),
            var(--gold),
            var(--goldLight),
            var(--gold),
            var(--navyDark)
        );

}


/* Header */

.premiumHeader{

    display:flex;

    align-items:center;

    justify-content:space-between;

    padding:7px 9px 4px;

    position:relative;

}


.schoolMonogram{

    width:37px;
    height:37px;

    display:flex;

    align-items:center;
    justify-content:center;

    background:
        linear-gradient(
            145deg,
            #092c5e,
            #0d4389
        );

    color:#fff;

    border:2px solid var(--gold);

    border-radius:50%;

    font-size:11px;

    font-weight:900;

    letter-spacing:.5px;

    box-shadow:
        0 2px 6px rgba(0,0,0,.16);

}


.schoolHeaderText{

    flex:1;

    text-align:center;

    padding:0 6px;

}


.schoolName{

    color:#092e62;

    font-size:16px;

    font-weight:950;

    letter-spacing:.7px;

    line-height:1.05;

}


.schoolLocation{

    color:#9a7417;

    font-size:9px;

    font-weight:800;

    letter-spacing:1.7px;

    margin-top:2px;

}


.schoolTagline{

    color:#68758a;

    font-size:6.5px;

    letter-spacing:1px;

    margin-top:2px;

}


.headerBadge{

    min-width:39px;

    padding:4px 5px;

    text-align:center;

    color:#fff;

    background:#0a3166;

    border-radius:4px;

    font-size:6.5px;

    line-height:1.25;

    font-weight:800;

    letter-spacing:.5px;

}


.headerBadge span{

    color:#e8cb72;

    font-size:7px;

}


/* Divider */

.goldDivider{

    display:flex;

    align-items:center;

    gap:5px;

    margin:1px 9px 3px;

}


.goldDivider span{

    height:1px;

    flex:1;

    background:
        linear-gradient(
            90deg,
            transparent,
            #c79a28
        );

}


.goldDivider span:last-child{

    background:
        linear-gradient(
            90deg,
            #c79a28,
            transparent
        );

}


.goldDivider b{

    color:#c79a28;

    font-size:8px;

}


/* Title */

.admitTitleWrap{

    text-align:center;

    margin:2px 0 5px;

}


.admitTitle{

    display:inline-block;

    color:#092f64;

    font-size:12px;

    font-weight:950;

    letter-spacing:2.3px;

    padding:2px 16px;

    border-bottom:2px solid #c79a28;

}


.admitSubtitle{

    color:#7b8797;

    font-size:6.5px;

    letter-spacing:1.2px;

    margin-top:2px;

    font-weight:700;

}


/* Roll number */

.rollHighlight{

    display:flex;

    align-items:center;

    justify-content:center;

    width:max-content;

    min-width:105px;

    margin:3px auto 6px;

    border:1px solid #c79a28;

    border-radius:4px;

    overflow:hidden;

    background:#fffdf6;

}


.rollLabel{

    background:#0a3166;

    color:white;

    font-size:7px;

    font-weight:800;

    padding:5px 7px;

    letter-spacing:.7px;

}


.rollValue{

    color:#0a3166;

    font-size:11px;

    font-weight:950;

    padding:3px 9px;

    letter-spacing:1px;

}


/* Section label */

.sectionLabel{

    display:flex;

    align-items:center;

    gap:5px;

    margin:4px 0 3px;

}


.sectionLabel:before{

    content:"";

    width:4px;

    height:13px;

    background:#c79a28;

}


.sectionLabel span{

    color:#0a3166;

    font-size:7.5px;

    font-weight:900;

    letter-spacing:1px;

}


/* Info table */

.infoTable{

    width:100%;

    border-collapse:separate;

    border-spacing:3px;

    margin:0;

}


.infoTable td{

    width:50%;

    background:#f7f9fc;

    border:1px solid #e0e5ed;

    border-left:3px solid #0a3166;

    padding:4px 5px;

    vertical-align:middle;

}


.infoTable td[colspan="2"]{

    width:100%;

}


.infoLabel{

    display:block;

    color:#7b8797;

    font-size:6px;

    font-weight:800;

    letter-spacing:.7px;

    margin-bottom:1px;

}


.infoTable strong{

    display:block;

    color:#18253a;

    font-size:8.5px;

    font-weight:800;

    line-height:1.15;

}


/* Schedule heading */

.scheduleTitle{

    display:flex;

    align-items:center;

    gap:4px;

    color:#0a3166;

    font-size:7.5px;

    font-weight:900;

    letter-spacing:.8px;

    margin:5px 0 3px;

}


.scheduleIcon{

    color:#c79a28;

    font-size:6px;

}


/* Schedule */

.subjectTable{

    width:100%;

    border-collapse:collapse;

    border:1px solid #bfc8d7;

}


.subjectTable th,
.subjectTable td{

    border:1px solid #cbd3df;

    padding:3px 2px;

    text-align:center;

    font-size:6.8px;

    line-height:1.1;

}


.subjectTable th{

    background:#0a3166;

    color:#ffffff;

    font-size:6px;

    letter-spacing:.5px;

    font-weight:900;

}


.subjectTable tr:nth-child(even) td{

    background:#f7f9fc;

}


.subjectCell{

    font-weight:800;

    color:#18253a;

}


.timeCell{

    font-weight:800;

    color:#0a3166;

}


.noSchedule{

    color:#8b95a5;

    font-style:italic;

    padding:6px !important;

}


/* Important note */

.examNote{

    display:flex;

    gap:5px;

    align-items:center;

    margin-top:5px;

    padding:4px 5px;

    background:#fffaf0;

    border:1px solid #ead9a6;

    border-radius:3px;

    color:#596577;

    font-size:6px;

    line-height:1.25;

}


.noteIcon{

    display:flex;

    align-items:center;

    justify-content:center;

    width:14px;
    height:14px;

    flex:none;

    border-radius:50%;

    background:#c79a28;

    color:#fff;

    font-size:8px;

    font-weight:900;

}


/* Wishes */

.bestWishes{

    text-align:center;

    color:#0a3166;

    font-size:7px;

    font-weight:900;

    letter-spacing:.6px;

    margin-top:5px;

    padding-top:4px;

    border-top:1px solid #d9c277;

}


.bestWishes span{

    color:#c79a28;

    margin:0 3px;

}


.bestWishes small{

    display:block;

    color:#788598;

    font-size:5.8px;

    letter-spacing:.7px;

    font-weight:700;

    margin-top:1px;

}


/* Signature */

.signatureRow{

    display:flex;

    align-items:flex-end;

    justify-content:space-between;

    margin-top:11px;

    padding:0 7px;

}


.signatureBox{

    width:78px;

    text-align:center;

    color:#25334a;

}


.signatureLine{

    border-top:1px solid #354258;

    margin-bottom:2px;

}


.signatureBox b{

    display:block;

    font-size:6px;

    font-weight:900;

}


.signatureBox small{

    display:block;

    color:#8792a1;

    font-size:5px;

    margin-top:1px;

}


/* Official seal */

.officialSeal{

    width:39px;
    height:39px;

    border:1.5px solid #c79a28;

    border-radius:50%;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    color:#0a3166;

    position:relative;

}


.officialSeal:before{

    content:"";

    position:absolute;

    inset:3px;

    border:1px dashed #c79a28;

    border-radius:50%;

}


.officialSeal span{

    font-size:4px;

    font-weight:900;

    letter-spacing:.5px;

}


.officialSeal b{

    font-size:10px;

    line-height:10px;

}


.officialSeal small{

    font-size:4px;

    font-weight:800;

}


/* Footer */

.cardFooter{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-top:5px;

    padding:3px 5px;

    background:#092e62;

    color:#fff;

    font-size:4.8px;

    font-weight:800;

    letter-spacing:.45px;

}


/* Individual */

.individualCard{

    max-width:850px;

    margin:20px auto;

    padding-bottom:0;

}


/* Bulk */

.bulkCard{

    width:100%;

}


/* =====================================================
   TWO CARDS
===================================================== */

.pdfPage.twoCards .bulkCard{

    height:138mm;

    padding:0 5mm 3mm;

}


/* =====================================================
   THREE CARDS
===================================================== */

.pdfPage.threeCards .bulkCard{

    height:91mm;

    padding:0 4mm 2mm;

}


.pdfPage.threeCards .schoolMonogram{

    width:29px;
    height:29px;

    font-size:8px;

}


.pdfPage.threeCards .schoolName{

    font-size:12px;

}


.pdfPage.threeCards .schoolLocation{

    font-size:7px;

}


.pdfPage.threeCards .schoolTagline{

    font-size:5px;

}


.pdfPage.threeCards .headerBadge{

    min-width:31px;

    font-size:5px;

}


.pdfPage.threeCards .headerBadge span{

    font-size:5.5px;

}


.pdfPage.threeCards .admitTitle{

    font-size:9px;

    padding:1px 12px;

}


.pdfPage.threeCards .admitSubtitle{

    font-size:5px;

}


.pdfPage.threeCards .rollHighlight{

    min-width:85px;

    margin-bottom:3px;

}


.pdfPage.threeCards .rollLabel{

    font-size:5px;

    padding:3px 5px;

}


.pdfPage.threeCards .rollValue{

    font-size:8px;

    padding:2px 6px;

}


.pdfPage.threeCards .sectionLabel{

    margin:2px 0;

}


.pdfPage.threeCards .sectionLabel span{

    font-size:6px;

}


.pdfPage.threeCards .infoTable{

    border-spacing:2px;

}


.pdfPage.threeCards .infoTable td{

    padding:2px 3px;

}


.pdfPage.threeCards .infoLabel{

    font-size:4.5px;

}


.pdfPage.threeCards .infoTable strong{

    font-size:6.5px;

}


.pdfPage.threeCards .scheduleTitle{

    font-size:6px;

    margin:3px 0 2px;

}


.pdfPage.threeCards .subjectTable th,
.pdfPage.threeCards .subjectTable td{

    padding:2px 1.5px;

    font-size:5.3px;

}


.pdfPage.threeCards .subjectTable th{

    font-size:4.8px;

}


.pdfPage.threeCards .examNote{

    font-size:4.8px;

    padding:2px 3px;

    margin-top:3px;

}


.pdfPage.threeCards .noteIcon{

    width:10px;
    height:10px;

    font-size:6px;

}


.pdfPage.threeCards .bestWishes{

    font-size:5.5px;

    margin-top:3px;

    padding-top:2px;

}


.pdfPage.threeCards .bestWishes small{

    font-size:4.5px;

}


.pdfPage.threeCards .signatureRow{

    margin-top:6px;

}


.pdfPage.threeCards .signatureBox{

    width:60px;

}


.pdfPage.threeCards .signatureBox b{

    font-size:4.8px;

}


.pdfPage.threeCards .signatureBox small{

    font-size:4px;

}


.pdfPage.threeCards .officialSeal{

    width:28px;
    height:28px;

}


.pdfPage.threeCards .officialSeal b{

    font-size:7px;

    line-height:7px;

}


.pdfPage.threeCards .officialSeal span,
.pdfPage.threeCards .officialSeal small{

    font-size:3px;

}


.pdfPage.threeCards .cardFooter{

    margin-top:3px;

    font-size:3.8px;

}


/* =====================================================
   TWO CARD COMPACT
===================================================== */

.pdfPage.twoCards .schoolName{

    font-size:14px;

}


.pdfPage.twoCards .schoolMonogram{

    width:33px;
    height:33px;

    font-size:9px;

}


.pdfPage.twoCards .schoolLocation{

    font-size:8px;

}


.pdfPage.twoCards .schoolTagline{

    font-size:5.5px;

}


.pdfPage.twoCards .admitTitle{

    font-size:10px;

}


.pdfPage.twoCards .infoTable td{

    padding:3px 4px;

}


.pdfPage.twoCards .infoLabel{

    font-size:5.5px;

}


.pdfPage.twoCards .infoTable strong{

    font-size:7.5px;

}


.pdfPage.twoCards .subjectTable th,
.pdfPage.twoCards .subjectTable td{

    font-size:6px;

}


.pdfPage.twoCards .signatureRow{

    margin-top:10px;

}


/* =====================================================
   PRINT SAFETY
===================================================== */

@media print{

    .individualCard,
    .bulkCard{

        box-shadow:none !important;

    }

}

`;


document.head.appendChild(
    premiumStyle
);


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
IPS Public School - Admit Cards
</title>


<style>

*{
    box-sizing:border-box;
}


html,
body{

    margin:0;
    padding:0;

    background:#fff;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

}


body{

    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;

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


.pdfPage:last-child{

    page-break-after:auto;
    break-after:auto;

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

    border:1px solid #c9d1df;

    position:relative;

    overflow:hidden;

    color:#172235;

}


.bulkCard:after{

    content:"";

    position:absolute;

    inset:5px;

    border:1px solid rgba(199,154,40,.35);

    pointer-events:none;

}


.cardTopAccent{

    height:5px;

    width:100%;

    background:
        linear-gradient(
            90deg,
            #061d3d,
            #c79a28,
            #e8cc72,
            #c79a28,
            #061d3d
        );

}


.premiumHeader{

    display:flex;

    align-items:center;

    justify-content:space-between;

    padding:7px 9px 4px;

}


.schoolMonogram{

    width:37px;
    height:37px;

    display:flex;

    align-items:center;
    justify-content:center;

    background:
        linear-gradient(
            145deg,
            #092c5e,
            #0d4389
        );

    color:#fff;

    border:2px solid #c79a28;

    border-radius:50%;

    font-size:11px;

    font-weight:900;

}


.schoolHeaderText{

    flex:1;

    text-align:center;

    padding:0 6px;

}


.schoolName{

    color:#092e62;

    font-size:16px;

    font-weight:950;

    letter-spacing:.7px;

    line-height:1.05;

}


.schoolLocation{

    color:#9a7417;

    font-size:9px;

    font-weight:800;

    letter-spacing:1.7px;

    margin-top:2px;

}


.schoolTagline{

    color:#68758a;

    font-size:6.5px;

    letter-spacing:1px;

    margin-top:2px;

}


.headerBadge{

    min-width:39px;

    padding:4px 5px;

    text-align:center;

    color:#fff;

    background:#0a3166;

    border-radius:4px;

    font-size:6.5px;

    line-height:1.25;

    font-weight:800;

}


.headerBadge span{

    color:#e8cb72;

    font-size:7px;

}


.goldDivider{

    display:flex;

    align-items:center;

    gap:5px;

    margin:1px 9px 3px;

}


.goldDivider span{

    height:1px;

    flex:1;

    background:#c79a28;

}


.goldDivider b{

    color:#c79a28;

    font-size:8px;

}


.admitTitleWrap{

    text-align:center;

    margin:2px 0 5px;

}


.admitTitle{

    display:inline-block;

    color:#092f64;

    font-size:12px;

    font-weight:950;

    letter-spacing:2.3px;

    padding:2px 16px;

    border-bottom:2px solid #c79a28;

}


.admitSubtitle{

    color:#7b8797;

    font-size:6.5px;

    letter-spacing:1.2px;

    margin-top:2px;

    font-weight:700;

}


.rollHighlight{

    display:flex;

    align-items:center;

    justify-content:center;

    width:max-content;

    min-width:105px;

    margin:3px auto 6px;

    border:1px solid #c79a28;

    border-radius:4px;

    overflow:hidden;

    background:#fffdf6;

}


.rollLabel{

    background:#0a3166;

    color:white;

    font-size:7px;

    font-weight:800;

    padding:5px 7px;

}


.rollValue{

    color:#0a3166;

    font-size:11px;

    font-weight:950;

    padding:3px 9px;

}


.sectionLabel{

    display:flex;

    align-items:center;

    gap:5px;

    margin:4px 0 3px;

}


.sectionLabel:before{

    content:"";

    width:4px;

    height:13px;

    background:#c79a28;

}


.sectionLabel span{

    color:#0a3166;

    font-size:7.5px;

    font-weight:900;

    letter-spacing:1px;

}


.infoTable{

    width:100%;

    border-collapse:separate;

    border-spacing:3px;

}


.infoTable td{

    width:50%;

    background:#f7f9fc;

    border:1px solid #e0e5ed;

    border-left:3px solid #0a3166;

    padding:4px 5px;

    vertical-align:middle;

}


.infoTable td[colspan="2"]{

    width:100%;

}


.infoLabel{

    display:block;

    color:#7b8797;

    font-size:6px;

    font-weight:800;

    letter-spacing:.7px;

    margin-bottom:1px;

}


.infoTable strong{

    display:block;

    color:#18253a;

    font-size:8.5px;

    font-weight:800;

}


.scheduleTitle{

    display:flex;

    align-items:center;

    gap:4px;

    color:#0a3166;

    font-size:7.5px;

    font-weight:900;

    letter-spacing:.8px;

    margin:5px 0 3px;

}


.scheduleIcon{

    color:#c79a28;

    font-size:6px;

}


.subjectTable{

    width:100%;

    border-collapse:collapse;

    border:1px solid #bfc8d7;

}


.subjectTable th,
.subjectTable td{

    border:1px solid #cbd3df;

    padding:3px 2px;

    text-align:center;

    font-size:6.8px;

}


.subjectTable th{

    background:#0a3166;

    color:#fff;

    font-size:6px;

    font-weight:900;

}


.subjectTable tr:nth-child(even) td{

    background:#f7f9fc;

}


.subjectCell{

    font-weight:800;

}


.timeCell{

    font-weight:800;

    color:#0a3166;

}


.noSchedule{

    color:#8b95a5;

    font-style:italic;

}


.examNote{

    display:flex;

    gap:5px;

    align-items:center;

    margin-top:5px;

    padding:4px 5px;

    background:#fffaf0;

    border:1px solid #ead9a6;

    border-radius:3px;

    color:#596577;

    font-size:6px;

}


.noteIcon{

    display:flex;

    align-items:center;

    justify-content:center;

    width:14px;
    height:14px;

    border-radius:50%;

    background:#c79a28;

    color:#fff;

    font-size:8px;

    font-weight:900;

}


.bestWishes{

    text-align:center;

    color:#0a3166;

    font-size:7px;

    font-weight:900;

    letter-spacing:.6px;

    margin-top:5px;

    padding-top:4px;

    border-top:1px solid #d9c277;

}


.bestWishes span{

    color:#c79a28;

    margin:0 3px;

}


.bestWishes small{

    display:block;

    color:#788598;

    font-size:5.8px;

    margin-top:1px;

}


.signatureRow{

    display:flex;

    align-items:flex-end;

    justify-content:space-between;

    margin-top:11px;

    padding:0 7px;

}


.signatureBox{

    width:78px;

    text-align:center;

}


.signatureLine{

    border-top:1px solid #354258;

    margin-bottom:2px;

}


.signatureBox b{

    display:block;

    font-size:6px;

}


.signatureBox small{

    display:block;

    color:#8792a1;

    font-size:5px;

}


.officialSeal{

    width:39px;
    height:39px;

    border:1.5px solid #c79a28;

    border-radius:50%;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    color:#0a3166;

}


.officialSeal span{

    font-size:4px;

    font-weight:900;

}


.officialSeal b{

    font-size:10px;

}


.officialSeal small{

    font-size:4px;

}


.cardFooter{

    display:flex;

    justify-content:space-between;

    margin-top:5px;

    padding:3px 5px;

    background:#092e62;

    color:#fff;

    font-size:4.8px;

    font-weight:800;

}


.pdfPage.threeCards .schoolMonogram{

    width:29px;
    height:29px;

    font-size:8px;

}


.pdfPage.threeCards .schoolName{

    font-size:12px;

}


.pdfPage.threeCards .schoolLocation{

    font-size:7px;

}


.pdfPage.threeCards .schoolTagline{

    font-size:5px;

}


.pdfPage.threeCards .headerBadge{

    min-width:31px;

    font-size:5px;

}


.pdfPage.threeCards .admitTitle{

    font-size:9px;

    padding:1px 12px;

}


.pdfPage.threeCards .admitSubtitle{

    font-size:5px;

}


.pdfPage.threeCards .rollHighlight{

    min-width:85px;

    margin-bottom:3px;

}


.pdfPage.threeCards .rollLabel{

    font-size:5px;

    padding:3px 5px;

}


.pdfPage.threeCards .rollValue{

    font-size:8px;

    padding:2px 6px;

}


.pdfPage.threeCards .sectionLabel{

    margin:2px 0;

}


.pdfPage.threeCards .sectionLabel span{

    font-size:6px;

}


.pdfPage.threeCards .infoTable{

    border-spacing:2px;

}


.pdfPage.threeCards .infoTable td{

    padding:2px 3px;

}


.pdfPage.threeCards .infoLabel{

    font-size:4.5px;

}


.pdfPage.threeCards .infoTable strong{

    font-size:6.5px;

}


.pdfPage.threeCards .scheduleTitle{

    font-size:6px;

    margin:3px 0 2px;

}


.pdfPage.threeCards .subjectTable th,
.pdfPage.threeCards .subjectTable td{

    padding:2px 1.5px;

    font-size:5.3px;

}


.pdfPage.threeCards .subjectTable th{

    font-size:4.8px;

}


.pdfPage.threeCards .examNote{

    font-size:4.8px;

    padding:2px 3px;

    margin-top:3px;

}


.pdfPage.threeCards .noteIcon{

    width:10px;
    height:10px;

    font-size:6px;

}


.pdfPage.threeCards .bestWishes{

    font-size:5.5px;

    margin-top:3px;

    padding-top:2px;

}


.pdfPage.threeCards .bestWishes small{

    font-size:4.5px;

}


.pdfPage.threeCards .signatureRow{

    margin-top:6px;

}


.pdfPage.threeCards .signatureBox{

    width:60px;

}


.pdfPage.threeCards .signatureBox b{

    font-size:4.8px;

}


.pdfPage.threeCards .signatureBox small{

    font-size:4px;

}


.pdfPage.threeCards .officialSeal{

    width:28px;
    height:28px;

}


.pdfPage.threeCards .officialSeal b{

    font-size:7px;

}


.pdfPage.threeCards .officialSeal span,
.pdfPage.threeCards .officialSeal small{

    font-size:3px;

}


.pdfPage.threeCards .cardFooter{

    margin-top:3px;

    font-size:3.8px;

}


.pdfPage.twoCards .schoolName{

    font-size:14px;

}


.pdfPage.twoCards .schoolMonogram{

    width:33px;
    height:33px;

    font-size:9px;

}


.pdfPage.twoCards .schoolLocation{

    font-size:8px;

}


.pdfPage.twoCards .schoolTagline{

    font-size:5.5px;

}


.pdfPage.twoCards .admitTitle{

    font-size:10px;

}


.pdfPage.twoCards .infoTable td{

    padding:3px 4px;

}


.pdfPage.twoCards .infoLabel{

    font-size:5.5px;

}


.pdfPage.twoCards .infoTable strong{

    font-size:7.5px;

}


.pdfPage.twoCards .subjectTable th,
.pdfPage.twoCards .subjectTable td{

    font-size:6px;

}


.pdfPage.twoCards .signatureRow{

    margin-top:10px;

}


@page{

    size:A4 portrait;

    margin:0;

}


@media print{

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
