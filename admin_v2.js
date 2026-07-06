import { db } from "./firebase.js";

const subjectsDiv = document.getElementById("subjects");
const addSubjectBtn = document.getElementById("addSubject");

// नया Subject जोड़ने का फ़ंक्शन
function createSubject(name = "", full = "", obtained = "") {

  const div = document.createElement("div");
  div.className = "subject";

  div.innerHTML = `
    <input class="subjectName" placeholder="Subject Name" value="${name}">
    <input class="fullMarks" type="number" placeholder="Full Marks" value="${full}">
    <input class="obtainedMarks" type="number" placeholder="Obtained Marks" value="${obtained}">
    <button type="button" class="removeSubject">❌ Remove Subject</button>
  `;

  div.querySelector(".removeSubject").addEventListener("click", () => {
    div.remove();
  });

  subjectsDiv.appendChild(div);
}

// Add Subject Button
addSubjectBtn.addEventListener("click", () => {
  createSubject();
});
