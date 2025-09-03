// Profile Completion Modal JS


document.addEventListener('DOMContentLoaded', function() {
  // Profile Progress Logic for Register Page
  let completedSteps = 0;
  let totalPoints = 0;

  function updateProgress() {
    completedSteps = 0;
    totalPoints = 0;
    // Name
    const nameInput = document.getElementById('profileName');
    if (nameInput.value.trim().length > 1) {
      completedSteps++;
      totalPoints += 10;
    }
    // Contact Number
    const contactInput = document.getElementById('profileContact');
    contactInput.value = contactInput.value.replace(/[^0-9]/g, '').slice(0, 10);
    if (contactInput.value.length === 10) {
      completedSteps++;
      totalPoints += 15;
    }
    // WhatsApp Number
    const whatsappInput = document.getElementById('profileWhatsapp');
    whatsappInput.value = whatsappInput.value.replace(/[^0-9]/g, '').slice(0, 10);
    if (whatsappInput.value.length === 10) {
      completedSteps++;
      totalPoints += 15;
    }
    // DOB
    const dobDay = document.getElementById('profileDOBDay').value;
    const dobMonth = document.getElementById('profileDOBMonth').value;
    const dobYear = document.getElementById('profileDOBYear').value;
    if (dobDay && dobMonth && dobYear) {
      completedSteps++;
      totalPoints += 20;
    }
    // Gender
    if (document.getElementById('profileGender').value) {
      completedSteps++;
      totalPoints += 10;
    }
    // Food Pref
    const selectedChips = document.querySelectorAll('.food-pref-chip.selected');
    if (selectedChips.length >= 5) {
      completedSteps++;
      totalPoints += 30;
    }
    // Update UI
    document.getElementById('profileProgressLabel').textContent = `${completedSteps}/5 steps completed`;
    // Animate progress bar width smoothly
    const progressBar = document.getElementById('profileProgressBar');
    progressBar.style.transition = 'width 0.4s cubic-bezier(.4,2,.3,1)';
    progressBar.style.width = `${completedSteps * 20}%`;
    document.getElementById('profilePoints').textContent = totalPoints;
    document.getElementById('profileBadgeLabel').textContent = completedSteps === 5 ? 'Profile Complete!' : 'Profile Progress';
    document.getElementById('progressEmoji').textContent = completedSteps === 5 ? '🎉' : '🔥';
  }

  // Food Preference Chips
  const foodCategories = ['Noodles', 'Rice', 'Dumplings', 'Soup', 'Veg', 'Chicken', 'Paneer', 'Spicy', 'Mild', 'Sweet', 'Szechuan', 'Manchurian', 'Spring Roll', 'Mom', 'Kids', 'Vegan'];
  const chipsContainer = document.getElementById('foodPrefChips');
  chipsContainer.innerHTML = '';
  foodCategories.forEach(cat => {
    const chip = document.createElement('div');
    chip.className = 'food-pref-chip';
    chip.textContent = cat;
    chip.addEventListener('click', function() {
      if (chip.classList.contains('selected')) {
        chip.classList.remove('selected');
      } else {
        if (chipsContainer.querySelectorAll('.selected').length < 5) {
          chip.classList.add('selected');
        }
      }
      updateProgress();
    });
    chipsContainer.appendChild(chip);
  });

  // Checkbox logic: use contact as WhatsApp
  const useContactCheckbox = document.getElementById('useContactAsWhatsapp');
  useContactCheckbox.addEventListener('change', function() {
    if (useContactCheckbox.checked) {
      document.getElementById('profileWhatsapp').value = document.getElementById('profileContact').value;
      document.getElementById('profileWhatsapp').setAttribute('readonly', true);
    } else {
      document.getElementById('profileWhatsapp').removeAttribute('readonly');
    }
    updateProgress();
  });
  document.getElementById('profileContact').addEventListener('input', function() {
    if (useContactCheckbox.checked) {
      document.getElementById('profileWhatsapp').value = document.getElementById('profileContact').value;
    }
    updateProgress();
  });

  // Input listeners
  document.getElementById('profileName').addEventListener('input', updateProgress);
  document.getElementById('profileContact').addEventListener('input', updateProgress);
  document.getElementById('profileWhatsapp').addEventListener('input', updateProgress);
  document.getElementById('profileDOBDay').addEventListener('change', updateProgress);
  document.getElementById('profileDOBMonth').addEventListener('change', updateProgress);
  document.getElementById('profileDOBYear').addEventListener('change', updateProgress);
  document.getElementById('profileGender').addEventListener('change', updateProgress);

  // Save Profile Button
  document.getElementById('registerCard').addEventListener('submit', async function(e) {
    e.preventDefault();
    updateProgress();
    // Collect all field values
    const name = document.getElementById('profileName').value.trim();
    const contact = document.getElementById('profileContact').value.trim();
    const whatsapp = document.getElementById('profileWhatsapp').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const dobDay = document.getElementById('profileDOBDay').value;
    const dobMonth = document.getElementById('profileDOBMonth').value;
    const dobYear = document.getElementById('profileDOBYear').value;
    const birthdate = dobDay && dobMonth && dobYear ? `${dobDay.padStart(2,'0')}/${dobMonth.padStart(2,'0')}/${dobYear}` : '';
    const username = document.getElementById('profileUsername').value.trim();
    const password = document.getElementById('profilePassword').value;
    const gender = document.getElementById('profileGender').value;
    const foodPrefs = Array.from(document.querySelectorAll('.food-pref-chip.selected')).map(chip => chip.textContent);

    // Validate all fields
    if (!name || !contact.match(/^[0-9]{10}$/) || !whatsapp.match(/^[0-9]{10}$/) || !email || !birthdate || !username || !password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/) || !gender || foodPrefs.length < 5) {
      alert('Please fill all fields correctly and select 5 food preferences.');
      return;
    }

    try {
      // Firebase registration
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const { getAuth, createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      function generateCoupon() {
        return 'WOK50' + Math.random().toString(36).substring(2, 6).toUpperCase();
      }
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        contact,
        whatsapp,
        email,
        birthdate,
        username,
        gender,
        foodPrefs,
        createdAt: new Date().toISOString(),
        points: 100,
        coupon: generateCoupon()
      });
      // Show confetti animation
      const confetti = document.getElementById('profileConfetti');
      confetti.innerHTML = '<span style="font-size:2rem;">🎊🎉✨</span>';
      setTimeout(() => { confetti.innerHTML = ''; }, 2000);
      document.getElementById('profilePointsAnim').textContent = '+100 Points!';
      setTimeout(() => { document.getElementById('profilePointsAnim').textContent = ''; }, 1800);
      alert('Registration successful!');
      document.getElementById('registerCard').reset();
      window.location.href = 'login.html';
    } catch (error) {
      alert('Registration failed: ' + error.message);
      console.error('Registration error:', error);
    }
  });

  // Initial progress
  updateProgress();
});
