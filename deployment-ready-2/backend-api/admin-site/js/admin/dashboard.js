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

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard stats.');
    }

    const { stats, recentRegistrations, upcomingEvents, eventStats } = data.data;

    // Populate Stats
    document.getElementById('statEvents').textContent = stats.totalEvents;
    document.getElementById('statRegistrations').textContent = stats.totalRegistrations;
    document.getElementById('statPending').textContent = stats.pendingVerifications;
    document.getElementById('statRevenue').textContent = `${CONFIG.CURRENCY_SYMBOL}${stats.totalRevenue}`;

    // Populate Table (Recent registrations)
    // Wait! dashboard.html has a table for "Recent Network Activity". The table headers are:
    // Event ID | Status | Registrations | Action
    // But we can show the recent registrations in this table:
    // Team Name | Event | Payment Status | Action
    // Let's modify dashboard.html's table headers or map to it.
    // Let's see the dashboard.html table headers:
    // <th>Event ID</th><th>Status</th><th>Registrations</th><th>Action</th>
    // We can map this to show the upcoming events, or the recent registrations!
    // Since recentEventsTable is the ID, let's map it to upcomingEvents or eventStats.
    // Let's map it to show the event stats summary:
    // Event Name | Status | Registrations | Action
    const tableBody = document.getElementById('recentEventsTable');
    tableBody.innerHTML = '';
    
    upcomingEvents.forEach(evt => {
      const statusBadge = evt.status === 'Active' ? '<span class="badge badge-success">ACTIVE</span>' : '<span class="badge badge-danger">INACTIVE</span>';
      const tr = document.createElement('tr');
      // We will show Event Name in the first column, status, date, and inspect action
      tr.innerHTML = `
        <td style="font-weight: bold; color: var(--text-light);">${evt.name}</td>
        <td>${statusBadge}</td>
        <td>${new Date(evt.date_time).toLocaleDateString()}</td>
        <td><a href="event-detail.html?id=${evt.id}" class="btn" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Inspect</a></td>
      `;
      tableBody.appendChild(tr);
    });

    // Chart.js Setup
    if (eventStats && eventStats.length > 0) {
      const ctx = document.getElementById('registrationChart').getContext('2d');
      
      // Neon Cyberpunk styling for chart
      Chart.defaults.color = '#888888';
      Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: eventStats.map(s => s.event.length > 15 ? s.event.substring(0, 15) + '...' : s.event),
          datasets: [
            {
              label: 'Verified',
              data: eventStats.map(s => s.verified),
              backgroundColor: '#00ff88',
              borderWidth: 0
            },
            {
              label: 'Pending',
              data: eventStats.map(s => s.pending),
              backgroundColor: '#ffaa00',
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, labels: { color: '#888' } }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { stepSize: 1 }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      });
    }

  } catch (err) {
    console.error(err);
    alert(`ERROR: ${err.message}`);
  }
});
