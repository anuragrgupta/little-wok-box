// /public/js/menu.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let allItems = [];

async function fetchAndDisplayMenuItems() {
  const querySnapshot = await getDocs(collection(db, "menuItems"));
  allItems = [];

  querySnapshot.forEach(doc => {
    const item = doc.data();
    if (item.isAvailable) {
      allItems.push({ id: doc.id, ...item });
    }
  });

  renderMenuItems(allItems); // Render all initially
  filterMenu(); // Apply filters after rendering
}

function renderMenuItems(items) {
  const menuGrid = document.getElementById("menuGrid");
  menuGrid.innerHTML = "";

  if (items.length === 0) {
    menuGrid.innerHTML = "<p>No items match your filter.</p>";
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("menu-item");
    card.dataset.category = (item.category || "").toLowerCase();
    card.dataset.type = item.type?.toLowerCase() || "veg";
    card.dataset.tags = (item.tags || []).join(',');

    card.innerHTML = `
      <div class="menu-item-image">
        <img src="${item.imageUrl}" alt="${item.name}" />
        ${item.type === "veg" ? '<span class="veg-badge">🌱</span>' :
          item.type === "egg" ? '<span class="egg-badge">🥚</span>' :
          '<span class="non-veg-badge">🍗</span>'}
        ${item.tags?.includes("Spicy") ? '<span class="spicy-badge">🌶️</span>' : ''}
      </div>
      <div class="menu-item-content">
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <div class="menu-item-meta">
          <span class="price">₹${item.price}</span>
          ${item.preparationTime ? `<span class="prep-time">${item.preparationTime} min</span>` : ""}
          ${item.calories ? `<span class="calories">${item.calories} cal</span>` : ""}
        </div>
        <button class="add-to-cart-btn" onclick="alert('Added ${item.name} to cart!')">Add to Cart</button>
      </div>
    `;
    menuGrid.appendChild(card);
  });
}

function filterMenu() {
  const searchTerm = document.getElementById('menuSearch')?.value.toLowerCase() || "";
  const veg = document.getElementById('vegToggle')?.checked;
  const egg = document.getElementById('eggToggle')?.checked;
  const nonveg = document.getElementById('nonVegToggle')?.checked;
  const selectedCategory = document.querySelector('.category-btn.active')?.dataset.category?.toLowerCase() || 'all';

  const selectedTags = Array.from(document.querySelectorAll('.tagFilter:checked')).map(t => t.value);

  const items = document.querySelectorAll('.menu-item');

  items.forEach(item => {
    const name = item.querySelector('h3').textContent.toLowerCase();
    const itemType = item.dataset.type;
    const itemCategory = item.dataset.category;
    const itemTags = item.dataset.tags ? item.dataset.tags.split(',') : [];

    const matchesSearch = name.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || itemCategory === selectedCategory;
    const matchesType =
      (!veg && !egg && !nonveg) ||
      (itemType === 'veg' && veg) ||
      (itemType === 'egg' && egg) ||
      (itemType === 'non-veg' && nonveg);

    // If no tags selected, match all
    let matchesTags = true;
    if (selectedTags.length > 0) {
      matchesTags = selectedTags.some(tag => itemTags.includes(tag));
    }

    if (matchesSearch && matchesCategory && matchesType && matchesTags) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayMenuItems();

  document.getElementById('menuSearch')?.addEventListener('input', filterMenu);
  document.getElementById('vegToggle')?.addEventListener('change', filterMenu);
  document.getElementById('eggToggle')?.addEventListener('change', filterMenu);
  document.getElementById('nonVegToggle')?.addEventListener('change', filterMenu);

  document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function () {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterMenu();
    });
  });

  document.querySelectorAll('.tagFilter').forEach(cb => cb.addEventListener('change', filterMenu));
});


document.querySelectorAll('.toggle-label input[type="checkbox"]').forEach(input => {
  input.addEventListener('change', () => {
    if (input.checked) {
      input.parentElement.classList.add('active');
    } else {
      input.parentElement.classList.remove('active');
    }
  });

  // Set active state on page load
  if (input.checked) {
    input.parentElement.classList.add('active');
  }
});


