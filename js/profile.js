(function () {
  'use strict';

  // --- Dynamic HTML Injection ---
  const profileHTML = `
    <div class="profile-overlay" id="profile-overlay">
      <div class="profile-drawer" id="profile-drawer">
        
        <div class="profile-header">
          <h2>My Profile</h2>
          <button class="btn-close-profile" id="btn-close-profile">&times;</button>
        </div>

        <div class="profile-body">
          
          <!-- 1. Identity Card -->
          <div class="profile-identity-card">
            <div class="profile-avatar" id="profile-avatar-display">A</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.5rem;">
              <div class="profile-name" id="profile-name-display" style="cursor: pointer;" title="Click to edit name">Amisha</div>
              <span id="edit-name-icon" style="cursor: pointer; font-size: 0.85rem; opacity: 0.6;" title="Click to edit name">✏️</span>
            </div>
            <div class="profile-goal-tag" id="profile-goal-tag">Maintain Weight 💖</div>
          </div>

          <!-- 3. Weekly Insights -->
          <div class="profile-section">
            <h3 class="profile-section-title">📊 Weekly Insights</h3>
            <ul class="insights-list" id="profile-insights-list">
              <li>Loading your insights...</li>
            </ul>
          </div>

          <!-- 4. Wellness Message -->
          <div class="support-message-card">
            <p>"You are building strong healthy habits 💖 Consistency matters more than perfection 🌿"</p>
          </div>

          <!-- 5. Journal Quick Access -->
          <div class="profile-section">
            <h3 class="profile-section-title">📔 Journal Quick Access</h3>
            <div class="journal-preview">
              <div class="journal-entry-snippet" id="profile-journal-snippet">No journal entries yet. Start reflecting today!</div>
              <button class="btn-open-journal" id="btn-open-journal-profile">Open Journal ✍️</button>
            </div>
          </div>

          <!-- 6. Drawer Actions -->
          <div class="profile-actions" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <button class="btn btn-outline" id="btn-back-dashboard" style="width: 100%;">Back to Dashboard</button>
            <button class="btn btn-outline" id="btn-drawer-logout" style="width: 100%; color: var(--pink); border-color: var(--pink);">Logout</button>
          </div>

        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', profileHTML);

  // --- Elements ---
  const profileLinks = document.querySelectorAll('#profile-link');
  const overlay = document.getElementById('profile-overlay');
  const drawer = document.getElementById('profile-drawer');
  const btnClose = document.getElementById('btn-close-profile');
  const nameDisplay = document.getElementById('profile-name-display');
  const editNameIcon = document.getElementById('edit-name-icon');
  const avatarDisplay = document.getElementById('profile-avatar-display');
  
  // Settings (Non-existent now, but kept in code safely)
  const waterToggle = null;
  const pcosToggle = null;
  const themeToggle = null;
  const workoutToggle = null;
  const notiToggle = null;
  
  const pcosBadge = null;
  const goalTag = document.getElementById('profile-goal-tag');
  const journalSnippet = document.getElementById('profile-journal-snippet');
  const btnOpenJournal = document.getElementById('btn-open-journal-profile');
  const btnBackDashboard = document.getElementById('btn-back-dashboard');
  const btnDrawerLogout = document.getElementById('btn-drawer-logout');

  // --- State Keys ---
  const WORKOUT_STATE_KEY = 'hersync_workout_state';
  const PROFILE_STATE_KEY = 'hersync_profile_state';

  // --- Load Profile State ---
  function loadProfileState() {
    // Set Profile Name and Avatar
    const username = localStorage.getItem('hersync_username') || 'Amisha';
    if (nameDisplay) {
      nameDisplay.textContent = username;
    }
    if (avatarDisplay) {
      avatarDisplay.textContent = username.charAt(0).toUpperCase();
    }

    // Workout state (Water Reminder, Goal)
    let workoutState = { waterEnabled: false, goal: 'loss', completions: [false, false, false, false, false, false, false] };
    const wSaved = localStorage.getItem(WORKOUT_STATE_KEY);
    if (wSaved) workoutState = { ...workoutState, ...JSON.parse(wSaved) };

    // Set Goal Title
    const planTitles = {
      gain: 'Weight Gain 💖',
      loss: 'Weight Loss 💖',
      maintain: 'Maintain Weight 💖'
    };
    if (goalTag) goalTag.textContent = planTitles[workoutState.goal] || planTitles.loss;

    // Load latest journal entry
    if (journalSnippet) {
      const jSaved = localStorage.getItem('hersync_journal_entries');
      if (jSaved) {
        const entries = JSON.parse(jSaved);
        if (entries && entries.length > 0) {
          // Grab first entry
          journalSnippet.textContent = entries[0].mood + " " + entries[0].text;
        } else {
          journalSnippet.textContent = "No journal entries yet. Start reflecting today!";
        }
      } else {
        journalSnippet.textContent = "No journal entries yet. Start reflecting today!";
      }
    }

    // Load dynamic weekly insights
    const insightsList = document.getElementById('profile-insights-list');
    if (insightsList) {
      const insights = [];

      // 1. Active Days (from completions)
      const activeDays = (workoutState.completions || []).filter(c => c).length;
      if (activeDays > 0) {
        insights.push(`<li>You stayed active <strong>${activeDays} ${activeDays === 1 ? 'day' : 'days'}</strong> this week 💪</li>`);
      } else {
        insights.push(`<li>No active days logged yet. Keep moving! 🏃‍♀️</li>`);
      }

      // 2. Hydration
      if (workoutState.waterEnabled) {
        insights.push(`<li>Hydration reminder is active to keep you hydrated 💧</li>`);
      } else {
        insights.push(`<li>Enable water reminders to stay consistent 💧</li>`);
      }

      // 3. Mood Trend
      let moodTrendText = 'No entries yet 🌿';
      const jSaved = localStorage.getItem('hersync_journal_entries');
      if (jSaved) {
        const entries = JSON.parse(jSaved);
        if (entries && entries.length > 0) {
          const moodCounts = {};
          entries.forEach(entry => {
            if (entry.mood) {
              moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            }
          });
          let maxCount = 0;
          let dominantMood = '';
          for (const mood in moodCounts) {
            if (moodCounts[mood] > maxCount) {
              maxCount = moodCounts[mood];
              dominantMood = mood;
            }
          }
          if (dominantMood) {
            const moodDescriptions = {
              '😊': 'Mostly happy 😊',
              '😌': 'Mostly calm and peaceful 😌',
              '😐': 'Mostly neutral 😐',
              '😔': 'A bit low/sad 😔',
              '😫': 'A bit stressed 😫'
            };
            moodTrendText = moodDescriptions[dominantMood] || `Feeling ${dominantMood}`;
          }
        }
      }
      insights.push(`<li>Mood trend: <strong>${moodTrendText}</strong></li>`);

      // 4. Symptoms / Cycle Tracker
      const pSaved = localStorage.getItem('hersync_period_data');
      const sSaved = localStorage.getItem('hersync_symptoms');
      
      let cycleInsight = '';
      if (pSaved) {
        const periodData = JSON.parse(pSaved);
        const lastDate = new Date(periodData.lastDate);
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + Number(periodData.cycleLength));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDate.setHours(0, 0, 0, 0);
        
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
          cycleInsight = `Next period in <strong>${diffDays} ${diffDays === 1 ? 'day' : 'days'}</strong> 🌸`;
        } else {
          cycleInsight = `Period delayed by <strong>${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}</strong> ⚠️`;
        }
      }

      let symptomsText = '';
      if (sSaved) {
        const checkedSymptoms = JSON.parse(sSaved);
        if (checkedSymptoms && checkedSymptoms.length > 0) {
          symptomsText = `Logged symptoms: ${checkedSymptoms.slice(0, 3).join(', ')}${checkedSymptoms.length > 3 ? '...' : ''}`;
        }
      }

      if (cycleInsight && symptomsText) {
        insights.push(`<li>${cycleInsight} (${symptomsText})</li>`);
      } else if (cycleInsight) {
        insights.push(`<li>${cycleInsight}</li>`);
      } else if (symptomsText) {
        insights.push(`<li>${symptomsText}</li>`);
      } else {
        insights.push(`<li>Cycle tracking is ready for update 📅</li>`);
      }

      insightsList.innerHTML = insights.join('');
    }
  }

  // --- Inline Name Editing ---
  function handleNameEdit() {
    const currentName = localStorage.getItem('hersync_username') || 'Amisha';
    const newName = prompt('Enter your name:', currentName);
    if (newName !== null && newName.trim() !== '') {
      localStorage.setItem('hersync_username', newName.trim());
      loadProfileState();
    }
  }

  if (nameDisplay) {
    nameDisplay.addEventListener('click', handleNameEdit);
  }
  if (editNameIcon) {
    editNameIcon.addEventListener('click', handleNameEdit);
  }

  // --- Open/Close Drawer Logic ---
  profileLinks.forEach(link => {
    // Clone node to strip existing inline/js event listeners
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    newLink.addEventListener('click', (e) => {
      e.preventDefault();
      loadProfileState(); // Refresh data every time we open
      overlay.classList.add('active');
    });
  });

  btnClose.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  // Close on outside click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
    }
  });

  // --- Mobile Swipe to Close ---
  let touchStartX = 0;
  let touchEndX = 0;
  
  drawer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  drawer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 80) { // Swipe right
      overlay.classList.remove('active');
    }
  }, {passive: true});

  // --- Drawer Action Buttons ---
  btnBackDashboard.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  btnDrawerLogout.addEventListener('click', () => {
    localStorage.removeItem('hersync_username');
    window.location.href = 'index.html';
  });

  // --- Open Journal Quick Link ---
  btnOpenJournal.addEventListener('click', () => {
    overlay.classList.remove('active');
    const journalOverlay = document.getElementById('journal-overlay');
    const journalFab = document.getElementById('journal-fab');
    if (journalOverlay) {
      journalOverlay.classList.add('active');
    } else if (journalFab) {
      journalFab.click();
    }
  });

})();
