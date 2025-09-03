import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const email = document.getElementById('email').value.trim();
  // Combine birthdate from dropdowns
  const birth_day = document.getElementById('birth_day') ? document.getElementById('birth_day').value : '';
  const birth_month = document.getElementById('birth_month') ? document.getElementById('birth_month').value : '';
  const birth_year = document.getElementById('birth_year') ? document.getElementById('birth_year').value : '';
  const birthdate = birth_day && birth_month && birth_year ? `${birth_day.padStart(2,'0')}/${birth_month.padStart(2,'0')}/${birth_year}` : '';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Validate all fields
  if (!name || !contact.match(/^[0-9]{10}$/) || !email || !birthdate || !username || !password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/)) {
    alert('Please fill all fields correctly.');
    return;
  }

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Generate 6-digit alphanumeric coupon for ₹50 discount
    function generateCoupon() {
      return 'WOK50' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    // Always set initial points and coupon
    const coupon = generateCoupon();
    const points = 50;
    // Store user data with UID as document ID
    const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      contact,
      email,
      birthdate,
      username,
      createdAt: new Date().toISOString(),
      points,
      coupon
    });
    alert('Registration successful!');
    document.getElementById('registerForm').reset();
    window.location.href = 'login.html';
  } catch (error) {
    alert('Registration failed: ' + error.message);
    console.error('Registration error:', error);
  }
});
