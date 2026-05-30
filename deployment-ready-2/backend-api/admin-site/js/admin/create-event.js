import CONFIG from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  const token = localStorage.getItem('dataforge_admin_token');
  if (!token || localStorage.getItem('dataforge_admin_auth') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('dataforge_admin_auth');
    localStorage.removeItem('dataforge_admin_token');
    window.location.href = 'login.html';
  });

  const eventTypeSelect = document.getElementById('eventType');
  const paymentConfig = document.getElementById('paymentConfig');
  const priceInput = document.getElementById('eventPrice');
  const upiInput = document.getElementById('upiId');

  eventTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'true') {
      paymentConfig.classList.remove('hidden');
      priceInput.required = true;
      upiInput.required = true;
    } else {
      paymentConfig.classList.add('hidden');
      priceInput.required = false;
      upiInput.required = false;
    }
  });

  const form = document.getElementById('createEventForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'DEPLOYING...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);

      const response = await fetch(`${CONFIG.API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event.');
      }

      alert('Event deployed successfully. Protocol recorded in databases.');
      window.location.href = 'events.html';
    } catch (err) {
      console.error(err);
      alert(`ERROR: ${err.message}`);
      submitBtn.textContent = 'Initialize Deployment';
      submitBtn.disabled = false;
    }
  });
});
