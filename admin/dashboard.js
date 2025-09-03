// /public/admin/dashboard.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth } from "../js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore();

function checkAdminAccess() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in as an admin to access this page.");
      window.location.href = "../login.html";
      return;
    }
    console.log("Logged in UID:", user.uid);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      console.log("No Firestore user document found for UID:", user.uid);
    } else {
      console.log("Firestore user data:", userDoc.data());
      console.log("Role field:", userDoc.data().role);
    }
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../login.html";
      return;
    }
    // Optionally set admin name
    document.querySelector('#admin-name').textContent = userDoc.data().name || 'Admin';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();

  // Add event listeners for navigation
  document.querySelectorAll('.admin-nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = link.getAttribute('href');
    });
  });
});

async function testConnection() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log("Firebase Connected. Users count:", usersSnapshot.size);
  } catch (error) {
    console.error("Firestore connection failed:", error);
  }
}

document.addEventListener("DOMContentLoaded", testConnection);