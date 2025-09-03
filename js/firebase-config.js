// js/firebase-config.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiVg0mKcDmBDPLbmNbxuNtFgJ1MgsjLyw",
  authDomain: "little-wok-box.firebaseapp.com",
  projectId: "little-wok-box",
  storageBucket: "little-wok-box.firebasestorage.app",
  messagingSenderId: "118275337110",
  appId: "1:118275337110:web:9dbaf4dc96ee2529bb8bb7",
  measurementId: "G-N492YLPWGG"
};

// Only initialize if not already initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };