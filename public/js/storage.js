/* ==========================================================================
   storage.js — JWT token management + shared UI utilities
   (Toasts, confirm modal). Loaded on every page, first.
   ========================================================================== */

/* ---------------- JWT Token Management ---------------- */
const DB = {
  getSession(){ return localStorage.getItem('lifelink_token') || null; },
  setSession(token){ localStorage.setItem('lifelink_token', token); },
  clearSession(){ localStorage.removeItem('lifelink_token'); }
};

/* ---------------- Toast notifications ---------------- */
function showToast(message, type = 'info', duration = 3400){
  let wrap = document.getElementById('toast-container');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.id = 'toast-container';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => { el.style.transition='opacity .3s ease'; el.style.opacity='0'; setTimeout(()=>el.remove(), 300); }, duration);
}

/* ---------------- Confirmation modal ---------------- */
function confirmDialog(message, onConfirm, opts = {}){
  let overlay = document.getElementById('confirm-overlay');
  if(overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>${opts.title || 'Please confirm'}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="confirmCancel">Cancel</button>
        <button class="btn btn-primary" id="confirmOk">${opts.confirmLabel || 'Confirm'}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirmCancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });
  overlay.querySelector('#confirmOk').onclick = () => { overlay.remove(); onConfirm(); };
}

/* ---------------- Simple id helper ---------------- */
function uid(prefix='ID'){ return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random()*900+100)}`; }
