import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUcTdpMctPg2lcqSapoTgFHXizEE35RCY",
  authDomain: "ips-result-portal.firebaseapp.com",
  projectId: "ips-result-portal",
  storageBucket: "ips-result-portal.firebasestorage.app",
  messagingSenderId: "877536597914",
  appId: "1:877536597914:web:d77c26ef46a9da2c928c23",
  measurementId: "G-4PD16WMHTT"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
