import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
getDoc,
updateDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const students = await getDocs(collection(db,"students_v2"));
document.getElementById("totalStudents").innerText = students.size;

const staff = await getDocs(collection(db,"staff"));
document.getElementById("totalStaff").innerText = staff.size;

const result = await getDoc(doc(db,"settings","result"));

if(result.exists()){
document.getElementById("resultStatus").innerText =
result.data().published ? "🟢 LIVE" : "🔴 HIDDEN";
}

const portal = await getDoc(doc(db,"settings","portal"));

if(portal.exists()){
document.getElementById("portalSession").innerText =
portal.data().session;
  }
const releaseBtn = document.getElementById("releaseAdmit");

if(portal.exists()){

releaseBtn.innerText =
portal.data().admitCardRelease ?
"🔒 Close Admit Card" :
"🎫 Release Admit Card";

releaseBtn.onclick = async()=>{

const status = !portal.data().admitCardRelease;

await updateDoc(doc(db,"settings","portal"),{
admitCardRelease:status
});

location.reload();

};

}
const maintenanceOn = document.getElementById("maintenanceOn");
const maintenanceOff = document.getElementById("maintenanceOff");

maintenanceOn.onclick = async()=>{

await setDoc(doc(db,"portal_settings","system"),{
maintenance:true
});

alert("🔴 Maintenance Mode ON");

};

maintenanceOff.onclick = async()=>{

await setDoc(doc(db,"portal_settings","system"),{
maintenance:false
});

alert("🟢 Maintenance Mode OFF");

};
