// Script to migrate old users in Firestore to use UID as document ID
// Run this in a Node.js environment with Firebase Admin SDK

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function migrateUsers() {
  const usersCol = db.collection('users');
  const snapshot = await usersCol.get();
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.uid && docSnap.id !== data.uid) {
      // Copy data to new doc with UID as ID
      await usersCol.doc(data.uid).set(data);
      console.log(`Migrated user ${data.email} to UID ${data.uid}`);
    }
  }
  console.log('Migration complete.');
}

migrateUsers().catch(console.error);
