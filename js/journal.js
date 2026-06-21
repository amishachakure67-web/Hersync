(function () {
  'use strict';

  // --- Dynamic HTML Injection ---
  const journalHTML = `
    <!-- Floating Action Button -->
    <button class="journal-fab" id="journal-fab" title="Daily Journal">
      ✍️
    </button>

    <!-- Journal Overlay & Modal -->
    <div class="journal-overlay" id="journal-overlay">
      <div class="journal-modal" id="journal-modal" aria-modal="true" role="dialog">
        
        <div class="journal-header">
          <h3><span>📔</span> Daily Reflections</h3>
          <button class="btn-close-modal" id="btn-close-journal">×</button>
        </div>

        <div class="journal-body">
          
          <div class="journal-date" id="journal-date-display">--</div>

          <div class="mood-selector">
            <label>How are you feeling today?</label>
            <div class="mood-emojis" id="mood-emojis">
              <button type="button" class="mood-btn selected" data-mood="😊" title="Happy">😊</button>
              <button type="button" class="mood-btn" data-mood="😌" title="Calm">😌</button>
              <button type="button" class="mood-btn" data-mood="😐" title="Neutral">😐</button>
              <button type="button" class="mood-btn" data-mood="😔" title="Sad">😔</button>
              <button type="button" class="mood-btn" data-mood="😫" title="Stressed">😫</button>
            </div>
          </div>

          <textarea class="journal-textarea" id="journal-textarea" placeholder="Write how you feel today... Take a deep breath and reflect. 🌸"></textarea>

          <button class="btn btn-primary btn-save-journal" id="btn-save-journal">Save Entry</button>

          <div class="saved-entries-section">
            <h4 class="saved-entries-title">Saved Entries</h4>
            <div class="comfort-panel" id="comfort-panel">
              <h4>Sending you love and light! 💖</h4>
              <p>It's completely okay to not feel okay sometimes. Here are a few reminders for you:</p>
              <ul class="comfort-points-list" id="comfort-points-list">
                <!-- Dynamically inserted -->
              </ul>
              <button class="btn-close-comfort" id="btn-close-comfort">I feel a little better</button>
            </div>
            <div class="saved-entries-list" id="saved-entries-list">
              <!-- Entries injected here -->
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  // Inject into body
  document.body.insertAdjacentHTML('beforeend', journalHTML);

  // --- DOM Elements ---
  const fab = document.getElementById('journal-fab');
  const overlay = document.getElementById('journal-overlay');
  const btnClose = document.getElementById('btn-close-journal');
  const dateDisplay = document.getElementById('journal-date-display');
  const moodBtns = document.querySelectorAll('.mood-btn');
  const textarea = document.getElementById('journal-textarea');
  const btnSave = document.getElementById('btn-save-journal');
  const entriesList = document.getElementById('saved-entries-list');
  const comfortPanel = document.getElementById('comfort-panel');
  const comfortPointsList = document.getElementById('comfort-points-list');
  const btnCloseComfort = document.getElementById('btn-close-comfort');
  
  // Try to find the global toast if it exists, otherwise we'll just alert or silently save
  const globalToast = document.getElementById('toast');

  // --- Comfort Points Content ---
  const comfortPoints = [
    "You have survived 100% of your bad days. You are stronger than you know. 🌸",
    "It's okay to rest and do nothing today if that's what your body needs. 🧘‍♀️",
    "Feelings are like clouds; they will pass. Be gentle with yourself. ☁️",
    "Your worth is not defined by how productive you were today. 💖",
    "Take a deep breath in... and let it out slowly. You are doing the best you can. 🌿",
    "Remember to treat yourself with the same kindness you'd offer a friend. ✨",
    "Be proud of how hard you are trying. Small progress is still progress. 🌱",
    "You are allowed to have boundaries, to say no, and to choose yourself. 💜",
    "Your feelings are valid. Take all the time you need to process them. 💕",
    "Slow down. You don't have to figure everything out right now. 🌸",
    "You are enough just as you are. You don't have to earn your place in this world. 🌟",
    "Believe in yourself. You have the strength to overcome whatever is stressing you. 💪",
    "Treat yourself with the same love and compassion you give to others. 💖",
    "Every storm runs out of rain. Hard times are temporary. 🌈"
  ];

  // Helper to shuffle array and pick top 3
  function getRandomComfortPoints() {
    let shuffled = [...comfortPoints];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled.slice(0, 3);
  }

  // --- Close Comfort Panel ---
  btnCloseComfort.addEventListener('click', () => {
    comfortPanel.classList.remove('active');
  });

  // --- State ---
  let selectedMood = '😊';
  const STORAGE_KEY = 'hersync_journal_entries';

  // --- Format Date Helper ---
  function getTodayString() {
    const today = new Date();
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return today.toLocaleDateString('en-GB', options); // e.g., 10 Jun 2026
  }

  // --- Initialize Date ---
  dateDisplay.textContent = getTodayString();

  // --- Modal Toggle ---
  fab.addEventListener('click', () => {
    overlay.classList.add('active');
    renderEntries(); // fresh render when opened
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

  // --- Mood Selection ---
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = btn.getAttribute('data-mood');
    });
  });

  // --- Save Logic ---
  btnSave.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      // Small shake or red border if empty
      textarea.style.borderColor = 'red';
      setTimeout(() => textarea.style.borderColor = '', 1000);
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: getTodayString(),
      mood: selectedMood,
      text: text
    };

    // Save to local storage
    let entries = getEntries();
    entries.unshift(newEntry); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    // Clear form
    textarea.value = '';
    
    // Show toast
    if (globalToast) {
      globalToast.textContent = 'Journal entry saved! 🌸';
      globalToast.classList.add('show');
      setTimeout(() => globalToast.classList.remove('show'), 3000);
    }

    // Re-render list
    renderEntries();

    // Check for negative sentiment
    const lowerText = text.toLowerCase();
    const isSadMood = selectedMood === '😔' || selectedMood === '😫';
    const negativePhrases = [
      'sad', 'stressed', 'anxious', 'depressed', 'cry', 'overwhelmed', 'terrible', 'upset', 'tired', 'exhausted', 'hate',
      'not feeling good', 'nit feeling good', 'not feel good', 'nit feel good',
      'not good', 'nit good', 'bad', 'down', 'lonely', 'hurt', 'pain', 'sick', 'unhappy', 'no good', 'not well', 'nit well'
    ];
    const hasSadKeywords = negativePhrases.some(kw => lowerText.includes(kw));

    if (isSadMood || hasSadKeywords) {
      // Populate comforting points
      const points = getRandomComfortPoints();
      comfortPointsList.innerHTML = points.map(p => `<li>✨ <span>${p}</span></li>`).join('');
      // Show panel
      comfortPanel.classList.add('active');
      // Scroll to it softly
      comfortPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Hide if it was open
      comfortPanel.classList.remove('active');
    }
  });

  // --- Render Logic ---
  function getEntries() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  function renderEntries() {
    const entries = getEntries();
    entriesList.innerHTML = '';

    if (entries.length === 0) {
      entriesList.innerHTML = '<div class="no-entries-text">No entries yet. Start reflecting today!</div>';
      return;
    }

    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      
      // Escape HTML to prevent XSS (basic)
      const safeText = entry.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      card.innerHTML = `
        <div class="entry-card-header">
          <span class="entry-card-date">${entry.date}</span>
          <span class="entry-card-mood">${entry.mood}</span>
        </div>
        <p class="entry-card-text">${safeText}</p>
      `;
      
      entriesList.appendChild(card);
    });
  }

})();
