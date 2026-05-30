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

  // Get ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  if (!eventId) {
    window.location.href = 'events.html';
    return;
  }

  const apiHost = CONFIG.API_BASE_URL.replace('/api', '');

  // UI state
  let currentRegId = null;

  // UI Elements
  const eventTitle = document.getElementById('eventDetailTitle');
  const totalRegVal = document.getElementById('detailTotalReg');
  const pendingRegVal = document.getElementById('detailPendingReg');
  const verifiedRegVal = document.getElementById('detailVerifiedReg');
  const tbody = document.getElementById('registrantsTable');

  const modal = document.getElementById('verifyModal');
  const closeBtn = document.getElementById('closeVerifyModal');
  const verifyTeamName = document.getElementById('verifyTeamName');
  const verifyRegId = document.getElementById('verifyRegId');
  const verifyLeaderDetails = document.getElementById('verifyLeaderDetails');
  const verifyTeamMembers = document.getElementById('verifyTeamMembers');
  const verifyTxnInfo = document.getElementById('verifyTxnInfo');
  const verifyTxnId = document.getElementById('verifyTxnId');
  const verifyUpiRef = document.getElementById('verifyUpiRef');
  const proofContainer = document.getElementById('proof-container');
  const modalProofImg = document.getElementById('modalProofImg');
  const modalProofLink = document.getElementById('modalProofLink');
  const resumeContainer = document.getElementById('resume-container');
  const modalResumeImg = document.getElementById('modalResumeImg');
  const modalResumeLink = document.getElementById('modalResumeLink');
  const rejectionReasonInput = document.getElementById('rejectionReason');

  const approveBtn = document.getElementById('approveBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const closeEventBtn = document.getElementById('closeEventBtn');

  // Load Event Statistics
  async function loadStats() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/admin/events/${eventId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load stats.');

      const { event, stats } = data.data;
      eventTitle.textContent = `Event: ${event.name}`;
      totalRegVal.textContent = stats.total;
      pendingRegVal.textContent = stats.pending;
      verifiedRegVal.textContent = stats.verified;

      if (event.status !== 'Active') {
        closeEventBtn.textContent = 'Event Terminated';
        closeEventBtn.disabled = true;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Load Registrants Table
  async function loadRegistrants() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/registrations/event/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load registrations.');

      tbody.innerHTML = '';
      const registrations = data.data;

      if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No teams registered yet.</td></tr>';
        return;
      }

      registrations.forEach(reg => {
        const leader = reg.team_members.find(m => m.is_leader) || reg.team_members[0] || {};
        
        let badgeClass = 'badge-success';
        if (reg.verification_status === 'pending') badgeClass = 'badge-pending';
        if (reg.verification_status === 'rejected') badgeClass = 'badge-danger';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${reg.registration_id}</td>
          <td style="font-weight: bold; color: var(--text-light);">${reg.team_name}</td>
          <td>
            <div style="font-size: 0.9rem;">${leader.full_name || 'N/A'}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${leader.email || 'N/A'} | ${leader.phone || 'N/A'}</div>
          </td>
          <td><span class="badge ${badgeClass} status-badge">${reg.verification_status.toUpperCase()}</span></td>
          <td>
            <div class="flex gap-1" style="align-items: center; flex-wrap: wrap;">
              <button class="btn review-btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" data-id="${reg.id}">
                ${reg.verification_status === 'pending' ? 'Review' : 'View'}
              </button>
              <button class="btn btn-danger delete-team-btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" data-id="${reg.id}" data-team="${reg.team_name}">Delete</button>
            </div>
          </td>
        `;

        // Store full registration data in dataset for easy modal access
        const reviewBtn = tr.querySelector('.review-btn');
        if (reviewBtn) {
          reviewBtn.dataset.reg = JSON.stringify(reg);
        }

        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--neon-red);">ERROR: ${err.message}</td></tr>`;
    }
  }

  // Init loads
  loadStats();
  loadRegistrants();

  // Modal logic
  function isImagePath(path) {
    return /\.(png|jpe?g|gif|webp)$/i.test(path || '');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function setFilePreview({ path, container, image, link, label }) {
    image.style.display = 'none';
    link.style.display = 'none';
    image.removeAttribute('src');
    link.removeAttribute('href');

    if (!path) {
      container.style.display = 'none';
      return;
    }

    const fileUrl = `${apiHost}${path}`;
    container.style.display = 'block';
    link.href = fileUrl;
    link.textContent = `Open ${label}`;
    link.style.display = 'block';

    if (isImagePath(path)) {
      image.src = fileUrl;
      image.style.display = 'block';
      link.style.marginTop = '0.75rem';
    }
  }

  function memberInfoRow(label, value) {
    return value ? `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>` : '';
  }

  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-team-btn')) {
      const regId = e.target.getAttribute('data-id');
      const teamName = e.target.getAttribute('data-team') || 'this team';
      deleteTeam(regId, teamName);
      return;
    }

    if (e.target.classList.contains('review-btn')) {
      const reg = JSON.parse(e.target.dataset.reg);
      currentRegId = reg.id;

      // Populate Modal Fields
      verifyTeamName.textContent = reg.team_name;
      verifyRegId.textContent = reg.registration_id || '-';
      const leader = reg.team_members.find(m => m.is_leader) || reg.team_members[0] || {};
      const leaderRegNo = leader.student_id ? ` | Reg No: ${leader.student_id}` : '';
      verifyLeaderDetails.textContent = `${leader.full_name} (${leader.email} | ${leader.phone || 'No Phone'}) - College Name and Dept: ${leader.department || 'N/A'}${leaderRegNo}`;
      verifyTeamMembers.innerHTML = reg.team_members.map((member, index) => `
        <div class="member-review-card">
          <div class="member-review-title">${member.is_leader ? 'Captain' : `Member ${index}`}: ${escapeHtml(member.full_name || 'N/A')}</div>
          <div class="member-review-grid">
            ${memberInfoRow('Email', member.email)}
            ${memberInfoRow('Phone', member.phone)}
            ${memberInfoRow('Registration No', member.student_id)}
            ${memberInfoRow('College Name and Dept', member.department)}
            ${memberInfoRow('Year', member.year)}
          </div>
        </div>
      `).join('');

      // Transaction info
      if (reg.transaction_id || reg.upi_reference) {
        verifyTxnId.textContent = reg.transaction_id || 'N/A';
        verifyUpiRef.textContent = reg.upi_reference || 'N/A';
        verifyTxnInfo.style.display = 'block';
      } else {
        verifyTxnInfo.style.display = 'none';
      }

      setFilePreview({
        path: reg.payment_proof_path,
        container: proofContainer,
        image: modalProofImg,
        link: modalProofLink,
        label: 'Payment Proof'
      });
      setFilePreview({
        path: reg.captain_file_path,
        container: resumeContainer,
        image: modalResumeImg,
        link: modalResumeLink,
        label: 'Student ID / Resume'
      });

      rejectionReasonInput.value = '';
      const isPending = reg.verification_status === 'pending';
      approveBtn.style.display = isPending ? 'inline-block' : 'none';
      rejectBtn.style.display = isPending ? 'inline-block' : 'none';
      rejectionReasonInput.disabled = !isPending;
      modal.classList.add('active');
    }
  });

  const closeModal = () => modal.classList.remove('active');
  closeBtn.addEventListener('click', closeModal);

  async function deleteTeam(regId, teamName) {
    if (!confirm(`Delete team "${teamName}" from this event? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/registrations/${regId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete team.');

      const emailStatuses = data.email || [];
      const sentCount = emailStatuses.filter(item => item.status === 'sent').length;
      const loggedCount = emailStatuses.filter(item => item.status === 'logged').length;
      const failedCount = emailStatuses.filter(item => item.status === 'failed').length;
      const firstEmailError = emailStatuses.find(item => item.status === 'failed' && item.error)?.error;
      let message = 'Team registration deleted successfully.';
      if (sentCount > 0) message += ` Cancellation email sent to ${sentCount} team member(s).`;
      if (loggedCount > 0) message += ` Email content saved to easy-mail-log.json for ${loggedCount} team member(s).`;
      if (failedCount > 0) message += ` ${failedCount} cancellation email(s) failed to send.`;
      if (firstEmailError) message += ` Error: ${firstEmailError}`;
      alert(message);
      loadStats();
      loadRegistrants();
    } catch (err) {
      console.error(err);
      alert(`ERROR: ${err.message}`);
    }
  }

  // Approve payment & registration
  approveBtn.addEventListener('click', async () => {
    if (!currentRegId) return;
    approveBtn.textContent = 'VERIFYING...';
    approveBtn.disabled = true;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/registrations/${currentRegId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed.');

      const emailStatuses = data.email || [];
      const sentCount = emailStatuses.filter(item => item.status === 'sent').length;
      const loggedCount = emailStatuses.filter(item => item.status === 'logged').length;
      const failedCount = emailStatuses.filter(item => item.status === 'failed').length;
      const firstEmailError = emailStatuses.find(item => item.status === 'failed' && item.error)?.error;
      let message = 'Registration verified successfully.';
      if (sentCount > 0) message += ` Verification email sent to ${sentCount} team member(s).`;
      if (loggedCount > 0) message += ` Email content saved to easy-mail-log.json for ${loggedCount} team member(s).`;
      if (failedCount > 0) message += ` ${failedCount} email(s) failed to send.`;
      if (firstEmailError) message += ` Error: ${firstEmailError}`;
      alert(message);
      closeModal();
      loadStats();
      loadRegistrants();
    } catch (err) {
      console.error(err);
      alert(`ERROR: ${err.message}`);
    } finally {
      approveBtn.textContent = 'Verify & Authorize';
      approveBtn.disabled = false;
    }
  });

  // Reject payment & registration
  rejectBtn.addEventListener('click', async () => {
    if (!currentRegId) return;
    const reason = rejectionReasonInput.value.trim();
    if (!reason) {
      alert('Please enter a rejection reason.');
      return;
    }

    rejectBtn.textContent = 'REJECTING...';
    rejectBtn.disabled = true;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/registrations/${currentRegId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejection failed.');

      const emailStatuses = data.email || [];
      const sentCount = emailStatuses.filter(item => item.status === 'sent').length;
      const loggedCount = emailStatuses.filter(item => item.status === 'logged').length;
      const failedCount = emailStatuses.filter(item => item.status === 'failed').length;
      const firstEmailError = emailStatuses.find(item => item.status === 'failed' && item.error)?.error;
      let message = 'Registration rejected.';
      if (sentCount > 0) message += ` Notice email sent to ${sentCount} team member(s).`;
      if (loggedCount > 0) message += ` Email content saved to easy-mail-log.json for ${loggedCount} team member(s).`;
      if (failedCount > 0) message += ` ${failedCount} notice email(s) failed to send.`;
      if (firstEmailError) message += ` Error: ${firstEmailError}`;
      alert(message);
      closeModal();
      loadStats();
      loadRegistrants();
    } catch (err) {
      console.error(err);
      alert(`ERROR: ${err.message}`);
    } finally {
      rejectBtn.textContent = 'Reject Artifact';
      rejectBtn.disabled = false;
    }
  });

  // Delete Event and its registrations
  closeEventBtn.addEventListener('click', async () => {
    if (!confirm('Delete this event and all teams registered for it? This cannot be undone.')) {
      return;
    }

    closeEventBtn.textContent = 'DELETING...';
    closeEventBtn.disabled = true;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete event.');

      alert(`Event deleted successfully. Removed ${data.data.deleted_registrations || 0} team registration(s).`);
      window.location.href = 'events.html';
    } catch (err) {
      console.error(err);
      alert(`ERROR: ${err.message}`);
      closeEventBtn.textContent = 'Delete Event';
      closeEventBtn.disabled = false;
    }
  });

});
