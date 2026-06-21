(function () {
  'use strict';

  // --- Meal Pools for Random Generation ---
  const mealPools = {
    loss: {
      breakfast: [
        'Egg white omelet with spinach & mushrooms',
        'Protein oatmeal with berries & chia seeds',
        'Greek yogurt parfait with low-sugar granola',
        'Chia seed pudding with unsweetened almond milk',
        'Moong dal chilla with green chutney',
        'Tofu scramble with bell peppers',
        'Avocado toast on whole-wheat bread',
        'Sprouted moong salad with lemon dressing',
        'Besan chilla with cucumber yogurt',
        'Protein shake with spinach & half banana'
      ],
      lunch: [
        'Grilled chicken salad with light vinaigrette',
        'Quinoa and chickpea bowl with lemon juice',
        'Lentil soup with mixed green vegetables',
        'Tofu and broccoli stir-fry (low sodium)',
        'Soya chunks curry with 1 multigrain roti',
        'Cauliflower rice chicken bowl',
        'Mixed vegetable salad with low-fat paneer',
        'Kidney bean (rajma) salad with cucumber & tomato',
        'Fish tikka with sautéed green beans',
        'Moong dal soup with boiled carrots & peas'
      ],
      dinner: [
        'Baked salmon with steamed asparagus',
        'Paneer stir-fry with mixed vegetables',
        'Vegetable clear soup with grilled tofu',
        'Light moong dal khichdi with cucumber raita',
        'Grilled chicken breast with roasted broccoli',
        'Pumpkin soup with raw pumpkin seeds',
        'Sautéed cottage cheese with mushrooms',
        'Egg bhurji with 1 bajra roti',
        'Boiled chickpea and spinach salad',
        'Stir-fried zucchini noodles with cherry tomatoes'
      ]
    },
    gain: {
      breakfast: [
        'Peanut butter banana toast with honey',
        'Whole-egg cheese omelet with butter toast',
        'Creamy banana oat oatmeal with full-fat milk & nuts',
        'Double-decker paneer sandwich with butter',
        'Avocado banana smoothie with honey & whey protein',
        '4 Idlis with sambar & extra coconut chutney',
        'Full-fat Greek yogurt with granola & dried fruits',
        'Cheese paratha with dynamic potato filling',
        'Milkshake with almonds, dates, & peanut butter',
        'Loaded sweet potato hash with 2 eggs'
      ],
      lunch: [
        'Chicken biryani with full-fat curd',
        'Paneer butter masala with 2 butter rotis',
        'Rajma chawal with 2 tbsp ghee',
        'Chickpea quinoa bowl with rich olive oil dressing',
        'Brown rice with heavy egg curry',
        'Rich dal makhani with jeera rice & butter',
        'Double egg salad sandwich with creamy mayonnaise',
        'Fish curry with white rice & potato slices',
        'Chickpea potato curry with 3 hot puris',
        'Stuffed aloo paratha with rich curd & butter'
      ],
      dinner: [
        'Rich chicken curry with 3 parathas',
        'Paneer bhurji with 2 butter parathas',
        'Grilled salmon with creamy sweet potato mash',
        'Loaded moong dal khichdi with 2 tbsp ghee',
        'Loaded chicken quesadillas with cheese & sour cream',
        'Mixed vegetable curry with 3 butter rotis',
        'Creamy white sauce pasta with grilled paneer',
        'Grilled paneer steak with buttered mashed potatoes',
        'Tofu cashew stir-fry with jasmine rice',
        'Mutton/Beef stew with buttered bread slices'
      ]
    },
    maintain: {
      breakfast: [
        'Oats with fresh fruits & honey',
        'Vegetable poha with peanuts',
        'Paneer sandwich on multigrain bread',
        '3 Idlis with hot sambar',
        'Peanut butter toast with apple slices',
        'Semolina upma with mixed vegetables',
        '1 Multigrain paratha with plain curd',
        'Fruit smoothie with oats & almond milk',
        'Scrambled eggs with whole-wheat toast',
        'Granola bars with low-fat milk'
      ],
      lunch: [
        'Brown rice with yellow dal & salad',
        'Roti with paneer & capsicum curry',
        'Rajma rice with cucumber raita',
        'Balanced quinoa bowl with mixed vegetables',
        'Vegetable pulao with curd',
        'Kadhi chawal with steamed beans',
        'Whole-wheat chickpea wrap',
        'Stuffed capsicum with 2 multigrain rotis',
        'Veg club sandwich with light cheese',
        'Boiled egg and vegetable wrap'
      ],
      dinner: [
        'Roti with mixed vegetable sabzi',
        'Paneer stir-fry with bell peppers & soy sauce',
        'Hot vegetable soup with mixed green salad',
        'Balanced dal khichdi with curd',
        'Grilled vegetables with cottage cheese',
        'Vegetable pasta with tomato basil sauce',
        'Stir-fried tofu with whole-wheat noodles',
        'Dal fry with 2 multigrain rotis',
        'Baked potato with light cheese & broccoli',
        'Vegetable stew with 1 slice of sourdough'
      ]
    }
  };

  // --- Helper to get URL parameters ---
  function getGoalFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const goal = params.get('goal');
    if (['gain', 'loss', 'maintain'].includes(goal)) {
      return goal;
    }
    return 'loss'; // default
  }

  const goalKey = getGoalFromUrl();

  // --- Dynamic Page Setup ---
  const titleEl = document.getElementById('plan-title');
  const planTitles = {
    gain: 'Weight Gain Plan',
    loss: 'Weight Loss Plan',
    maintain: 'Weight Maintenance Plan'
  };
  titleEl.textContent = planTitles[goalKey];

  // --- Random Option Selection Helper ---
  function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
  }

  // --- Generate Weekly Meals ---
  function generateWeekData(goal) {
    const pool = mealPools[goal];
    const week = [];
    for (let day = 1; day <= 7; day++) {
      week.push({
        dayNumber: day,
        breakfastOptions: getRandomSubarray(pool.breakfast, 5),
        lunchOptions: getRandomSubarray(pool.lunch, 5),
        dinnerOptions: getRandomSubarray(pool.dinner, 5),
        selectedBreakfast: null,
        selectedLunch: null,
        selectedDinner: null,
        completed: false
      });
    }
    return week;
  }

  // --- State Management ---
  let state = {
    goal: goalKey,
    weekData: []
  };

  const storageKey = `hersync_plan_state_${goalKey}`;

  function loadState() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      state = JSON.parse(saved);
    } else {
      state.goal = goalKey;
      state.weekData = generateWeekData(goalKey);
      saveState();
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  // --- DOM Rendering and Handlers ---
  const accordionContainer = document.getElementById('days-accordion');
  const daysText = document.getElementById('days-completed-text');
  const progressFill = document.getElementById('progress-bar-fill');

  function renderPlan() {
    accordionContainer.innerHTML = '';

    state.weekData.forEach((day, index) => {
      const isCompleted = day.completed;
      
      const card = document.createElement('div');
      card.className = `day-card ${isCompleted ? 'completed' : ''}`;
      card.id = `day-card-${day.dayNumber}`;

      // Open Day 1 by default on first load
      if (day.dayNumber === 1 && !accordionContainer.querySelector('.day-card.open')) {
        card.classList.add('open');
      }

      // Card Header
      const header = document.createElement('div');
      header.className = 'day-header';
      header.innerHTML = `
        <div class="day-header-left">
          <span class="day-title">Day ${day.dayNumber}</span>
          <span class="day-status-badge">Completed</span>
        </div>
        <svg class="day-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      `;

      header.addEventListener('click', () => {
        toggleAccordion(day.dayNumber);
      });

      // Card Content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'day-content-wrapper';

      const content = document.createElement('div');
      content.className = 'day-content';

      // Breakfast Section
      content.appendChild(createMealSection(day.dayNumber, 'Breakfast', '🍳', day.breakfastOptions, day.selectedBreakfast, 'breakfast'));
      
      // Lunch Section
      content.appendChild(createMealSection(day.dayNumber, 'Lunch', '🥗', day.lunchOptions, day.selectedLunch, 'lunch'));
      
      // Dinner Section
      content.appendChild(createMealSection(day.dayNumber, 'Dinner', '🍲', day.dinnerOptions, day.selectedDinner, 'dinner'));

      // Day Completion Section
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
        <span class="completion-text">${isCompleted ? '✓ Day Completed' : 'Mark Day as Completed'}</span>
      `;

      const checkbox = compLabel.querySelector('.completion-checkbox-input');
      checkbox.addEventListener('change', (e) => {
        handleDayCompletion(day.dayNumber, e.target.checked);
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

  function createMealSection(dayNumber, typeName, icon, options, selectedValue, mealKey) {
    const section = document.createElement('div');
    section.className = 'meal-section';

    section.innerHTML = `
      <div class="meal-type-title">
        <span>${icon}</span>
        <span>${typeName}</span>
      </div>
    `;

    const optionsList = document.createElement('div');
    optionsList.className = 'meal-options-list';

    options.forEach((option, oIndex) => {
      const isChecked = selectedValue === option;
      const optionCard = document.createElement('label');
      optionCard.className = 'meal-option-card';
      optionCard.innerHTML = `
        <input type="radio" name="day-${dayNumber}-${mealKey}" class="meal-radio-input" value="${option}" ${isChecked ? 'checked' : ''}>
        <span class="meal-card-content">
          <span class="meal-radio-dot"></span>
          <span>${option}</span>
        </span>
      `;

      const radio = optionCard.querySelector('.meal-radio-input');
      radio.addEventListener('change', () => {
        state.weekData[dayNumber - 1][`selected${mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}`] = option;
        saveState();
      });

      optionsList.appendChild(optionCard);
    });

    section.appendChild(optionsList);
    return section;
  }

  // --- Accordion Logic ---
  function toggleAccordion(dayNumber) {
    const cards = document.querySelectorAll('.day-card');
    cards.forEach(card => {
      if (card.id === `day-card-${dayNumber}`) {
        card.classList.toggle('open');
      } else {
        card.classList.remove('open');
      }
    });
  }

  // --- Day Completion Logic ---
  function handleDayCompletion(dayNumber, isChecked) {
    const day = state.weekData[dayNumber - 1];
    
    // Check if user selected all meals before marking complete (Optional, but let's allow flexibility)
    day.completed = isChecked;
    
    // Update badge and text dynamically
    const card = document.getElementById(`day-card-${dayNumber}`);
    const compText = card.querySelector('.completion-text');
    
    if (isChecked) {
      card.classList.add('completed');
      compText.textContent = '✓ Day Completed';
    } else {
      card.classList.remove('completed');
      compText.textContent = 'Mark Day as Completed';
    }

    saveState();
    updateProgressBar();
  }

  // --- Progress Updates ---
  function updateProgressBar() {
    const completedCount = state.weekData.filter(day => day.completed).length;
    daysText.textContent = `${completedCount} / 7 Days Completed`;
    const percentage = (completedCount / 7) * 100;
    progressFill.style.width = `${percentage}%`;
  }

  // --- Generate Next Week Plan ---
  const generateBtn = document.getElementById('generate-next-week-btn');
  generateBtn.addEventListener('click', () => {
    // Add small loading animation
    generateBtn.textContent = 'Generating Plan...';
    generateBtn.classList.add('loading');

    setTimeout(() => {
      state.weekData = generateWeekData(goalKey);
      saveState();
      renderPlan();
      
      generateBtn.textContent = 'Generate Next Week Plan';
      generateBtn.classList.remove('loading');

      // Scroll to top of plan
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  });

  // --- Init ---
  loadState();
  renderPlan();

})();
