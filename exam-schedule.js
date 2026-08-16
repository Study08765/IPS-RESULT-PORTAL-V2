import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const classBox =
    document.getElementById("class");

const subjects =
    document.getElementById("subjects");

const saveBtn =
    document.getElementById("saveBtn");


// =====================================================
// LOAD SUBJECTS FOR SELECTED CLASS
// =====================================================

classBox.onchange = async () => {

    const className =
        classBox.value;

    subjects.innerHTML = "";

    if(!className){

        return;

    }


    try{

        // ---------------------------------------------
        // GET SUBJECTS FROM CLASS SUBJECT SETUP
        // ---------------------------------------------

        const subjectSnap =
            await getDoc(
                doc(
                    db,
                    "class_subjects",
                    className
                )
            );


        if(!subjectSnap.exists()){

            subjects.innerHTML = `

                <div class="row">

                    <h3>
                        ⚠️ No Subjects Found
                    </h3>

                    <p>
                        पहले Class Subject Setup में
                        इस class के subjects save करें।
                    </p>

                </div>

            `;

            return;

        }


        const data =
            subjectSnap.data();


        const subjectList =
            Array.isArray(data.Subjects)
            ? data.Subjects
            : [];


        if(subjectList.length === 0){

            subjects.innerHTML = `

                <div class="row">

                    <h3>
                        ⚠️ No Subjects Found
                    </h3>

                </div>

            `;

            return;

        }


        // ---------------------------------------------
        // CREATE SUBJECT BOXES
        // ---------------------------------------------

        for(
            const subjectName of subjectList
        ){

            const scheduleSnap =
                await getDoc(
                    doc(
                        db,
                        "exam_schedule",
                        className +
                        "_" +
                        subjectName
                    )
                );


            let date = "";
            let startTime = "";
            let endTime = "";


            if(scheduleSnap.exists()){

                const schedule =
                    scheduleSnap.data();

                date =
                    schedule.Date || "";

                startTime =
                    schedule.StartTime || "";

                endTime =
                    schedule.EndTime || "";

            }


            subjects.innerHTML += `

                <div
                    class="row"
                    data-subject="${escapeHTML(subjectName)}"
                >

                    <h3>
                        ${escapeHTML(subjectName)}
                    </h3>

                    <label>
                        Exam Date
                    </label>

                    <input
                        type="date"
                        class="date"
                        value="${escapeHTML(date)}"
                    >

                    <label>
                        Start Time
                    </label>

                    <input
                        type="time"
                        class="startTime"
                        value="${escapeHTML(startTime)}"
                    >

                    <label>
                        End Time
                    </label>

                    <input
                        type="time"
                        class="endTime"
                        value="${escapeHTML(endTime)}"
                    >

                </div>

            `;

        }

    }
    catch(error){

        console.error(error);

        alert(
            "Subjects load नहीं हो सके:\n" +
            error.message
        );

    }

};


// =====================================================
// SAVE EXAM SCHEDULE
// =====================================================

saveBtn.onclick = async () => {

    const className =
        classBox.value;


    if(!className){

        alert(
            "Please Select Class"
        );

        return;

    }


    const rows =
        document.querySelectorAll(
            ".row[data-subject]"
        );


    if(rows.length === 0){

        alert(
            "इस class के लिए कोई subject नहीं मिला।"
        );

        return;

    }


    try{

        saveBtn.disabled = true;

        saveBtn.innerText =
            "Saving...";


        for(
            const row of rows
        ){

            const subjectName =
                row.dataset.subject;


            const date =
                row.querySelector(
                    ".date"
                ).value;


            const startTime =
                row.querySelector(
                    ".startTime"
                ).value;


            const endTime =
                row.querySelector(
                    ".endTime"
                ).value;


            await setDoc(

                doc(
                    db,
                    "exam_schedule",
                    className +
                    "_" +
                    subjectName
                ),

                {

                    Class:
                        className,

                    Subject:
                        subjectName,

                    Date:
                        date,

                    StartTime:
                        startTime,

                    EndTime:
                        endTime

                },

                {
                    merge:true
                }

            );

        }


        alert(
            "✅ Exam Schedule Saved Successfully"
        );


    }
    catch(error){

        console.error(error);

        alert(
            "❌ Schedule save नहीं हुआ:\n" +
            error.message
        );

    }
    finally{

        saveBtn.disabled = false;

        saveBtn.innerText =
            "💾 Save Schedule";

    }

};


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value){

    return String(value || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}
