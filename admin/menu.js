// --- Wok Builder Admin Logic ---
const wokBuilderForm = document.getElementById("wokBuilderForm");
const wokBuilderList = document.getElementById("wokBuilderList");

// Add wok builder item
if (wokBuilderForm) {
  wokBuilderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("wokName").value;
    const price = parseFloat(document.getElementById("wokPrice").value);
    const type = document.getElementById("wokType").value;
    const category = document.getElementById("wokCategory").value;
    const description = document.getElementById("wokDescription").value;
    try {
      await addDoc(collection(db, "wokBuilderItems"), {
        name,
        price,
        type,
        category,
        description,
        createdAt: serverTimestamp()
      });
      alert("Wok builder item added!");
      wokBuilderForm.reset();
      fetchWokBuilderItems();
    } catch (error) {
      console.error("Error adding wok builder item:", error);
    }
  });
}

// Display wok builder items
async function fetchWokBuilderItems() {
  const gridBase = document.getElementById("wokGridBase");
  const gridGravy = document.getElementById("wokGridGravy");
  const gridTopping = document.getElementById("wokGridTopping");
  const gridExtra = document.getElementById("wokGridExtra");
  if (!gridBase || !gridGravy || !gridTopping || !gridExtra) return;
  gridBase.innerHTML = "";
  gridGravy.innerHTML = "";
  gridTopping.innerHTML = "";
  gridExtra.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "wokBuilderItems"));
  // Store all wok builder items for dropdown
  const wokItems = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    wokItems.push({ id: docSnap.id, ...data });
    const card = document.createElement("div");
    card.className = "wok-card";
    card.innerHTML = `
      <div class="wok-title">${data.name}</div>
      <div class="wok-type">Type: ${data.type}</div>
      <div class="wok-category">Category: ${data.category || ""}</div>
      <div class="wok-desc">${data.description || ""}</div>
      <div class="wok-price">₹${data.price}</div>
      <div class="wok-status">${data.paused ? "Paused" : "Active"}</div>
      <div class="wok-actions">
        <button class="edit-btn" data-id="${docSnap.id}" title="Edit">✏️</button>
        <button class="pause-btn" data-id="${docSnap.id}" data-paused="${!!data.paused}" title="Pause/Unpause">${data.paused ? '▶️' : '⏸️'}</button>
        <button class="delete-btn" data-id="${docSnap.id}" title="Delete">🗑️</button>
      </div>
    `;
    if (data.type === "base") gridBase.appendChild(card);
    else if (data.type === "gravy") gridGravy.appendChild(card);
    else if (data.type === "topping") gridTopping.appendChild(card);
    else if (data.type === "extra") gridExtra.appendChild(card);
  });

  // Populate dropdown in edit modal
  const editDropdown = document.getElementById("editWokDropdown");
  if (editDropdown) {
    editDropdown.innerHTML = '<option value="">--Select Item--</option>';
    wokItems.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      editDropdown.appendChild(option);
    });
    // Remove previous event listener if any
    editDropdown.onchange = null;
    editDropdown.addEventListener("change", async function() {
      const id = editDropdown.value;
      if (!id) return;
      currentEditWokId = id;
      const docRef = doc(db, "wokBuilderItems", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      document.getElementById("editWokName").value = data.name || "";
      document.getElementById("editWokPrice").value = data.price || "";
      document.getElementById("editWokType").value = data.type || "";
      document.getElementById("editWokCategory").value = data.category || "";
      document.getElementById("editWokDescription").value = data.description || "";
    });
  }

  // Add event listeners for card actions in all grids
    [gridBase, gridGravy, gridTopping, gridExtra].forEach(grid => {
      if (!grid) return;
      grid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const id = btn.getAttribute('data-id');
          currentEditWokId = id;
          const docRef = doc(db, "wokBuilderItems", id);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) return;
          const data = docSnap.data();
          // Set dropdown value
          const editDropdown = document.getElementById("editWokDropdown");
          if (editDropdown) editDropdown.value = id;
          let editWokModal = document.getElementById("editWokModal");
          if (!editWokModal) {
            alert('Edit modal missing from HTML. Please add the modal markup to menu.html.');
            return;
          }
          document.getElementById("editWokName").value = data.name || "";
          document.getElementById("editWokPrice").value = data.price || "";
          document.getElementById("editWokType").value = data.type || "";
          document.getElementById("editWokCategory").value = data.category || "";
          document.getElementById("editWokDescription").value = data.description || "";
          editWokModal.classList.add("active");
        });
      });
    grid.querySelectorAll('.pause-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-id');
        const paused = btn.getAttribute('data-paused') === 'true';
        await window.togglePauseWokBuilderItem(id, paused);
      });
    });
    grid.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-id');
        await window.deleteWokBuilderItem(id);
      });
    });
  });
// Edit wok builder item logic
// (Dropdown event listener now handled inside fetchWokBuilderItems)
let currentEditWokId = null;

const editWokModal = document.getElementById("editWokModal");
const closeEditWokModal = document.getElementById("closeEditWokModal");
const editWokForm = document.getElementById("editWokForm");

if (closeEditWokModal && editWokModal) {
  closeEditWokModal.addEventListener("click", () => {
    editWokModal.classList.remove("active");
  });
}

if (editWokForm && editWokModal) {
  editWokForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditWokId) return;
    const docRef = doc(db, "wokBuilderItems", currentEditWokId);
    await updateDoc(docRef, {
      name: document.getElementById("editWokName").value,
      price: parseFloat(document.getElementById("editWokPrice").value),
      type: document.getElementById("editWokType").value,
      category: document.getElementById("editWokCategory").value,
      description: document.getElementById("editWokDescription").value
    });
    editWokModal.classList.remove("active");
    fetchWokBuilderItems();
  });
}

// Pause/unpause wok builder item
window.togglePauseWokBuilderItem = async function (id, paused) {
  const docRef = doc(db, "wokBuilderItems", id);
  await updateDoc(docRef, { paused: !paused });
  fetchWokBuilderItems();
};
}

// Delete wok builder item
window.deleteWokBuilderItem = async function (id) {
  await deleteDoc(doc(db, "wokBuilderItems", id));
  fetchWokBuilderItems();
};

// Initial load for wok builder items
document.addEventListener('DOMContentLoaded', fetchWokBuilderItems);
// /public/admin/menu.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
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

// Add menu item
document.getElementById("menuForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const price = parseFloat(document.getElementById("price").value);
  const imageUrl = document.getElementById("imageUrl").value;
  const isAvailable = document.getElementById("isAvailable").checked;

  // 👇 NEW: Get selected type (veg/egg/non-veg)
  const type = document.querySelector('input[name="type"]:checked')?.value || "veg";

  // 👇 NEW: Get selected tags (spicy, for-one, etc.)
  const tags = Array.from(document.querySelectorAll('.tag:checked')).map(tag => tag.value);

  try {
    await addDoc(collection(db, "menuItems"), {
      name,
      description,
      category,
      price,
      imageUrl,
      isAvailable,
      type,
      tags,
      createdAt: serverTimestamp()
    });
    alert("Item added!");
    document.getElementById("menuForm").reset();
    fetchMenuItems();
  } catch (error) {
    console.error("Error adding item:", error);
  }
});

// Display menu items
document.addEventListener('DOMContentLoaded', fetchMenuItems);
async function fetchMenuItems() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;
  grid.innerHTML = "";
  // ...existing code for rendering cards...
  // Add event listeners for card actions (must be inside fetchMenuItems after grid is defined)
  // Only one set of listeners for each action, with debug logs
  grid.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = btn.getAttribute('data-id');
      const docRef = doc(db, "menuItems", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      let modal = document.getElementById('editMenuModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editMenuModal';
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <button class="modal-close" id="closeEditMenuModal" aria-label="Close">&times;</button>
            <h3>Edit Menu Item</h3>
            <form id="editMenuForm">
              <div class="form-row"><label>Name</label><input type="text" id="editMenuName" required /></div>
              <div class="form-row"><label>Description</label><input type="text" id="editMenuDesc" required /></div>
              <div class="form-row"><label>Price</label><input type="number" id="editMenuPrice" required /></div>
              <div class="form-row"><label>Image URL</label><input type="url" id="editMenuImageUrl" required /></div>
              <div class="form-row"><label>Category</label><input type="text" id="editMenuCategory" required /></div>
              <div class="form-row"><label>Status</label><select id="editMenuStatus"><option value="true">Available</option><option value="false">Unavailable</option></select></div>
              <button type="submit" class="add-btn">Save Changes</button>
            </form>
          </div>
        `;
        document.body.appendChild(modal);
      }
      document.getElementById('editMenuName').value = data.name || '';
      document.getElementById('editMenuDesc').value = data.description || '';
      document.getElementById('editMenuPrice').value = data.price || '';
      document.getElementById('editMenuImageUrl').value = data.imageUrl || '';
      document.getElementById('editMenuCategory').value = data.category || '';
      document.getElementById('editMenuStatus').value = data.isAvailable ? 'true' : 'false';
      modal.classList.add('active');
      document.getElementById('closeEditMenuModal').onclick = () => modal.classList.remove('active');
      modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };
      document.getElementById('editMenuForm').onsubmit = async function(e) {
        e.preventDefault();
        const updatedData = {
          name: document.getElementById('editMenuName').value,
          description: document.getElementById('editMenuDesc').value,
          price: parseFloat(document.getElementById('editMenuPrice').value),
          imageUrl: document.getElementById('editMenuImageUrl').value,
          category: document.getElementById('editMenuCategory').value,
          isAvailable: document.getElementById('editMenuStatus').value === 'true'
        };
        console.log('Attempting to update item:', id, updatedData);
        try {
          await updateDoc(docRef, updatedData);
          alert('Item updated successfully!');
          console.log('Update successful:', id);
        } catch (err) {
          alert('Failed to update item. Check console for details.');
          console.error('Update failed:', id, err);
        }
        modal.classList.remove('active');
        fetchMenuItems();
      };
    });
  });
  grid.querySelectorAll('.pause-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = btn.getAttribute('data-id');
      const docRef = doc(db, "menuItems", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      const newStatus = !data.isAvailable;
      console.log('Attempting to update isAvailable for item:', id, 'to', newStatus);
      try {
        await updateDoc(docRef, { isAvailable: newStatus });
        alert('Status updated successfully!');
        console.log('Status update successful:', id);
      } catch (err) {
        alert('Failed to update status. Check console for details.');
        console.error('Status update failed:', id, err);
      }
      let modal = document.getElementById('editMenuModal');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
      fetchMenuItems();
    });
  });
  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = btn.getAttribute('data-id');
      await deleteDoc(doc(db, "menuItems", id));
      fetchMenuItems();
    });
  });
  // Only one set of listeners for each action
  grid.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = btn.getAttribute('data-id');
      const docRef = doc(db, "menuItems", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      let modal = document.getElementById('editMenuModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editMenuModal';
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <button class="modal-close" id="closeEditMenuModal" aria-label="Close">&times;</button>
            <h3>Edit Menu Item</h3>
            <form id="editMenuForm">
              <div class="form-row"><label>Name</label><input type="text" id="editMenuName" required /></div>
              <div class="form-row"><label>Description</label><input type="text" id="editMenuDesc" required /></div>
              <div class="form-row"><label>Price</label><input type="number" id="editMenuPrice" required /></div>
              <div class="form-row"><label>Image URL</label><input type="url" id="editMenuImageUrl" required /></div>
              <div class="form-row"><label>Category</label><input type="text" id="editMenuCategory" required /></div>
              <div class="form-row"><label>Status</label><select id="editMenuStatus"><option value="true">Available</option><option value="false">Unavailable</option></select></div>
              <button type="submit" class="add-btn">Save Changes</button>
            </form>
          </div>
        `;
        document.body.appendChild(modal);
      }
      document.getElementById('editMenuName').value = data.name || '';
      document.getElementById('editMenuDesc').value = data.description || '';
      document.getElementById('editMenuPrice').value = data.price || '';
      document.getElementById('editMenuImageUrl').value = data.imageUrl || '';
      document.getElementById('editMenuCategory').value = data.category || '';
      document.getElementById('editMenuStatus').value = data.isAvailable ? 'true' : 'false';
      modal.classList.add('active');
      document.getElementById('closeEditMenuModal').onclick = () => modal.classList.remove('active');
      modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };
      document.getElementById('editMenuForm').onsubmit = async function(e) {
        e.preventDefault();
        await updateDoc(docRef, {
          name: document.getElementById('editMenuName').value,
          description: document.getElementById('editMenuDesc').value,
          price: parseFloat(document.getElementById('editMenuPrice').value),
          imageUrl: document.getElementById('editMenuImageUrl').value,
          category: document.getElementById('editMenuCategory').value,
          isAvailable: document.getElementById('editMenuStatus').value === 'true'
        });
        modal.classList.remove('active');
        fetchMenuItems();
      };
    });
  });
  grid.querySelectorAll('.pause-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = btn.getAttribute('data-id');
      const docRef = doc(db, "menuItems", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      await updateDoc(docRef, { isAvailable: !data.isAvailable });
      let modal = document.getElementById('editMenuModal');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
      fetchMenuItems();
    });
  });
  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = btn.getAttribute('data-id');
      await deleteDoc(doc(db, "menuItems", id));
      fetchMenuItems();
    });
  });
  const querySnapshot = await getDocs(collection(db, "menuItems"));
  let found = false;
  querySnapshot.forEach((docSnap) => {
    found = true;
    const data = docSnap.data();
    let typeSymbol = "🌱";
    const typeValue = (data.type || "veg").toString().trim().toLowerCase();
    if (typeValue === "egg") typeSymbol = "🥚";
    if (typeValue === "non-veg") typeSymbol = "🍗";
    const tagsHtml = Array.isArray(data.tags) && data.tags.length
      ? data.tags.map(tag => `<span class='tag-chip'>${tag}</span>`).join(" ")
      : "";
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <img src="${data.imageUrl}" alt="${data.name}" />
      <div class="menu-title">${data.name}</div>
      <div class="menu-type">${typeSymbol} ${typeValue.charAt(0).toUpperCase() + typeValue.slice(1)}</div>
      <div class="menu-category">${data.category}</div>
      <div class="menu-desc">${data.description || "No description"}</div>
      <div class="menu-price">₹${data.price}</div>
      <div class="menu-tags">${tagsHtml}</div>
      <div class="menu-status">${data.isAvailable ? 'Available' : 'Paused'}</div>
      <div class="menu-actions">
        <button class="edit-btn" data-id="${docSnap.id}" title="Edit">✏️</button>
        <button class="pause-btn" data-id="${docSnap.id}" title="Pause/Unpause">${data.isAvailable ? '⏸️' : '▶️'}</button>
        <button class="delete-btn" data-id="${docSnap.id}" title="Delete">🗑️</button>
      </div>
    `;
    grid.appendChild(card);
  });
  if (!found) {
    const msg = document.createElement("div");
    msg.style.textAlign = "center";
    msg.style.color = "#DC0E2A";
    msg.style.fontSize = "1.1rem";
    msg.style.margin = "2rem 0";
    msg.textContent = "No menu items found. Add a new item above.";
    grid.appendChild(msg);
  }
}

// ...existing code...