// Script to add a coupon to a user's coupons array in Firestore
// Usage: Run in browser console or as a Node script with Firebase Admin SDK

// For browser (client-side, user must be logged in):
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiVg0mKcDmBDPLbmNbxuNtFgJ1MgsjLyw",
  authDomain: "little-wok-box.firebaseapp.com",
  projectId: "little-wok-box",
  storageBucket: "little-wok-box.appspot.com",
  messagingSenderId: "118275337110",
  appId: "1:118275337110:web:9dbaf4dc96ee2529bb8bb7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Change these values as needed:
const userUid = "XJMFqqxa4Kf8nxeXuV16kKkf2JR2"; // User UID
const newCoupon = {
  code: "WOK50NEW1",
  value: 50,
  expiry: "2025-12-31"
};

async function addCouponToUser(uid, couponObj) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    coupons: arrayUnion(couponObj)
  });
  console.log(`Coupon ${couponObj.code} added to user ${uid}`);
}

addCouponToUser(userUid, newCoupon);
