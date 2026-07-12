/* ==========================================================================
   donor.js — Donor dashboard logic: view switching, profile summary,
   donate form, donation history, AI Assistant chatbot.
   Depends on storage.js, validation.js, auth.js
   ========================================================================== */

const donorUser = requireRole('donor');

if(donorUser){

  /* ---------------- Sidebar / view navigation ---------------- */
  const sideNavButtons = document.querySelectorAll('.side-nav button[data-view]');
  const views = document.querySelectorAll('.dash-view');

  function switchView(name){
    views.forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
    sideNavButtons.forEach(b => b.classList.toggle('active', b.dataset.view === name));
    document.getElementById('donorSidebar').classList.remove('open');
    document.getElementById('donorSidebarOverlay').classList.remove('open');
  }
  sideNavButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach(el => el.addEventListener('click', () => switchView(el.dataset.goto)));

  document.getElementById('donorLogoutBtn').addEventListener('click', () => {
    confirmDialog('You will need to log in again to access your dashboard. Continue?', logoutUser, { title:'Log out?', confirmLabel:'Log out' });
  });

  // Mobile sidebar toggle
  const sidebar = document.getElementById('donorSidebar');
  const overlay = document.getElementById('donorSidebarOverlay');
  document.getElementById('donorTopbarToggle').addEventListener('click', () => {
    sidebar.classList.add('open'); overlay.classList.add('open');
  });
  overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });

  /* ---------------- Populate sidebar & home ---------------- */
  function initials(name){ return name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(); }

  function renderProfile(){
    apiFetch('/api/donor/dashboard')
    .then(data => {
      const u = data.user;
      document.getElementById('donorSideAvatar').textContent = initials(u.full_name);
      document.getElementById('donorSideName').textContent = u.full_name;
      document.getElementById('donorSideRole').textContent = 'donor';
      document.getElementById('donorHomeName').textContent = u.full_name.split(' ')[0];

      document.getElementById('statBloodGroup').textContent = u.blood_group;
      document.getElementById('statAvailability').textContent = u.availability === 'available' ? 'Available' : 'Unavailable';
      document.getElementById('statLastDonation').textContent = u.last_donation ? new Date(u.last_donation).toLocaleDateString() : '—';

      document.getElementById('statEligible').textContent = u.daysUntilEligible === 0 ? 'Now' : u.daysUntilEligible;

      const history = data.donationHistory || [];
      const body = document.getElementById('recentActivityBody');
      if(history.length){
        body.innerHTML = history.map(h => `<tr><td>${new Date(h.donation_date).toLocaleDateString()}</td><td>Blood donation</td><td>${h.location}</td><td><span class="badge available">Completed</span></td></tr>`).join('');
      } else {
        body.innerHTML = `<tr><td colspan="4" class="empty-state">No recent activity yet — your next donation will show up here.</td></tr>`;
      }

      document.getElementById('donorDonateBloodGroup').value = u.blood_group;
      document.getElementById('donorDonateLocation').value = u.city || '';
      document.getElementById('donorDonatePhone').value = u.phone || '';
      document.getElementById('donorDonateLastDate').value = u.last_donation || '';
      document.getElementById('donorDonateAvailability').value = u.availability || 'available';
      document.getElementById('donorDonateMedical').value = u.medical_notes || '';
      document.getElementById('donorAvailabilityBadge').textContent = u.availability === 'available' ? 'Available' : 'Unavailable';
      document.getElementById('donorAvailabilityBadge').className = 'badge ' + (u.availability === 'available' ? 'available' : 'unavailable');

      const histBody = document.getElementById('donorDonationHistoryBody');
      histBody.innerHTML = history.length
        ? history.map(h => `<tr><td>${new Date(h.donation_date).toLocaleDateString()}</td><td>${h.location}</td></tr>`).join('')
        : `<tr><td colspan="2" class="empty-state">No donation history recorded yet.</td></tr>`;
    })
    .catch(error => {
      console.error('Error loading dashboard:', error);
      showToast('Failed to load dashboard data.', 'error');
    });
  }
  renderProfile();

  /* ---------------- Donate form ---------------- */
  document.getElementById('donorDonateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const lastDate = document.getElementById('donorDonateLastDate').value;
    const donationData = {
      bloodGroup: document.getElementById('donorDonateBloodGroup').value,
      city: document.getElementById('donorDonateLocation').value,
      phone: document.getElementById('donorDonatePhone').value,
      lastDonation: lastDate,
      availability: document.getElementById('donorDonateAvailability').value,
      medicalNotes: document.getElementById('donorDonateMedical').value
    };
    
    apiFetch('/api/donor/donation-info', {
      method: 'PUT',
      body: JSON.stringify(donationData)
    })
    .then(data => {
      showToast('Donation information saved.', 'success');
      renderProfile();
    })
    .catch(error => {
      showToast(error.message || 'Failed to save donation information.', 'error');
    });
  });

  document.getElementById('donorUpdateStatusBtn').addEventListener('click', () => {
    apiFetch('/api/donor/availability', {
      method: 'PUT'
    })
    .then(data => {
      showToast(`Status updated to ${data.availability}.`, 'success');
      renderProfile();
    })
    .catch(error => {
      showToast(error.message || 'Failed to update status.', 'error');
    });
  });

  /* ---------------- Contact form (demo) ---------------- */
  document.getElementById('donorContactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent to the LifeLink support team.', 'success');
    e.target.reset();
  });

  /* ==========================================================================
     AI Assistant — rule-based donor chatbot
     ========================================================================== */
  const donorChatBody = document.getElementById('donorChatBody');
  const donorChatForm = document.getElementById('donorChatForm');
  const donorChatInput = document.getElementById('donorChatInput');
  const donorChatSuggestions = document.getElementById('donorChatSuggestions');

  function addMessage(text, who = 'bot'){
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    donorChatBody.appendChild(div);
    donorChatBody.scrollTop = donorChatBody.scrollHeight;
  }

  function showTyping(){
    const div = document.createElement('div');
    div.className = 'msg bot typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    donorChatBody.appendChild(div);
    donorChatBody.scrollTop = donorChatBody.scrollHeight;
    return div;
  }

  function handleDonorQuestion(text){
    if(!text.trim()) return;
    addMessage(text, 'user');
    donorChatInput.value = '';
    const typingEl = showTyping();
    
    apiFetch('/api/chatbot/reply', {
      method: 'POST',
      body: JSON.stringify({ message: text })
    })
    .then(data => {
      typingEl.remove();
      addMessage(data.reply, 'bot');
    })
    .catch(error => {
      typingEl.remove();
      addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    });
  }

  donorChatForm.addEventListener('submit', (e) => { e.preventDefault(); handleDonorQuestion(donorChatInput.value); });
  donorChatSuggestions.addEventListener('click', (e) => {
    if(e.target.tagName === 'BUTTON') handleDonorQuestion(e.target.dataset.q);
  });

  // Greeting
  getCurrentUser().then(user => {
    if(user) {
      addMessage(`Hello ${user.full_name.split(' ')[0]}! I'm your LifeLink Assistant. Ask me about eligibility, timing, nutrition, or donation benefits.`, 'bot');
    }
  });
}
