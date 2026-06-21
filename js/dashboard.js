(function () {
  'use strict';

  const bmiForm = document.getElementById('bmi-form');
  const resultSection = document.getElementById('bmi-result-section');
  const scoreValue = document.getElementById('bmi-score-value');
  const bmiBadge = document.getElementById('bmi-badge');
  const bmiDescription = document.getElementById('bmi-description');
  const bmiMarker = document.getElementById('bmi-marker');
  const logoutBtn = document.getElementById('logout-btn');

  // BMI Category configurations
  const categories = {
    underweight: {
      label: 'Underweight',
      class: 'badge-blue',
      desc: 'You are currently considered underweight. It might be helpful to consult with a healthcare provider for personalized dietary advice.'
    },
    normal: {
      label: 'Normal Weight',
      class: 'badge-green',
      desc: 'Great job! You are within a healthy weight range. Keep up the balanced lifestyle.'
    },
    overweight: {
      label: 'Overweight',
      class: 'badge-orange',
      desc: 'You are considered overweight. Consider incorporating more physical activity and a balanced diet into your routine.'
    },
    obese: {
      label: 'Obese',
      class: 'badge-red',
      desc: 'Your BMI falls into the obese category. We recommend speaking with a healthcare professional to create a safe wellness plan.'
    }
  };

  /* ---- Error Handling Helpers ---- */

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

  function validateInput(id, min, max, name) {
    const input = document.getElementById(id);
    const val = parseFloat(input.value);

    if (!input.value) {
      showError(id, `${name} is required`);
      return null;
    }
    if (isNaN(val) || val < min || val > max) {
      showError(id, `Please enter a valid ${name.toLowerCase()} between ${min} and ${max}`);
      return null;
    }
    clearError(id);
    return val;
  }

  function validateSelect(id, name) {
    const input = document.getElementById(id);
    if (!input.value) {
      showError(id, `Please select your ${name.toLowerCase()}`);
      return null;
    }
    clearError(id);
    return input.value;
  }

  /* ---- Form Submission & Calculation ---- */

  bmiForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const age = validateInput('age', 10, 120, 'Age');
    const sleep = validateInput('sleep', 0, 24, 'Sleep hours');
    const weight = validateInput('weight', 20, 300, 'Weight');
    const height = validateInput('height', 50, 250, 'Height');
    const activity = validateSelect('activity', 'Activity Level');

    if (age === null || sleep === null || weight === null || height === null || !activity) {
      return;
    }

    const btn = bmiForm.querySelector('.btn-calculate');
    const originalText = btn.textContent;
    btn.textContent = 'Calculating...';
    btn.classList.add('loading');

    // Simulate small processing delay for UX
    setTimeout(() => {
      calculateAndDisplayBMI(weight, height);
      btn.textContent = originalText;
      btn.classList.remove('loading');
    }, 600);
  });

  function calculateAndDisplayBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const roundedBmi = bmi.toFixed(1);

    scoreValue.textContent = roundedBmi;

    // Reset badge classes
    bmiBadge.className = 'bmi-badge';

    let categoryKey;
    let markerPosition = 0; // percentage

    if (bmi < 18.5) {
      categoryKey = 'underweight';
      // Scale: 10 to 18.5 is mapped to 0% to 25%
      const relative = Math.max(0, bmi - 10) / 8.5;
      markerPosition = relative * 25;
    } else if (bmi < 25) {
      categoryKey = 'normal';
      // Scale: 18.5 to 25 is mapped to 25% to 50%
      const relative = (bmi - 18.5) / 6.5;
      markerPosition = 25 + (relative * 25);
    } else if (bmi < 30) {
      categoryKey = 'overweight';
      // Scale: 25 to 30 is mapped to 50% to 75%
      const relative = (bmi - 25) / 5;
      markerPosition = 50 + (relative * 25);
    } else {
      categoryKey = 'obese';
      // Scale: 30 to 45 is mapped to 75% to 100%
      const relative = Math.min(1, (bmi - 30) / 15);
      markerPosition = 75 + (relative * 25);
    }

    // Goal Configurations
    const goals = {
      underweight: [
        { text: 'Gain Weight', btn: 'Get Weight Gain Plan', type: 'gain' },
        { text: 'Maintain Weight', btn: 'Get Maintenance Plan', type: 'maintain' }
      ],
      normal: [
        { text: 'Maintain Weight', btn: 'Get Maintenance Plan', type: 'maintain' }
      ],
      overweight: [
        { text: 'Lose Weight', btn: 'Get Weight Loss Plan', type: 'loss' }
      ],
      obese: [
        { text: 'Lose Weight', btn: 'Get Weight Loss Plan', type: 'loss' }
      ]
    };

    const config = categories[categoryKey];
    
    bmiBadge.textContent = config.label;
    bmiBadge.classList.add(config.class);
    bmiDescription.textContent = config.desc;

    // Populate Goal Recommendations
    const goalOptionsContainer = document.getElementById('goal-options');
    const recommendationSection = document.getElementById('bmi-recommendation');
    
    goalOptionsContainer.innerHTML = ''; // Clear previous options
    const currentGoals = goals[categoryKey];

    currentGoals.forEach(goal => {
      const goalItem = document.createElement('div');
      goalItem.className = 'goal-item';
      
      const goalText = document.createElement('div');
      goalText.className = 'goal-text';
      goalText.textContent = goal.text;
      
      const button = document.createElement('button');
      button.className = 'btn-goal';
      button.textContent = goal.btn;
      
      // Add redirection handler
      button.addEventListener('click', () => {
        window.location.href = `plan.html?goal=${goal.type}`;
      });
      
      goalItem.appendChild(goalText);
      goalItem.appendChild(button);
      goalOptionsContainer.appendChild(goalItem);
    });

    // Show result section and recommendation smoothly
    resultSection.classList.remove('hidden');
    recommendationSection.classList.remove('hidden');
    
    // Position marker
    setTimeout(() => {
      bmiMarker.style.left = `${markerPosition}%`;
      bmiMarker.classList.add('active');
    }, 100);

    // Scroll to results on mobile
    if (window.innerWidth < 960) {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Clear validation errors on input
  document.querySelectorAll('.dash-input').forEach(input => {
    input.addEventListener('input', () => clearError(input.id));
    input.addEventListener('change', () => clearError(input.id));
  });



  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

})();
