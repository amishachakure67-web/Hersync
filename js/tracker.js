(function () {
  'use strict';

  const periodForm = document.getElementById('period-form');
  const resultCard = document.getElementById('period-result-card');
  const resLastDate = document.getElementById('res-last-date');
  const resNextDate = document.getElementById('res-next-date');
  const resDaysRemaining = document.getElementById('res-days-remaining');
  const resCycleLength = document.getElementById('res-cycle-length');
  const resDuration = document.getElementById('res-duration');

  const statusBanner = document.getElementById('period-status-banner');
  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');

  const delayedWrapper = document.getElementById('delayed-action-wrapper');
  const delayedTipsBtn = document.getElementById('delayed-tips-btn');
  const delayedTipsPanel = document.getElementById('delayed-tips-panel');

  const symptomsForm = document.getElementById('symptoms-form');
  const symptomsStatusMsg = document.getElementById('symptoms-status-msg');
  const toast = document.getElementById('toast');
  const profileLink = document.getElementById('profile-link');

  // --- Date Formatting Helper ---
  function formatDate(date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // --- Error Handling Helpers ---
  function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + '-error');
    input.classList.add('error');
    error.textContent = message;
    error.classList.add('visible');
  }

  function clearError(inputId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + '-error');
    input.classList.remove('error');
    error.textContent = '';
    error.classList.remove('visible');
  }

  // --- Calculate Period Cycle ---
  periodForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const lastDateVal = document.getElementById('last-period-date').value;
    const cycleLengthVal = document.getElementById('cycle-length').value;
    const durationVal = document.getElementById('period-duration').value;

    let isValid = true;

    if (!lastDateVal) {
      showError('last-period-date', 'Last period start date is required');
      isValid = false;
    } else {
      clearError('last-period-date');
    }

    const cycle = parseInt(cycleLengthVal);
    if (isNaN(cycle) || cycle < 20 || cycle > 45) {
      showError('cycle-length', 'Cycle length must be between 20 and 45 days');
      isValid = false;
    } else {
      clearError('cycle-length');
    }

    const duration = parseInt(durationVal);
    if (isNaN(duration) || duration < 2 || duration > 14) {
      showError('period-duration', 'Duration must be between 2 and 14 days');
      isValid = false;
    } else {
      clearError('period-duration');
    }

    if (!isValid) return;

    // Save inputs to localStorage
    const periodData = {
      lastDate: lastDateVal,
      cycleLength: cycle,
      duration: duration
    };
    localStorage.setItem('hersync_period_data', JSON.stringify(periodData));

    calculateCycle(lastDateVal, cycle, duration);
  });

  function calculateCycle(lastDateStr, cycleLength, duration) {
    const lastDate = new Date(lastDateStr);
    
    // Calculate Next Period Date
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + cycleLength);

    // Get Today's Date (ignoring time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkNextDate = new Date(nextDate);
    checkNextDate.setHours(0, 0, 0, 0);

    // Difference in time
    const diffTime = checkNextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Update Result Text
    resLastDate.textContent = formatDate(lastDate);
    resNextDate.textContent = formatDate(nextDate);
    resCycleLength.textContent = `${cycleLength} Days`;
    resDuration.textContent = `${duration} Days`;

    // Reset banner classes
    statusBanner.className = 'status-banner';
    delayedWrapper.classList.add('hidden');
    delayedTipsPanel.classList.remove('open');
    delayedTipsBtn.classList.remove('open');

    if (diffDays >= 0) {
      // Not overdue
      resDaysRemaining.textContent = `${diffDays} Days`;
      statusIcon.textContent = '✓';
      statusText.textContent = 'Cycle Tracking Active';
      statusBanner.classList.add('active');
    } else {
      // Overdue (Delayed)
      const overdueDays = Math.abs(diffDays);
      resDaysRemaining.textContent = `${overdueDays} Days Overdue`;
      statusIcon.textContent = '⚠';
      statusText.textContent = `Period Delayed by ${overdueDays} Days`;
      statusBanner.classList.add('delayed');
      
      // Show Delayed tips button
      delayedWrapper.classList.remove('hidden');
    }

    // Reveal Result Card
    resultCard.classList.remove('hidden');

    // Scroll down to results on mobile
    if (window.innerWidth < 960) {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // --- Delayed Tips Accordion Toggle ---
  delayedTipsBtn.addEventListener('click', function () {
    delayedTipsBtn.classList.toggle('open');
    delayedTipsPanel.classList.toggle('open');
  });

  // --- Load Saved Period Data on Init ---
  function initPeriodData() {
    const saved = localStorage.getItem('hersync_period_data');
    if (saved) {
      const data = JSON.parse(saved);
      document.getElementById('last-period-date').value = data.lastDate;
      document.getElementById('cycle-length').value = data.cycleLength;
      document.getElementById('period-duration').value = data.duration;
      calculateCycle(data.lastDate, data.cycleLength, data.duration);
    }
  }

  // --- Save Symptoms Checklist ---
  symptomsForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const checkedSymptoms = [];
    const checkboxes = symptomsForm.querySelectorAll('.symptom-checkbox-input');
    checkboxes.forEach(cb => {
      if (cb.checked) {
        checkedSymptoms.push(cb.value);
      }
    });

    // Save to localStorage
    localStorage.setItem('hersync_symptoms', JSON.stringify(checkedSymptoms));

    // Show success message
    symptomsStatusMsg.classList.add('visible');
    setTimeout(() => {
      symptomsStatusMsg.classList.remove('visible');
    }, 3000);
  });

  // --- Load Saved Symptoms ---
  function initSymptoms() {
    const saved = localStorage.getItem('hersync_symptoms');
    if (saved) {
      const checkedSymptoms = JSON.parse(saved);
      const checkboxes = symptomsForm.querySelectorAll('.symptom-checkbox-input');
      checkboxes.forEach(cb => {
        if (checkedSymptoms.includes(cb.value)) {
          cb.checked = true;
        }
      });
    }
  }

  // --- Clear validation errors on inputs ---
  document.querySelectorAll('.dash-input').forEach(input => {
    input.addEventListener('input', () => clearError(input.id));
  });



  // --- Initialize ---
  initPeriodData();
  initSymptoms();

})();
