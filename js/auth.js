// /public/js/auth.js

// Firebase imports
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase app initialized in firebase-config.js
import { auth } from "./firebase-config.js";

// Initialize Firestore
const db = getFirestore();

// Register user
window.registerUser = async function (e) {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // ✅ Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp()
    });

    alert("Registration successful!");
    window.location.href = "account.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
};

// Login user
window.loginUser = async function (e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      window.location.href = "admin/dashboard.html";
    } else {
      window.location.href = "account.html";
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("Logged out successfully!");
    window.location.href = "index.html";
  });
}

// Update nav visibility based on auth state
onAuthStateChanged(auth, (user) => {
  document.querySelectorAll(".nav-logged-in").forEach(el => el.style.display = user ? "inline-block" : "none");
  document.querySelectorAll(".nav-logged-out").forEach(el => el.style.display = user ? "none" : "inline-block");
});

// Password reset functionality
document.addEventListener("DOMContentLoaded", () => {
  const forgotBtn = document.getElementById("forgotPasswordBtn");
  if (forgotBtn) {
    forgotBtn.onclick = async function() {
      const email = document.getElementById("loginEmail").value;
      if (!email) return alert("Enter your email first.");
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Check your inbox.");
      } catch (err) {
        alert("Error: " + err.message);
      }
    };
  }
});

// Set current user as admin
window.setCurrentUserAsAdmin = async function() {
  if (!auth.currentUser) {
    alert("Please log in first.");
    return;
  }
  const db = getFirestore();
  const user = auth.currentUser;
  const adminData = {
    uid: user.uid,
    email: user.email,
    role: "admin",
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, "users", user.uid), adminData, { merge: true });
  alert("Your account is now set as admin in Firestore.");
};

// Hide register link on login page if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    const registerLink = document.querySelector('.login-link a[href="register.html"]');
    if (user && registerLink) {
      registerLink.style.display = 'none';
    }
  });
});