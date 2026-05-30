import PdfExport from './utils/pdfExport.js';
import Api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const ticketId = sessionStorage.getItem('conf_ticket');
  const eventId = sessionStorage.getItem('conf_event_id');
  const eventName = sessionStorage.getItem('conf_event');
  let eventDate = sessionStorage.getItem('conf_event_date');
  let eventVenue = sessionStorage.getItem('conf_event_venue');
  let eventDesc = sessionStorage.getItem('conf_event_desc');
  const teamName = sessionStorage.getItem('conf_team');
  const members = JSON.parse(sessionStorage.getItem('conf_members') || '[]');
  const name = sessionStorage.getItem('conf_name');
  const email = sessionStorage.getItem('conf_email');
  
  if (!ticketId) {
    window.location.href = 'index.html';
    return;
  }

  if (!eventDate || !eventVenue) {
    try {
      const event = eventId
        ? await Api.getEvent(eventId)
        : (await Api.getEvents()).find(item => item.name?.trim() === eventName?.trim());

      if (!event) throw new Error('Event not found for ticket details');

      eventDate = event.date_time || eventDate;
      eventVenue = event.venue || eventVenue;
      eventDesc = event.description
        ? event.description.replace(/<[^>]*>/g, '').trim()
        : eventDesc;
      sessionStorage.setItem('conf_event_date', eventDate || '');
      sessionStorage.setItem('conf_event_venue', eventVenue || '');
      sessionStorage.setItem('conf_event_desc', eventDesc || '');
    } catch (err) {
      console.error('Failed to refresh event details for ticket:', err);
    }
  }

  function formatEventDateTime(value) {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
  }
  
  document.getElementById('conf-ticket-id').textContent = ticketId;
  document.getElementById('conf-event-name').textContent = eventName;
  document.getElementById('conf-event-hero').textContent = eventName;
  document.getElementById('conf-event-date').textContent = formatEventDateTime(eventDate);
  document.getElementById('conf-event-venue').textContent = eventVenue || '-';
  document.getElementById('conf-event-desc').textContent = eventDesc || 'Event details will be shared by the organizing team.';
  document.getElementById('conf-team-name').textContent = teamName || '-';
  document.getElementById('conf-name').textContent = name;
  document.getElementById('conf-email').textContent = email;
  document.getElementById('conf-team-summary').textContent =
    `${teamName || 'Your team'} has ${members.length || 1} registered participant${(members.length || 1) === 1 ? '' : 's'} for ${eventName}. Keep this ticket ID ready at the venue.`;

  const membersList = document.getElementById('conf-team-members');
  membersList.innerHTML = '';
  members.forEach((member, index) => {
    const li = document.createElement('li');
    const role = member.is_leader ? 'Captain' : `Member ${index}`;
    const studentId = member.student_id ? ` | ID: ${member.student_id}` : '';
    li.textContent = `${role}: ${member.full_name || '-'} | ${member.email || '-'}${studentId}`;
    membersList.appendChild(li);
  });
  
  document.getElementById('print-btn').addEventListener('click', () => {
    // Hide buttons during print
    const printBtn = document.getElementById('print-btn');
    const returnBtn = document.querySelector('a.btn-primary');
    
    printBtn.style.display = 'none';
    returnBtn.style.display = 'none';
    
    PdfExport.exportElement('ticket-container', 'ticket.pdf');
    
    setTimeout(() => {
      printBtn.style.display = 'inline-block';
      returnBtn.style.display = 'inline-block';
    }, 1000);
  });
});
