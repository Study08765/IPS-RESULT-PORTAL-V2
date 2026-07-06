import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

// Edit Mode
if (editId) {
  try {
    const snap = await getDoc(doc(db, "students", editId));

    if (snap.exists()) {
      const s = snap.data();

      document.getElementById("roll").value = editId;
      document.getElementById("roll").readOnly = true;

      document.getElementById("name").value = s.Name || "";
      document.getElementById("father").value = s.Father || "";
      document.getElementById("class").value = s.Class || "";
      document.getElementById("hindi").value = s.Hindi || "";
      document.getElementById("english").value = s.English || "";
      document.getElementById("mathematics").value = s.Mathematics || "";
      document.getElementById("science").value = s.Science || "";
      document.getElementById("socialscience").value = s.SocialScience || "";

      document.getElementById("saveBtn").innerText = "Update Student";
    }
  } catch (error) {
    alert(error.message);
  }
}

// Save / Update
document.getElementById("saveBtn").addEventListener("click", async () => {

  const roll = document.getElementById("roll").value.trim();

  if (!roll) {
    alert("Roll Number is required");
    return;
  }

  const student = {
    Name: document.getElementById("name").value,
    Father: document.getElementById("father").value,
    Class: document.getElementById("class").value,

    Hindi: Number(document.getElementById("hindi").value),
    English: Number(document.getElementById("english").value),
    Mathematics: Number(document.getElementById("mathematics").value),
    Science: Number(document.getElementById("science").value),
    SocialScience: Number(document.getElementById("socialscience").value),

    Result: "PASS"
  };

  try {
    await setDoc(doc(db, "students", roll), student);

    alert(editId ? "✅ Student Updated Successfully" : "✅ Student Saved Successfully");

    if (!editId) {
      document.getElementById("roll").value = "";
      document.getElementById("name").value = "";
      document.getElementById("father").value = "";
      document.getElementById("class").value = "";
      document.getElementById("hindi").value = "";
      document.getElementById("english").value = "";
      document.getElementById("mathematics").value = "";
      document.getElementById("science").value = "";
      document.getElementById("socialscience").value = "";
      document.getElementById("subjects").innerHTML = "";
    } else {
      window.location.href = "viewstudents.html";
    }

  } catch (error) {
    alert("❌ Error: " + error.message);
  }

});

// Dynamic Subject
const subjectsDiv = document.getElementById("subjects");
const addSubjectBtn = document.getElementById("addSubject");

if (addSubjectBtn && subjectsDiv) {

  addSubjectBtn.addEventListener("click", function () {

    const div = document.createElement("div");

    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginTop = "10px";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <input type="text" class="subjectName" placeholder="Subject Name">

      <input type="number" class="fullMarks" placeholder="Full Marks">

      <input type="number" class="obtainedMarks" placeholder="Obtained Marks">

      <button type="button" class="removeBtn">❌ Remove</button>
    `;

    div.querySelector(".removeBtn").onclick = function () {
      div.remove();
    };

    subjectsDiv.appendChild(div);

  });

}
