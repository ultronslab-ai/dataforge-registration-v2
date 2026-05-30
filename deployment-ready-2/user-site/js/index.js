import Api from './api.js';
import CONFIG from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('events-container');
  
  try {
    const events = await Api.getEvents();
    
    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card glass-panel animate-fade-in';
      
      const priceDisplay = !event.is_paid || event.fees === 0 ? 'FREE' : `${CONFIG.CURRENCY_SYMBOL}${event.fees}`;
      
      card.innerHTML = `
        <h3 class="event-title">${event.name}</h3>
        <div class="event-date">📅 ${new Date(event.date_time).toLocaleDateString()}</div>
        <div class="event-desc">${event.description}</div>
        <div class="event-meta">
          <span>👥 Max Team: ${event.team_size}</span>
          <span style="color: var(--accent-green)">🏷️ ${priceDisplay}</span>
        </div>
        <a href="register.html?eventId=${event.id}" class="btn btn-primary" style="text-align: center">Register Now</a>
      `;
      
      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = '<p style="color: var(--error-color)">Failed to load events. System offline.</p>';
  }
});
