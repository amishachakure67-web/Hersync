(function () {
  'use strict';

  // State keys
  const STATE_KEY = 'hersync_workout_state';
  const TIME_KEY = 'hersync_water_timestamp';

  const waterMessages = [
    "Time to hydrate 🌸 Take a sip of water",
    "Stay glowing! 💖 Drink a glass of water",
    "Hydration check: You’re doing amazing 🌿"
  ];



  function getState() {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return { waterEnabled: false, waterInterval: 60, waterSound: true };
  }

  function getTimestamp() {
    const ts = localStorage.getItem(TIME_KEY);
    return ts ? parseInt(ts, 10) : Date.now();
  }

  function setTimestamp(ts) {
    localStorage.setItem(TIME_KEY, ts.toString());
  }

  function triggerWaterNotification(state) {
    const msg = waterMessages[Math.floor(Math.random() * waterMessages.length)];
    
    if (state.waterSound) {
      try {
        const audio = new Audio('assets/chime.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio playback prevented or missing file', e));
      } catch (e) {
        console.log('Audio error', e);
      }
    }

    const mainToast = document.getElementById('toast');
    if (mainToast) {
      mainToast.textContent = "💧 " + msg;
      mainToast.classList.add('show');
      setTimeout(() => mainToast.classList.remove('show'), 5000);
    }
  }

  function checkWaterReminder() {
    const state =getState();
    if (!state.waterEnabled) return;

    const intervalMs = state.waterInterval * 60 * 1000;
    const lastTime = getTimestamp();
    const now = Date.now();

    if (now - lastTime >= intervalMs) {
      // Time to remind
      triggerWaterNotification(state);
      // Reset timestamp to now so it waits another interval
      setTimestamp(now);
    }
  }

  // Check every 10 seconds
  setInterval(checkWaterReminder, 10000);



  // Init: if enabled and no timestamp, set it
  if (getState().waterEnabled && !localStorage.getItem(TIME_KEY)) {
    setTimestamp(Date.now());
  }

  // Global helper to reset the timer (used by settings modal)
  window.resetWaterTimer = function() {
    setTimestamp(Date.now());
  };

})();
