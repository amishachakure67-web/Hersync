(function () {
  'use strict';

  // --- Workout Data ---
  const workouts = {
    loss: [
      { day: 1, list: ['Squats 3 × 15', 'Lunges 3 × 12', 'Plank 30 Seconds'] },
      { day: 2, list: ['Jumping Jacks 3 × 20', 'Mountain Climbers 3 × 15', 'Stretching'] },
      { day: 3, list: ['High Knees 3 × 20', 'Burpees 3 × 10', 'Plank 40 Seconds'] },
      { day: 4, list: ['Rest Day / Light Yoga 15 Min', 'Stretching'] },
      { day: 5, list: ['Squats 3 × 20', 'Push-ups 3 × 10', 'Plank 45 Seconds'] },
      { day: 6, list: ['Jump Squats 3 × 15', 'Bicycle Crunches 3 × 20', 'Stretching'] },
      { day: 7, list: ['Active Rest', 'Full Body Stretch 20 Min'] }
    ],
    gain: [
      { day: 1, list: ['Squats 3 × 12', 'Push-Ups 3 × 10', 'Glute Bridges 3 × 15'] },
      { day: 2, list: ['Lunges 3 × 12', 'Shoulder Press 3 × 10', 'Stretching'] },
      { day: 3, list: ['Rest Day / Muscle Recovery'] },
      { day: 4, list: ['Deadlifts (Bodyweight/Bands) 3 × 12', 'Rows 3 × 12', 'Plank 40 Sec'] },
      { day: 5, list: ['Step-Ups 3 × 12', 'Push-Ups 3 × 12', 'Stretching'] },
      { day: 6, list: ['Bulgarian Split Squats 3 × 10', 'Glute Bridges 3 × 20', 'Core Work'] },
      { day: 7, list: ['Active Rest', 'Mobility Work 15 Min'] }
    ],
    maintain: [
      { day: 1, list: ['Yoga 15 Min', 'Bodyweight Squats 3 × 15', 'Stretching'] },
      { day: 2, list: ['Cycling 20 Min', 'Core Exercises 10 Min'] },
      { day: 3, list: ['Pilates 20 Min', 'Stretching'] },
      { day: 4, list: ['Dance Cardio 15 Min', 'Plank 30 Seconds'] },
      { day: 5, list: ['Yoga 20 Min', 'Stretching'] },
      { day: 6, list: ['Light Jogging 15 Min', 'Core Exercises 10 Min'] },
      { day: 7, list: ['Active Rest', 'Meditation 10 Min'] }
    ]
  };

  const planTitles = {
    loss: 'Weight Loss Plan',
    gain: 'Weight Gain Plan',
    maintain: 'Weight Maintenance Plan'
  };

  // --- DOM Elements ---
  const goalSelectionContainer = document.getElementById('goal-selection-container');
  const workoutLayout = document.getElementById('workout-layout');
  const goalCards = document.querySelectorAll('.goal-card');
  const btnChangeGoal = document.getElementById('btn-change-goal');
  const selectedGoalTitle = document.getElementById('selected-goal-title');
  const accordionContainer = document.getElementById('workout-accordion');
  const daysText = document.getElementById('days-completed-text');
  const progressFill = document.getElementById('progress-bar-fill');
  const profileLink = document.getElementById('profile-link');
  const toast = document.getElementById('toast');

  // --- Water Reminder DOM ---
  const waterSettingsModal = document.getElementById('water-settings-modal');
  const closeWaterModal = document.getElementById('close-water-modal');
  const intervalSelect = document.getElementById('water-interval-select');
  const soundToggle = document.getElementById('water-sound-toggle');
  const saveWaterSettings = document.getElementById('save-water-settings');

  // --- State Management ---
  let state = {
    goal: null, // 'loss', 'gain', 'maintain'
    completions: [false, false, false, false, false, false, false],
    waterEnabled: false,
    waterInterval: 60,
    waterSound: true
  };

  function loadState() {
    const saved = localStorage.getItem('hersync_workout_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed }; // Merge to preserve new keys if upgrading state
      if (state.goal) {
        showWorkoutPlan(state.goal);
      }
    }
    
    // Init modal inputs
    intervalSelect.value = state.waterInterval.toString();
    soundToggle.checked = state.waterSound;

    // Start timer if enabled
    if (state.waterEnabled && window.resetWaterTimer) {
      // It's handled globally, but we can ensure it's running
    }
  }

  function saveState() {
    localStorage.setItem('hersync_workout_state', JSON.stringify(state));
  }

  // --- Goal Selection Logic ---
  goalCards.forEach(card => {
    card.addEventListener('click', () => {
      const selected = card.getAttribute('data-goal');
      
      // Reset completions if changing goal
      if (state.goal !== selected) {
        state.completions = [false, false, false, false, false, false, false];
      }

      state.goal = selected;
      saveState();
      showWorkoutPlan(selected);
    });
  });

  btnChangeGoal.addEventListener('click', () => {
    workoutLayout.classList.add('hidden');
    goalSelectionContainer.style.display = 'block';
    
    // Highlight the currently selected goal
    goalCards.forEach(c => c.classList.remove('active'));
    document.querySelector(`.goal-card[data-goal="${state.goal}"]`)?.classList.add('active');
  });

  function showWorkoutPlan(goalKey) {
    goalSelectionContainer.style.display = 'none';
    workoutLayout.classList.remove('hidden');
    selectedGoalTitle.textContent = planTitles[goalKey] + ' (7 Days)';
    
    renderPlan(goalKey);
  }

  // --- Render Accordion ---
  function renderPlan(goalKey) {
    accordionContainer.innerHTML = '';
    const planData = workouts[goalKey];

    planData.forEach((dayData, index) => {
      const dayNum = dayData.day;
      const isCompleted = state.completions[index];
      
      const card = document.createElement('div');
      card.className = `day-card ${isCompleted ? 'completed' : ''}`;
      card.id = `workout-day-${dayNum}`;

      // Open Day 1 by default on first load
      if (dayNum === 1 && !accordionContainer.querySelector('.day-card.open')) {
        card.classList.add('open');
      }

      // Header
      const header = document.createElement('div');
      header.className = 'day-header';
      header.innerHTML = `
        <div class="day-header-left">
          <span class="day-title">Day ${dayNum}</span>
          <span class="day-status-badge">Completed</span>
        </div>
        <svg class="day-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      `;

      header.addEventListener('click', () => toggleAccordion(dayNum));

      // Content
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'day-content-wrapper';

      const content = document.createElement('div');
      content.className = 'day-content';

      // Daily Goals (Walking + Water)
      const dailyGoalsRow = document.createElement('div');
      dailyGoalsRow.className = 'daily-goals-row';
      dailyGoalsRow.innerHTML = `
        <div class="daily-goal-box">
          <div class="daily-goal-icon">🚶</div>
          <div class="daily-goal-text">
            <h4>Daily Walking Goal</h4>
            <p>30 Minutes or 8000 Steps</p>
          </div>
        </div>
        <div class="daily-goal-box" style="flex-direction: column; align-items: flex-start; justify-content: center;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div class="daily-goal-icon">💧</div>
            <div class="daily-goal-text">
              <h4>Water Goal</h4>
              <p>2.5 - 3 Litres Daily</p>
            </div>
          </div>
          
          <div class="water-toggle-container">
            <label class="switch">
              <input type="checkbox" class="water-toggle-input" ${state.waterEnabled ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <span class="water-toggle-label">Enable Water Reminder</span>
            <button class="btn-settings water-settings-btn" title="Settings">⚙️</button>
          </div>
        </div>
      `;
      content.appendChild(dailyGoalsRow);

      // Bind events for the water toggle and settings button for this card
      const waterToggle = dailyGoalsRow.querySelector('.water-toggle-input');
      const settingsBtn = dailyGoalsRow.querySelector('.water-settings-btn');

      waterToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        state.waterEnabled = isEnabled;
        saveState();
        
        // Sync all other toggles visually
        document.querySelectorAll('.water-toggle-input').forEach(input => {
          if (input !== e.target) input.checked = isEnabled;
        });

        if (isEnabled) {
          if (window.resetWaterTimer) window.resetWaterTimer();
          showToast('Water reminders enabled! 💧');
        } else {
          showToast('Water reminders disabled.');
        }
      });

      settingsBtn.addEventListener('click', () => {
        intervalSelect.value = state.waterInterval.toString();
        soundToggle.checked = state.waterSound;
        waterSettingsModal.classList.add('active');
      });

      // Workout List
      const listContainer = document.createElement('div');
      listContainer.className = 'workout-list-container';
      listContainer.innerHTML = `<h3>Workout Routine</h3>`;
      
      const ul = document.createElement('ul');
      ul.className = 'workout-list';
      dayData.list.forEach(exercise => {
        const li = document.createElement('li');
        li.textContent = exercise;
        ul.appendChild(li);
      });
      listContainer.appendChild(ul);
      content.appendChild(listContainer);

      // Completion Checkbox
      const completionSection = document.createElement('div');
      completionSection.className = 'day-completion-section';
      
      const compLabel = document.createElement('label');
      compLabel.className = 'completion-checkbox-label';
      compLabel.innerHTML = `
        <input type="checkbox" class="completion-checkbox-input" ${isCompleted ? 'checked' : ''}>
        <span class="completion-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span class="completion-text">${isCompleted ? '✓ Workout Completed' : 'Mark Workout Completed'}</span>
      `;

      const checkbox = compLabel.querySelector('.completion-checkbox-input');
      checkbox.addEventListener('change', (e) => {
        handleDayCompletion(index, dayNum, e.target.checked);
      });

      completionSection.appendChild(compLabel);
      content.appendChild(completionSection);

      contentWrapper.appendChild(content);
      card.appendChild(header);
      card.appendChild(contentWrapper);
      accordionContainer.appendChild(card);
    });

    updateProgressBar();
  }

  // --- Accordion Toggle ---
  function toggleAccordion(dayNum) {
    const cards = document.querySelectorAll('.day-card');
    cards.forEach(card => {
      if (card.id === `workout-day-${dayNum}`) {
        card.classList.toggle('open');
      } else {
        card.classList.remove('open');
      }
    });
  }

  // --- Completion Logic ---
  function handleDayCompletion(index, dayNum, isChecked) {
    state.completions[index] = isChecked;
    saveState();
    
    const card = document.getElementById(`workout-day-${dayNum}`);
    const compText = card.querySelector('.completion-text');
    
    if (isChecked) {
      card.classList.add('completed');
      compText.textContent = '✓ Workout Completed';
    } else {
      card.classList.remove('completed');
      compText.textContent = 'Mark Workout Completed';
    }

    updateProgressBar();
  }

  function updateProgressBar() {
    const completedCount = state.completions.filter(c => c).length;
    daysText.textContent = `${completedCount} / 7 Days Completed`;
    const percentage = (completedCount / 7) * 100;
    progressFill.style.width = `${percentage}%`;
  }

  function showToast(msg) {
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }


  // --- Water Reminder Logic ---
  
  // Modal Handlers
  closeWaterModal.addEventListener('click', () => {
    waterSettingsModal.classList.remove('active');
  });

  saveWaterSettings.addEventListener('click', () => {
    state.waterInterval = parseInt(intervalSelect.value, 10);
    state.waterSound = soundToggle.checked;
    saveState();
    waterSettingsModal.classList.remove('active');
    
    // Restart timer if enabled with new interval
    if (state.waterEnabled) {
      if (window.resetWaterTimer) window.resetWaterTimer();
      showToast(`Reminders set to every ${state.waterInterval} minutes.`);
    }
  });



  // --- Initialize ---
  loadState();

})();
