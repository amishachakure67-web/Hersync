(function () {
  'use strict';

  // Clear active user session on login/landing page load
  localStorage.removeItem('hersync_username');

  const loginView = document.getElementById('login-view');
  const signupView = document.getElementById('signup-view');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const toast = document.getElementById('toast');

  /* ---- View Switching ---- */

  document.querySelectorAll('[data-switch]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-switch');
      switchView(target);
    });
  });

  function switchView(view) {
    clearAllErrors();

    if (view === 'signup') {
      loginView.classList.remove('active');
      signupView.classList.add('active');
    } else {
      signupView.classList.remove('active');
      loginView.classList.add('active');
    }
  }

  /* ---- Password Toggle ---- */

  document.querySelectorAll('.toggle-password').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var inputId = btn.getAttribute('data-target');
      var input = document.getElementById(inputId);
      var eyeOpen = btn.querySelector('.eye-open');
      var eyeClosed = btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
        btn.setAttribute('aria-label', 'Show password');
      }
    });
  });

  /* ---- Validation Helpers ---- */

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(errorId);
    input.classList.add('error');
    error.textContent = message;
    error.classList.add('visible');
  }

  function clearError(inputId, errorId) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(errorId);
    input.classList.remove('error');
    error.textContent = '';
    error.classList.remove('visible');
  }

  function clearAllErrors() {
    document.querySelectorAll('.form-input').forEach(function (input) {
      input.classList.remove('error');
    });
    document.querySelectorAll('.error-msg').forEach(function (msg) {
      msg.textContent = '';
      msg.classList.remove('visible');
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3000);
  }

  function simulateSubmit(btn, callback) {
    btn.classList.add('loading');
    btn.textContent = 'Please wait…';
    setTimeout(function () {
      btn.classList.remove('loading');
      callback();
    }, 1200);
  }

  /* ---- Real-time validation on blur ---- */

  document.querySelectorAll('.form-input').forEach(function (input) {
    input.addEventListener('blur', function () {
      validateField(input);
    });

    input.addEventListener('input', function () {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
  });

  function validateField(input) {
    var id = input.id;
    var errorId = id + '-error';

    switch (id) {
      case 'login-email':
      case 'signup-email':
        if (!input.value.trim()) {
          showError(id, errorId, 'Email is required');
          return false;
        }
        if (!isValidEmail(input.value.trim())) {
          showError(id, errorId, 'Please enter a valid email');
          return false;
        }
        clearError(id, errorId);
        return true;

      case 'login-password':
        if (!input.value) {
          showError(id, errorId, 'Password is required');
          return false;
        }
        if (input.value.length < 6) {
          showError(id, errorId, 'Password must be at least 6 characters');
          return false;
        }
        clearError(id, errorId);
        return true;

      case 'signup-name':
        if (!input.value.trim()) {
          showError(id, errorId, 'Full name is required');
          return false;
        }
        if (input.value.trim().length < 2) {
          showError(id, errorId, 'Name must be at least 2 characters');
          return false;
        }
        clearError(id, errorId);
        return true;

      case 'signup-password':
        if (!input.value) {
          showError(id, errorId, 'Password is required');
          return false;
        }
        if (input.value.length < 8) {
          showError(id, errorId, 'Password must be at least 8 characters');
          return false;
        }
        clearError(id, errorId);
        return true;

      case 'signup-confirm':
        var password = document.getElementById('signup-password').value;
        if (!input.value) {
          showError(id, errorId, 'Please confirm your password');
          return false;
        }
        if (input.value !== password) {
          showError(id, errorId, 'Passwords do not match');
          return false;
        }
        clearError(id, errorId);
        return true;

      default:
        return true;
    }
  }

  /* ---- Login Form Submit ---- */

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var emailInput = document.getElementById('login-email');
    var emailValid = validateField(emailInput);
    var passwordValid = validateField(document.getElementById('login-password'));

    if (!emailValid || !passwordValid) return;

    var btn = loginForm.querySelector('.btn-primary');
    var originalText = btn.textContent;

    simulateSubmit(btn, function () {
      btn.textContent = originalText;

      var email = emailInput.value.trim();
      var users = JSON.parse(localStorage.getItem('hersync_registered_users') || '{}');
      var name = users[email.toLowerCase()];
      if (!name) {
        var namePart = email.split('@')[0];
        name = namePart.split(/[._-]/).map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
      }
      localStorage.setItem('hersync_username', name);

      window.location.href = 'dashboard.html';
    });
  });

  /* ---- Signup Form Submit ---- */

  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = ['signup-name', 'signup-email', 'signup-password', 'signup-confirm'];
    var allValid = fields.every(function (id) {
      return validateField(document.getElementById(id));
    });

    if (!allValid) return;

    var btn = signupForm.querySelector('.btn-primary');
    var originalText = btn.textContent;

    simulateSubmit(btn, function () {
      btn.textContent = originalText;

      var name = document.getElementById('signup-name').value.trim();
      var email = document.getElementById('signup-email').value.trim();

      var users = JSON.parse(localStorage.getItem('hersync_registered_users') || '{}');
      users[email.toLowerCase()] = name;
      localStorage.setItem('hersync_registered_users', JSON.stringify(users));

      signupForm.reset();
      document.getElementById('login-email').value = email;
      showToast('Registration successful! Please sign in.');
      switchView('login');
    });
  });


})();
