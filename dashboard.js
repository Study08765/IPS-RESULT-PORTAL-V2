import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadDashboard(){

  const snapshot = await getDocs(collection(db,"students_v2"));

  let totalStudents = 0;

  let topper = "";
  let topperPercent = 0;

  snapshot.forEach(doc=>{

    totalStudents++;

    const s = doc.data();

    let total = 0;
    let full = 0;

    if(s.Subjects){

      s.Subjects.forEach(sub=>{

        total += Number(sub.obtained);
        full += Number(sub.full);

      });

    }

    const per = full>0 ? (total/full)*100 : 0;

    if(per > topperPercent){

      topperPercent = per;
      topper = s.Name;

    }

  });

  document.getElementById("totalStudents").innerHTML =
  totalStudents;

  document.getElementById("topper").innerHTML =
  topper + " (" + topperPercent.toFixed(2) + "%)";

}

loadDashboard();
