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
            <div class="profile-name" id="profile-name-display">Amisha</div>
            <div class="profile-goal-tag" id="profile-goal-tag">Maintain Weight 💖</div>
          </div>

          <!-- 3. Weekly Insights -->
          <div class="profile-section">
            <h3 class="profile-section-title">📊 Weekly Insights</h3>
            <ul class="insights-list">
              <li>You stayed active 4 days this week 💪</li>
              <li>Hydration consistency is improving 💧</li>
              <li>Mood trend: Mostly calm 🌿</li>
              <li>Most active time: Morning 🌞</li>
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
    // Set Profile Name
    const nameDisplay = document.getElementById('profile-name-display');
    if (nameDisplay) {
      const username = localStorage.getItem('hersync_username') || 'Amisha';
      nameDisplay.textContent = username;
    }

    // Workout state (Water Reminder, Goal)
    let workoutState = { waterEnabled: false, goal: 'loss' };
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
        }
      }
    }
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
