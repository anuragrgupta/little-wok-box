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


function getSafeElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error(`[ERROR] Missing element: #${id}`);
  }
  return el;
}

const userDetailsSection = getSafeElement('user-details');
console.debug('[DEBUG] userDetailsSection:', userDetailsSection);
const userEmailSpan = getSafeElement('user-email');
console.debug('[DEBUG] userEmailSpan:', userEmailSpan);
const userPointsSpan = getSafeElement('user-points');
console.debug('[DEBUG] userPointsSpan:', userPointsSpan);
const couponSection = getSafeElement('coupon-section');
console.debug('[DEBUG] couponSection:', couponSection);

function generateCouponCode() {
  return 'WOK' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

onAuthStateChanged(auth, async (user) => {
  console.debug('[DEBUG] onAuthStateChanged user:', user);
  if (user) {
    if (userEmailSpan) {
      userEmailSpan.textContent = user.email || '';
      console.debug('[DEBUG] Set userEmailSpan.textContent:', user.email);
    } else {
      console.error('[ERROR] userEmailSpan is null');
    }
    // Fetch user details from Firestore
    try {
      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      console.debug('[DEBUG] userDocSnap.exists:', userDocSnap.exists());
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        console.debug('[DEBUG] Firestore user data:', data);
        if (userDetailsSection) {
          userDetailsSection.innerHTML = `
            <div class="account-card">
              <h2>Welcome, ${data.name || ''}</h2>
              <div class="account-info">
                <div><strong>Contact:</strong> ${data.contact || ''}</div>
                <div><strong>Email:</strong> ${data.email || user.email || ''}</div>
                <div><strong>Birth Date:</strong> ${data.birthdate || ''}</div>
                <div><strong>Username:</strong> ${data.username || ''}</div>
              </div>
            </div>
          `;
        } else {
          console.error('[ERROR] userDetailsSection is null');
        }
        // Points logic
        let points = typeof data.points === 'number' ? data.points : 300;
        if (userPointsSpan) {
          userPointsSpan.textContent = points;
          console.debug('[DEBUG] Points value:', points);
        } else {
          console.error('[ERROR] userPointsSpan is null');
        }
        // Coupons logic
        let coupons = Array.isArray(data.coupons) ? data.coupons : [];
        // If legacy single coupon, add it
        if (data.coupon && !coupons.some(c => c.code === data.coupon)) {
          coupons.push({ code: data.coupon, value: 50, expiry: null });
        }
        const couponsListDiv = getSafeElement('coupons-list');
        console.debug('[DEBUG] couponsListDiv:', couponsListDiv);
        if (couponsListDiv) {
          couponsListDiv.innerHTML = '';
          if (coupons.length === 0) {
            couponsListDiv.innerHTML = '<div style="color:#DC0E2A;font-weight:600;">No coupons available.</div>';
          } else {
            coupons.forEach((coupon, idx) => {
              if (!coupon.code) {
                console.warn('[WARN] Coupon missing code:', coupon);
                return;
              }
              const card = document.createElement('div');
              card.className = 'coupon-flip';
              card.style.margin = '0';
              card.innerHTML = `
                <div class="coupon-flip-inner">
                  <div class="coupon-flip-front">
                    <span class="coupon-code" style="cursor:pointer;text-decoration:underline;font-size:1.3rem;letter-spacing:2px;">${coupon.code}</span>
                    <span style="font-size:1rem;color:#444;margin-top:0.5rem;">(Click to see QR)</span>
                    <span style="font-size:0.95rem;color:#222;margin-top:0.5rem;">₹${coupon.value || 50} off${coupon.expiry ? `, valid till ${coupon.expiry}` : ''}</span>
                  </div>
                  <div class="coupon-flip-back">
                    <span class="coupon-code" style="font-size:1.3rem;letter-spacing:2px;">${coupon.code}</span>
                    <div class="coupon-qr-img"></div>
                    <span style="font-size:0.95rem;color:#222;margin-top:0.5rem;">₹${coupon.value || 50} off${coupon.expiry ? `, valid till ${coupon.expiry}` : ''}</span>
                  </div>
                </div>
              `;
              // Flip logic and QR
              card.addEventListener('click', function() {
                card.classList.toggle('flipped');
                if (card.classList.contains('flipped')) {
                  const qrDiv = card.querySelector('.coupon-qr-img');
                  if (qrDiv) {
                    qrDiv.innerHTML = '';
                    if (window.QRious) {
                      const qr = new window.QRious({ value: coupon.code, size: 90 });
                      const img = document.createElement('img');
                      img.src = qr.toDataURL();
                      img.alt = 'QR Code';
                      qrDiv.appendChild(img);
                    } else {
                      qrDiv.innerHTML = '<span style="color:#DC0E2A;">QR code library missing.</span>';
                    }
                  } else {
                    console.error('[ERROR] qrDiv is null');
                  }
                }
              });
              couponsListDiv.appendChild(card);
            });
          }
        } else {
          console.error('[ERROR] couponsListDiv is null');
        }
        if (couponSection) {
          couponSection.style.display = 'block';
        } else {
          console.error('[ERROR] couponSection is null');
        }
        // Show raw Firestore data for debugging
        const rawDataDiv = document.createElement('div');
        rawDataDiv.style.background = '#f9f9f9';
        rawDataDiv.style.border = '1px solid #eee';
        rawDataDiv.style.padding = '1rem';
        rawDataDiv.style.margin = '1rem 0';
        rawDataDiv.style.fontSize = '0.95rem';
        rawDataDiv.innerHTML = `<strong>Raw Firestore Data:</strong><pre style="white-space:pre-wrap;word-break:break-all;">${JSON.stringify(data, null, 2)}</pre>`;
        if (userDetailsSection) userDetailsSection.appendChild(rawDataDiv);
      } else {
        if (userDetailsSection) userDetailsSection.innerHTML = `<p>User details not found. Please complete registration.</p>`;
        if (couponSection) couponSection.style.display = 'none';
      }
    } catch (err) {
      if (userDetailsSection) userDetailsSection.innerHTML = `<p style='color:#DC0E2A;font-weight:600;'>Error fetching user details. Check console for info.</p>`;
      if (couponSection) couponSection.style.display = 'none';
      console.error('Error fetching user details:', err);
    }
  } else {
    window.location.href = 'login.html';
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
