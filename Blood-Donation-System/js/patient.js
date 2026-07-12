/* ==========================================================================
   patient.js — Patient dashboard logic: view switching, donor search,
   blood request submission, AI Assistant chatbot.
   Depends on storage.js, validation.js, auth.js
   ========================================================================== */

const patientUser = requireRole('patient');

if(patientUser){

  /* ---------------- Sidebar / view navigation ---------------- */
  const sideNavButtons = document.querySelectorAll('.side-nav button[data-view]');
  const views = document.querySelectorAll('.dash-view');

  function switchView(name){
    views.forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
    sideNavButtons.forEach(b => b.classList.toggle('active', b.dataset.view === name));
    document.getElementById('patientSidebar').classList.remove('open');
    document.getElementById('patientSidebarOverlay').classList.remove('open');
  }
  sideNavButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach(el => el.addEventListener('click', () => switchView(el.dataset.goto)));

  document.getElementById('patientLogoutBtn').addEventListener('click', () => {
    confirmDialog('You will need to log in again to access your dashboard. Continue?', logoutUser, { title:'Log out?', confirmLabel:'Log out' });
  });

  const sidebar = document.getElementById('patientSidebar');
  const overlay = document.getElementById('patientSidebarOverlay');
  document.getElementById('patientTopbarToggle').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('open'); });
  overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });

  function initials(name){ return name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(); }

  /* ---------------- Profile / sidebar ---------------- */
  getCurrentUser().then(user => {
    if(user) {
      document.getElementById('patientSideAvatar').textContent = initials(user.full_name);
      document.getElementById('patientSideName').textContent = user.full_name;
      document.getElementById('patientSideRole').textContent = 'patient';
      document.getElementById('patientHomeName').textContent = user.full_name.split(' ')[0];
    }
  });

  /* ---------------- Requests: home + history tables ---------------- */
  function urgencyBadgeClass(u){ return u.toLowerCase(); }

  function renderMyRequests(){
    apiFetch('/api/patient/my-requests')
    .then(requests => {
      const homeBody = document.getElementById('patientHomeRequestsBody');
      homeBody.innerHTML = requests.length
        ? requests.slice(0,5).map(r => `<tr><td>${r.request_code}</td><td>${r.blood_group}</td><td>${r.hospital}</td><td><span class="badge ${urgencyBadgeClass(r.urgency)}">${r.urgency}</span></td><td><span class="badge ${r.status === 'Open' ? 'open' : 'closed'}">${r.status}</span></td></tr>`).join('')
        : `<tr><td colspan="5" class="empty-state">No requests yet — submit one from the Blood Request tab.</td></tr>`;

      const histBody = document.getElementById('patientMyRequestsBody');
      histBody.innerHTML = requests.length
        ? requests.map(r => `<tr><td>${r.request_code}</td><td>${r.blood_group}</td><td>${r.hospital}</td><td><span class="badge ${urgencyBadgeClass(r.urgency)}">${r.urgency}</span></td><td><span class="badge ${r.status === 'Open' ? 'open' : 'closed'}">${r.status}</span></td></tr>`).join('')
        : `<tr><td colspan="5" class="empty-state">You haven't submitted any requests yet.</td></tr>`;
    })
    .catch(error => {
      console.error('Error loading requests:', error);
      showToast('Failed to load requests.', 'error');
    });
  }
  renderMyRequests();

  /* ---------------- Blood Request form ---------------- */
  document.getElementById('patientRequestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const req = {
      patientName: document.getElementById('patientReqPatientName').value.trim(),
      bloodGroup: document.getElementById('patientReqBloodGroup').value,
      hospital: document.getElementById('patientReqHospital').value.trim(),
      address: document.getElementById('patientReqAddress').value.trim(),
      city: document.getElementById('patientReqCity').value.trim(),
      units: Number(document.getElementById('patientReqUnits').value),
      requiredDate: document.getElementById('patientReqDate').value,
      urgency: document.getElementById('patientReqUrgency').value,
      contact: document.getElementById('patientReqContact').value.trim(),
      notes: document.getElementById('patientReqNotes').value.trim()
    };
    if(!req.patientName || !req.bloodGroup || !req.hospital || !req.city || !req.requiredDate || !req.contact){
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    
    apiFetch('/api/patient/request', {
      method: 'POST',
      body: JSON.stringify(req)
    })
    .then(data => {
      showToast(`Request ${data.request_code} submitted and visible to matching donors.`, 'success');
      e.target.reset();
      document.getElementById('patientReqUrgency').value = 'Medium';
      document.getElementById('patientReqUnits').value = 1;
      renderMyRequests();
      switchView('home');
    })
    .catch(error => {
      showToast(error.message || 'Failed to submit request.', 'error');
    });
  });

  /* ---------------- Find a Donor ---------------- */
  function renderDonors(){
    const bg = document.getElementById('patientFilterBloodGroup').value;
    const city = document.getElementById('patientFilterCity').value.trim();
    const availability = document.getElementById('patientFilterAvailability').value;

    const params = new URLSearchParams();
    if(bg) params.append('bloodGroup', bg);
    if(city) params.append('city', city);
    if(availability) params.append('availability', availability);

    apiFetch(`/api/patient/donors?${params.toString()}`)
    .then(donors => {
      const wrap = document.getElementById('patientDonorResults');
      if(!donors.length){
        wrap.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No donors match those filters yet. Try widening your search.</div>`;
        return;
      }
      wrap.innerHTML = donors.map(d => `
        <div class="donor-card">
          <div class="donor-card-top">
            <div class="avatar">${initials(d.full_name)}</div>
            <span class="bg-tag">${d.blood_group}</span>
          </div>
          <h4>${d.full_name}</h4>
          <span class="badge ${d.availability === 'available' ? 'available' : 'unavailable'}">${d.availability === 'available' ? 'Available' : 'Unavailable'}</span>
          <ul>
            <li>📍 ${d.city || '—'}</li>
            <li>📞 ${d.phone || '—'}</li>
          </ul>
          <button class="btn btn-primary btn-sm btn-block contact-donor-btn" data-phone="${d.phone}" data-name="${d.full_name}">Contact</button>
        </div>`).join('');
    })
    .catch(error => {
      console.error('Error loading donors:', error);
      showToast('Failed to load donors.', 'error');
    });
  }
  renderDonors();
  document.getElementById('patientApplyFilters').addEventListener('click', renderDonors);

  document.getElementById('patientDonorResults').addEventListener('click', (e) => {
    if(e.target.classList.contains('contact-donor-btn')){
      const name = e.target.dataset.name, phone = e.target.dataset.phone;
      confirmDialog(`Reach out to ${name} at ${phone}? This will open your phone's dialer.`, () => {
        showToast(`Calling ${name}…`, 'info');
      }, { title:'Contact donor', confirmLabel:'Call now' });
    }
  });

  /* ---------------- Contact form (demo) ---------------- */
  document.getElementById('patientContactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent to the LifeLink support team.', 'success');
    e.target.reset();
  });

  /* ---------------- FAQ accordion (dashboard contact tab) ---------------- */
  document.querySelectorAll('#patientFaqList .faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('#patientFaqList .faq-item.open').forEach(other => {
        other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ==========================================================================
     AI Assistant — rule-based patient chatbot
     ========================================================================== */
  const patientChatBody = document.getElementById('patientChatBody');
  const patientChatForm = document.getElementById('patientChatForm');
  const patientChatInput = document.getElementById('patientChatInput');
  const patientChatSuggestions = document.getElementById('patientChatSuggestions');

  function addMessage(text, who = 'bot'){
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    patientChatBody.appendChild(div);
    patientChatBody.scrollTop = patientChatBody.scrollHeight;
  }
  function showTyping(){
    const div = document.createElement('div');
    div.className = 'msg bot typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    patientChatBody.appendChild(div);
    patientChatBody.scrollTop = patientChatBody.scrollHeight;
    return div;
  }

  function handlePatientQuestion(text){
    if(!text.trim()) return;
    addMessage(text, 'user');
    patientChatInput.value = '';
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

  patientChatForm.addEventListener('submit', (e) => { e.preventDefault(); handlePatientQuestion(patientChatInput.value); });
  patientChatSuggestions.addEventListener('click', (e) => { if(e.target.tagName === 'BUTTON') handlePatientQuestion(e.target.dataset.q); });

  getCurrentUser().then(user => {
    if(user) {
      addMessage(`Hello ${user.full_name.split(' ')[0]}! I'm your LifeLink Assistant. Ask me about finding donors, plasma, transfusion safety, or blood compatibility.`, 'bot');
    }
  });
}
