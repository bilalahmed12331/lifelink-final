/* ==========================================================================
   admin.js — Admin dashboard logic: authentication, view switching,
   blood requests management, donor/patient information display.
   Depends on storage.js, validation.js
   ========================================================================== */

/* ---------------- Admin Dashboard ---------------- */
const adminSession = DB.getSession();

if(adminSession){

  /* ---------------- Sidebar / view navigation ---------------- */
  const sideNavButtons = document.querySelectorAll('.side-nav button[data-view]');
  const views = document.querySelectorAll('.dash-view');

  function switchView(name){
    views.forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
    sideNavButtons.forEach(b => b.classList.toggle('active', b.dataset.view === name));
    document.getElementById('adminSidebar').classList.remove('open');
    document.getElementById('adminSidebarOverlay').classList.remove('open');
  }
  sideNavButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

  document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    confirmDialog('You will be logged out of the admin panel. Continue?', () => {
      DB.clearSession();
      showToast('Admin logged out successfully.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }, { title:'Log out?', confirmLabel:'Log out' });
  });

  // Mobile sidebar toggle
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('adminSidebarOverlay');
  document.getElementById('adminTopbarToggle').addEventListener('click', () => {
    sidebar.classList.add('open'); overlay.classList.add('open');
  });
  overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });

  /* ---------------- Blood Requests ---------------- */
  function urgencyBadgeClass(u){ return u.toLowerCase(); }

  function renderRequests(){
    apiFetch('/api/requests')
    .then(requests => {
      const body = document.getElementById('adminRequestsBody');

      if(!requests.length){
        body.innerHTML = `<tr><td colspan="8" class="empty-state">No blood requests yet.</td></tr>`;
        return;
      }

      body.innerHTML = requests.map(r => `
        <tr>
          <td>${r.request_code}</td>
          <td>${r.patient_name}</td>
          <td><span class="badge" style="background:var(--red-tint);color:var(--red-dark);font-weight:700;">${r.blood_group}</span></td>
          <td>${r.hospital}</td>
          <td>${r.city}</td>
          <td><span class="badge ${urgencyBadgeClass(r.urgency)}">${r.urgency}</span></td>
          <td><span class="badge ${r.status === 'Open' ? 'open' : 'closed'}">${r.status}</span></td>
          <td>${new Date(r.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    })
    .catch(error => {
      console.error('Error loading requests:', error);
      showToast('Failed to load requests.', 'error');
    });
  }

  /* ---------------- Donors ---------------- */
  function renderDonors(){
    apiFetch('/api/admin/donors')
    .then(donors => {
      const body = document.getElementById('adminDonorsBody');

      if(!donors.length){
        body.innerHTML = `<tr><td colspan="7" class="empty-state">No donors registered yet.</td></tr>`;
        return;
      }

      body.innerHTML = donors.map(d => `
        <tr>
          <td>${d.full_name}</td>
          <td>${d.email}</td>
          <td><span class="badge" style="background:var(--red-tint);color:var(--red-dark);font-weight:700;">${d.blood_group}</span></td>
          <td>${d.city || '—'}</td>
          <td>${d.phone || '—'}</td>
          <td><span class="badge ${d.availability === 'available' ? 'available' : 'unavailable'}">${d.availability === 'available' ? 'Available' : 'Unavailable'}</span></td>
          <td>${d.last_donation ? new Date(d.last_donation).toLocaleDateString() : '—'}</td>
        </tr>
      `).join('');
    })
    .catch(error => {
      console.error('Error loading donors:', error);
      showToast('Failed to load donors.', 'error');
    });
  }

  /* ---------------- Patients ---------------- */
  function renderPatients(){
    apiFetch('/api/admin/patients')
    .then(patients => {
      const body = document.getElementById('adminPatientsBody');

      if(!patients.length){
        body.innerHTML = `<tr><td colspan="6" class="empty-state">No patients registered yet.</td></tr>`;
        return;
      }

      body.innerHTML = patients.map(p => `
        <tr>
          <td>${p.full_name}</td>
          <td>${p.email}</td>
          <td>${p.city || '—'}</td>
          <td>${p.phone || '—'}</td>
          <td>${p.request_count || 0}</td>
          <td>${p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
        </tr>
      `).join('');
    })
    .catch(error => {
      console.error('Error loading patients:', error);
      showToast('Failed to load patients.', 'error');
    });
  }

  /* ---------------- Stats ---------------- */
  function getStats(){
    apiFetch('/api/admin/stats')
    .then(stats => {
      document.getElementById('statTotalRequests').textContent = stats.totalRequests;
      document.getElementById('statOpenRequests').textContent = stats.openRequests;
      document.getElementById('statCriticalRequests').textContent = stats.criticalRequests;
      document.getElementById('statCompletedRequests').textContent = stats.completedRequests;
      document.getElementById('statTotalDonors').textContent = stats.totalDonors;
      document.getElementById('statAvailableDonors').textContent = stats.availableDonors;
      document.getElementById('statUnavailableDonors').textContent = stats.unavailableDonors;
      document.getElementById('statRecentDonors').textContent = stats.newDonorsThisWeek;
      document.getElementById('statTotalPatients').textContent = stats.totalPatients;
      document.getElementById('statActivePatients').textContent = stats.activePatients;
      document.getElementById('statPatientRequests').textContent = stats.totalPatientRequests;
      document.getElementById('statRecentPatients').textContent = stats.newPatientsThisWeek;
    })
    .catch(error => {
      console.error('Error loading stats:', error);
      showToast('Failed to load stats.', 'error');
    });
  }

  /* ---------------- Initial Render ---------------- */
  renderRequests();
  renderDonors();
  renderPatients();
  getStats();

} else if(window.location.pathname.includes('admin-dashboard.html')){
  // Redirect to admin login if not authenticated
  showToast('Please log in to access the admin panel.', 'error');
  setTimeout(() => {
    window.location.href = 'admin-login.html';
  }, 1500);
}
