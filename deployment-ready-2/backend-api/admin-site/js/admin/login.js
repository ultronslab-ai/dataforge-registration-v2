import CONFIG from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('adminLoginForm');
  const errorMsg = document.getElementById('loginError');
  const submitBtn = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    submitBtn.textContent = 'AUTHORIZING...';
    submitBtn.disabled = true;
    errorMsg.classList.add('hidden');

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Access denied.');
      }

      // Save token and state
      localStorage.setItem('dataforge_admin_token', data.token);
      localStorage.setItem('dataforge_admin_auth', 'true');
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error(err);
      errorMsg.textContent = `ACCESS DENIED: ${err.message}`;
      errorMsg.classList.remove('hidden');
      submitBtn.textContent = 'ACCESS SYSTEM';
      submitBtn.disabled = false;
    }
  });

  // Check if already logged in
  if (localStorage.getItem('dataforge_admin_auth') === 'true') {
    window.location.href = 'dashboard.html';
  }
});
