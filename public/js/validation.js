/* ==========================================================================
   validation.js — reusable form validation helpers
   ========================================================================== */

const Validate = {
  required(value){ return String(value || '').trim().length > 0; },

  email(value){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()); },

  phone(value){ return /^[0-9+\-\s()]{7,15}$/.test(String(value || '').trim()); },

  // At least 8 chars, one uppercase, one lowercase, one number
  passwordStrength(value){
    const v = String(value || '');
    return {
      length: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      number: /[0-9]/.test(v),
      pass(){ return this.length && this.upper && this.lower && this.number; }
    };
  },

  passwordsMatch(a, b){ return a === b && a.length > 0; },

  showError(inputEl, message){
    clearError(inputEl);
    const field = inputEl.closest('.field') || inputEl.parentElement;
    field.classList.add('has-error');
    const err = document.createElement('small');
    err.className = 'field-error';
    err.textContent = message;
    field.appendChild(err);
  }
};

function clearError(inputEl){
  const field = inputEl.closest('.field') || inputEl.parentElement;
  field.classList.remove('has-error');
  const existing = field.querySelector('.field-error');
  if(existing) existing.remove();
}

function clearAllErrors(form){
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  form.querySelectorAll('.has-error').forEach(e => e.classList.remove('has-error'));
}
