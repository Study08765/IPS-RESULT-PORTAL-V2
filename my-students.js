import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const studentList = document.getElementById("studentList");
const search = document.getElementById("search");

const staffId = localStorage.getItem("staffLogin");

if (!staffId) {
  location.href = "staff-login.html";
}

let myClass = "";
let students = [];

// Staff Class Load
const staffSnap = await getDoc(doc(db, "staff", staffId));

if (staffSnap.exists()) {
  myClass = staffSnap.data().class;
}

// Students Load
const snap = await getDocs(collection(db, "students_v2"));

snap.forEach(doc => {

  const s = doc.data();

  if (s.Class == myClass && !s.ResultCreated) {
  students.push(s);
  }

});

showStudents(students);

// Search
search.oninput = function () {

  const text = this.value.toLowerCase();

  const filter = students.filter(s =>

    s.Name.toLowerCase().includes(text) ||

    s.Roll.toString().includes(text)

  );

  showStudents(filter);

};

function showStudents(list){

  let html = "";

  list.forEach(s=>{

    html += `
    <div class="card">

      <h3>${s.Name}</h3>

      <p><b>Roll :</b> ${s.Roll}</p>

      <p><b>Class :</b> ${s.Class}</p>

      <p><b>Section :</b> ${s.Section}</p>

      <button class="edit"
      onclick="location.href='addstudent_v2.html?id=${s.Roll}'">
      ✏️ Edit
      </button>

      <button class="result"
onclick="location.href='create-result.html?id=${s.Roll}'">
📊 Result
</button>

    </div>
    `;

  });

  if(html==""){
    html="<h3 align='center'>No Students Found</h3>";
  }

  studentList.innerHTML=html;

  }
