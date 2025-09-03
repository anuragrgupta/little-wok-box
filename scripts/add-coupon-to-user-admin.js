// Node.js script to add a coupon to a user's coupons array in Firestore using Firebase Admin SDK
// Usage: node add-coupon-to-user-admin.js

const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://little-wok-box.firebaseio.com'
});

const db = admin.firestore();

// Change these values as needed:
const userUid = 'XJMFqqxa4Kf8nxeXuV16kKkf2JR2'; // User UID
const newCoupon = {
  code: 'WOK50ADMIN',
  value: 50,
  expiry: '2025-12-31'
};

async function addCouponToUser(uid, couponObj) {
  const userRef = db.collection('users').doc(uid);
  await userRef.update({
    coupons: admin.firestore.FieldValue.arrayUnion(couponObj)
  });
  console.log(`Coupon ${couponObj.code} added to user ${uid}`);
}

addCouponToUser(userUid, newCoupon)
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
