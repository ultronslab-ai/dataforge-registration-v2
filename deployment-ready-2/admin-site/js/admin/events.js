import CONFIG from '../config.js';

document.addEventListener('DOMContentLoaded', async () => {
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

  const tbody = document.getElementById('eventsListTable');

  async function loadEvents() {
    try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/events/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch events.');
    }

    const events = data.data;
    tbody.innerHTML = '';

    if (events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted)">No events found. Deploy a new event protocol above.</td></tr>';
      return;
    }

    events.forEach(evt => {
      const statusClass = evt.status === 'Active' ? 'badge-success' : 'badge-danger';
      const typeDisplay = evt.is_paid ? 'Paid' : 'Free';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: bold; color: var(--text-light);">${evt.name}</td>
        <td>${new Date(evt.date_time).toLocaleDateString()}</td>
        <td>${typeDisplay}</td>
        <td>${evt.registrations_count || 0}</td>
        <td><span class="badge ${statusClass}">${evt.status.toUpperCase()}</span></td>
        <td>
          <a href="event-detail.html?id=${evt.id}" class="btn" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Manage</a>
          <button class="btn btn-danger delete-event-btn" data-id="${evt.id}" data-name="${evt.name}" style="padding: 0.25rem 0.75rem; font-size: 0.8rem; margin-left: 0.35rem;">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--neon-red)">ERROR: ${err.message}</td></tr>`;
  }
  }

  tbody.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('delete-event-btn')) return;

    const eventId = e.target.getAttribute('data-id');
    const eventName = e.target.getAttribute('data-name') || 'this event';
    if (!confirm(`Delete "${eventName}" and all teams registered for it? This cannot be undone.`)) {
      return;
    }

    e.target.textContent = 'Deleting...';
    e.target.disabled = true;

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete event.');

      alert(`Event deleted. Removed ${data.data.deleted_registrations || 0} team registration(s).`);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert(`ERROR: ${err.message}`);
      e.target.textContent = 'Delete';
      e.target.disabled = false;
    }
  });

  loadEvents();
});
