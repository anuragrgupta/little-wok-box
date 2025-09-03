// /public/admin/users.js
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../login.html";
      return;
    }
  });
}

async function loadUsers() {
  const grid = document.getElementById("usersGrid");
  grid.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "users"));
      snapshot.forEach(doc => {
        const user = doc.data();
        const card = `
          <div class="user-card" data-uid="${doc.id}">
            <div class="user-email">${user.email || "N/A"}</div>
            <div class="user-uid"><strong>UID:</strong> ${doc.id}</div>
            <div class="user-date"><strong>Registered:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown"}</div>
            ${user.name ? `<div class="user-details"><strong>Name:</strong> ${user.name}</div>` : ""}
            ${user.contact ? `<div class="user-details"><strong>Contact:</strong> ${user.contact}</div>` : ""}
            ${user.whatsapp ? `<div class="user-details"><strong>WhatsApp:</strong> ${user.whatsapp}</div>` : ""}
            ${user.birthdate ? `<div class="user-details"><strong>DOB:</strong> ${user.birthdate}</div>` : ""}
            ${user.username ? `<div class="user-details"><strong>Username:</strong> ${user.username}</div>` : ""}
            ${user.gender ? `<div class="user-details"><strong>Gender:</strong> ${user.gender}</div>` : ""}
            ${user.foodPrefs && user.foodPrefs.length ? `<div class="user-details"><strong>Food Prefs:</strong> ${user.foodPrefs.join(", ")}</div>` : ""}
            ${user.points ? `<div class="user-points">Points: ${user.points}</div>` : ""}
            ${user.coupon ? `<div class="user-coupon">Coupon: ${user.coupon}</div>` : ""}
            <button class="edit-user-btn" style="margin-top:0.7rem;background:#DC0E2A;color:#fff;border:none;border-radius:0.6rem;padding:0.5rem 1.2rem;font-size:1rem;cursor:pointer;">Edit</button>
          </div>
        `;
        grid.insertAdjacentHTML("beforeend", card);
      });

      // Add modal for editing
      if (!document.getElementById('editUserModal')) {
        const modal = document.createElement('div');
        modal.id = 'editUserModal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.4)';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
          <div style="
            background:#fff;
            border-radius:1.2rem;
            max-width:440px;
            width:95vw;
            margin:8vh auto;
            box-shadow:0 4px 32px #DC0E2A22;
            position:relative;
            display:flex;
            flex-direction:column;
            align-items:center;
            box-sizing:border-box;
            overflow:hidden;
          ">
            <h2 style="color:#DC0E2A;margin-bottom:1rem;">Edit User</h2>
            <form id="editUserForm" style="width:100%;max-height:60vh;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:1rem;box-sizing:border-box;padding-bottom:2.5rem;">
              <input type="hidden" id="editUid" />
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Name</label><input type="text" id="editName" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Contact</label><input type="tel" id="editContact" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">WhatsApp</label><input type="tel" id="editWhatsapp" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Email</label><input type="email" id="editEmail" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">DOB</label><input type="text" id="editDOB" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" placeholder="DD/MM/YYYY" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Username</label><input type="text" id="editUsername" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Gender</label><input type="text" id="editGender" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Food Prefs (comma separated)</label><input type="text" id="editFoodPrefs" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Points</label><input type="number" id="editPoints" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;box-sizing:border-box;"><label style="font-weight:600;color:#222;">Coupon</label><input type="text" id="editCoupon" style="width:100%;box-sizing:border-box;padding:0.7rem;border-radius:0.6rem;border:1.5px solid #DC0E2A;margin-top:0.3rem;" /></div>
              <div style="width:100%;display:flex;justify-content:center;gap:1rem;position:sticky;bottom:0;background:#fff;padding-top:1rem;z-index:2;box-sizing:border-box;">
                <button type="submit" style="background:#DC0E2A;color:#fff;border:none;border-radius:0.6rem;padding:0.7rem 1.5rem;font-size:1rem;font-weight:600;">Save</button>
                <button type="button" id="closeEditModal" style="background:#fff;color:#DC0E2A;border:1.5px solid #DC0E2A;border-radius:0.6rem;padding:0.7rem 1.5rem;font-size:1rem;font-weight:600;">Cancel</button>
                <button type="button" id="deleteUserBtn" style="background:#fff;color:#B8002A;border:1.5px solid #B8002A;border-radius:0.6rem;padding:0.7rem 1.5rem;font-size:1rem;font-weight:600;">Delete</button>
              </div>
            </form>
          </div>
        `;
        document.body.appendChild(modal);
      }

      // Edit button logic
      document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const card = btn.closest('.user-card');
          const uid = card.getAttribute('data-uid');
          const user = {};
          card.querySelectorAll('.user-details, .user-email, .user-uid, .user-date, .user-points, .user-coupon').forEach(el => {
            const text = el.textContent;
            if (text.startsWith('Name:')) user.name = text.replace('Name:', '').trim();
            if (text.startsWith('Contact:')) user.contact = text.replace('Contact:', '').trim();
            if (text.startsWith('WhatsApp:')) user.whatsapp = text.replace('WhatsApp:', '').trim();
            if (text.startsWith('Email:') || el.classList.contains('user-email')) user.email = text.replace('Email:', '').trim();
            if (text.startsWith('DOB:')) user.birthdate = text.replace('DOB:', '').trim();
            if (text.startsWith('Username:')) user.username = text.replace('Username:', '').trim();
            if (text.startsWith('Gender:')) user.gender = text.replace('Gender:', '').trim();
            if (text.startsWith('Food Prefs:')) user.foodPrefs = text.replace('Food Prefs:', '').trim();
            if (text.startsWith('Points:')) user.points = text.replace('Points:', '').trim();
            if (text.startsWith('Coupon:')) user.coupon = text.replace('Coupon:', '').trim();
          });
          document.getElementById('editUid').value = uid;
          document.getElementById('editName').value = user.name || '';
          document.getElementById('editContact').value = user.contact || '';
          document.getElementById('editWhatsapp').value = user.whatsapp || '';
          document.getElementById('editEmail').value = user.email || '';
          document.getElementById('editDOB').value = user.birthdate || '';
          document.getElementById('editUsername').value = user.username || '';
          document.getElementById('editGender').value = user.gender || '';
          document.getElementById('editFoodPrefs').value = user.foodPrefs || '';
          document.getElementById('editPoints').value = user.points || '';
          document.getElementById('editCoupon').value = user.coupon || '';
          document.getElementById('editUserModal').style.display = 'block';
        });
      });

      document.getElementById('closeEditModal').onclick = function() {
        document.getElementById('editUserModal').style.display = 'none';
      };

      document.getElementById('editUserForm').onsubmit = async function(e) {
        e.preventDefault();
        const uid = document.getElementById('editUid').value;
        const updated = {
          name: document.getElementById('editName').value,
          contact: document.getElementById('editContact').value,
          whatsapp: document.getElementById('editWhatsapp').value,
          email: document.getElementById('editEmail').value,
          birthdate: document.getElementById('editDOB').value,
          username: document.getElementById('editUsername').value,
          gender: document.getElementById('editGender').value,
          foodPrefs: document.getElementById('editFoodPrefs').value.split(',').map(f=>f.trim()).filter(f=>f),
          points: Number(document.getElementById('editPoints').value),
          coupon: document.getElementById('editCoupon').value
        };
        try {
          await updateDoc(doc(db, "users", uid), updated);
          alert('User updated!');
          document.getElementById('editUserModal').style.display = 'none';
          location.reload();
        } catch (err) {
          alert('Error updating user: ' + err.message);
        }
      };

      // Delete user logic
      document.getElementById('deleteUserBtn').onclick = async function() {
        const uid = document.getElementById('editUid').value;
        if (!uid) return alert('No user selected.');
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
          await deleteDoc(doc(db, "users", uid));
          alert('User deleted!');
          document.getElementById('editUserModal').style.display = 'none';
          location.reload();
        } catch (err) {
          alert('Error deleting user: ' + err.message);
        }
      };
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  loadUsers();
});