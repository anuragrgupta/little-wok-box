// account.js
// Fetch and display user details, points, and coupon from Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const userDetailsSection = document.getElementById('user-details');
const userPointsSpan = document.getElementById('user-points');
const couponCodeSpan = document.getElementById('coupon-code');
const couponSection = document.getElementById('coupon-section');

function generateCouponCode() {
  return 'WOK' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('[DEBUG] Logged in user:', user);
    try {
      const userDocRef = doc(db, "users", user.uid);
      console.log('[DEBUG] Fetching Firestore doc for UID:', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      console.log('[DEBUG] Firestore doc exists:', userDocSnap.exists());
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        console.log('[DEBUG] Firestore user data:', data);
        userDetailsSection.innerHTML = `
          <div class="account-card">
            <h2>Welcome, ${data.name}</h2>
            <div class="account-info">
              <div><strong>Contact:</strong> ${data.contact}</div>
              <div><strong>Email:</strong> ${data.email}</div>
              <div><strong>Birth Date:</strong> ${data.birthdate}</div>
              <div><strong>Username:</strong> ${data.username}</div>
            </div>
          </div>
        `;
        // Points and coupon logic
        let points = data.points || 300;
        console.log('[DEBUG] Points value:', points);
        userPointsSpan.textContent = points;
        let coupon = data.coupon || generateCouponCode();
        console.log('[DEBUG] Coupon value:', coupon);
        couponCodeSpan.textContent = coupon;
        couponSection.style.display = 'block';
      } else {
        console.log('[DEBUG] No Firestore user document found for UID:', user.uid);
        userDetailsSection.innerHTML = `<p>User details not found. Please complete registration.</p>`;
        couponSection.style.display = 'none';
      }
    } catch (err) {
      console.error('[DEBUG] Error fetching Firestore user data:', err);
      userDetailsSection.innerHTML = `<p>Error fetching user details. Check console for info.</p>`;
      couponSection.style.display = 'none';
    }
  } else {
    window.location.href = 'login.html';
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
