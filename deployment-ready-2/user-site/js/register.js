import Api from './api.js';
import CONFIG from './config.js';
import Validator from './utils/validator.js';
import Toast from './utils/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');
  
  if (!eventId) {
    window.location.href = 'index.html';
    return;
  }

  let eventData = null;
  let membersCount = 0;

  // UI Elements
  const form = document.getElementById('registration-form');
  const titleDisplay = document.getElementById('event-title-display');
  const descDisplay = document.getElementById('event-desc-display');
  const eventIdInput = document.getElementById('event-id');
  const addMemberBtn = document.getElementById('add-member-btn');
  const membersList = document.getElementById('members-list');
  const teamContainer = document.getElementById('team-members-container');
  const maxTeamDisplay = document.getElementById('max-team-display');
  
  const paymentSection = document.getElementById('payment-section');
  const basePriceEl = document.getElementById('base-price');
  const totalPriceEl = document.getElementById('total-price');
  const memberCountDisplay = document.getElementById('member-count-display');
  const submitBtn = document.getElementById('submit-btn');

  try {
    eventData = await Api.getEvent(eventId);
    if (!eventData) throw new Error('Event not found');
    
    titleDisplay.textContent = `Register: ${eventData.name}`;
    descDisplay.innerHTML = eventData.description; // description can have HTML tags
    eventIdInput.value = eventData.id;
    maxTeamDisplay.textContent = eventData.team_size;
    
    if (eventData.team_size > 1) {
      teamContainer.style.display = 'block';
    }
    
    if (eventData.is_paid) {
      paymentSection.style.display = 'block';
      const uId = document.getElementById('upi-id-display');
      const note = document.getElementById('payment-note-display');
      const qr = document.getElementById('qr-code-img');
      const upiContainer = document.getElementById('upi-container');

      if (eventData.upi_id) {
        uId.textContent = eventData.upi_id;
        upiContainer.style.display = 'block';
      }
      if (eventData.payment_note) {
        note.textContent = eventData.payment_note;
      }
      if (eventData.qr_code_path) {
        const apiHost = CONFIG.API_BASE_URL.replace('/api', '');
        qr.src = `${apiHost}${eventData.qr_code_path}`;
        qr.style.display = 'inline-block';
      }

      document.getElementById('transaction-id').setAttribute('required', 'true');
      document.getElementById('payment-proof-file').setAttribute('required', 'true');
    }
    
    updatePricing();
  } catch (err) {
    console.error(err);
    Toast.error('Failed to load event data.');
  }

  function updatePricing() {
    if (!eventData) return;
    
    const basePrice = eventData.fees || 0;
    const total = basePrice; // Flat registration fee per team
    
    basePriceEl.textContent = `${CONFIG.CURRENCY_SYMBOL}${basePrice}`;
    totalPriceEl.textContent = `${CONFIG.CURRENCY_SYMBOL}${total}`;
    memberCountDisplay.textContent = membersCount;
  }

  addMemberBtn.addEventListener('click', () => {
    if (membersCount >= eventData.team_size - 1) {
      Toast.error(`Maximum team size is ${eventData.team_size}`);
      return;
    }
    
    const memberId = Date.now();
    const div = document.createElement('div');
    div.className = 'member-card animate-fade-in';
    div.id = `member-${memberId}`;
    
    div.innerHTML = `
      <button type="button" class="remove-member-btn" data-id="${memberId}">×</button>
      <h4>Member ${membersCount + 1}</h4>
      <div class="grid-2-col">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="member_${memberId}_name" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="member_${memberId}_email" required>
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>Registration Number (Optional)</label>
          <input type="text" name="member_${memberId}_reg_no" placeholder="RA2311003010001">
        </div>
      </div>
    `;
    
    membersList.appendChild(div);
    membersCount++;
    updatePricing();
    
    if (membersCount >= eventData.team_size - 1) {
      addMemberBtn.style.display = 'none';
    }
  });

  membersList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-member-btn')) {
      const id = e.target.getAttribute('data-id');
      document.getElementById(`member-${id}`).remove();
      membersCount--;
      updatePricing();
      addMemberBtn.style.display = 'inline-block';
      
      // Update numbering
      const cards = membersList.querySelectorAll('.member-card h4');
      cards.forEach((h4, idx) => {
        h4.textContent = `Member ${idx + 1}`;
      });
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { isValid, errors } = Validator.validateForm(form);
    
    if (!isValid) {
      Toast.error('Please fill all required fields correctly.');
      return;
    }

    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('event_id', eventData.id);
      formData.append('team_name', form.querySelector('[name="teamName"]').value);

      // Build team members array
      const members = [];
      // 1. Add captain (leader)
      members.push({
        full_name: form.querySelector('[name="captainName"]').value,
        student_id: form.querySelector('[name="captainRegNo"]').value.trim(),
        email: form.querySelector('[name="captainEmail"]').value,
        phone: form.querySelector('[name="captainPhone"]').value,
        department: form.querySelector('[name="captainOrg"]').value,
        year: '1', // default/dummy since not collected explicitly
        is_leader: true
      });

      // 2. Add extra members
      const memberCards = membersList.querySelectorAll('.member-card');
      memberCards.forEach((card) => {
        const nameInput = card.querySelector('input[name^="member_"][name$="_name"]');
        const emailInput = card.querySelector('input[name^="member_"][name$="_email"]');
        const regNoInput = card.querySelector('input[name^="member_"][name$="_reg_no"]');
        members.push({
          full_name: nameInput.value,
          student_id: regNoInput.value.trim(),
          email: emailInput.value,
          phone: '',
          department: '',
          year: '1',
          is_leader: false
        });
      });

      formData.append('team_members', JSON.stringify(members));

      // Append files
      const captainFileInput = form.querySelector('[name="captainFile"]');
      if (captainFileInput && captainFileInput.files[0]) {
        formData.append('captainFile', captainFileInput.files[0]);
      }

      if (eventData.is_paid) {
        formData.append('transaction_id', document.getElementById('transaction-id').value);
        const proofInput = document.getElementById('payment-proof-file');
        if (proofInput && proofInput.files[0]) {
          formData.append('payment_proof', proofInput.files[0]);
        }
      }

      const res = await Api.register(formData);
      
      if (res.success) {
        // Save minimal data to session storage to show on confirmation page
        sessionStorage.setItem('conf_ticket', res.data.registration_id);
        sessionStorage.setItem('conf_event_id', res.data.event_id || eventData.id);
        sessionStorage.setItem('conf_event', res.data.event_name);
        sessionStorage.setItem('conf_event_date', res.data.event_date || eventData.date_time || '');
        sessionStorage.setItem('conf_event_venue', res.data.event_venue || eventData.venue || '');
        sessionStorage.setItem('conf_event_desc', (res.data.event_description || descDisplay.textContent).replace(/<[^>]*>/g, '').trim());
        sessionStorage.setItem('conf_team', form.querySelector('[name="teamName"]').value);
        sessionStorage.setItem('conf_members', JSON.stringify(members));
        sessionStorage.setItem('conf_name', members[0].full_name);
        sessionStorage.setItem('conf_email', members[0].email);
        
        window.location.href = 'confirmation.html';
      }
    } catch (err) {
      console.error(err);
      Toast.error(err.message || 'Registration failed. Try again.');
      submitBtn.textContent = 'Complete Registration';
      submitBtn.disabled = false;
    }
  });
});
