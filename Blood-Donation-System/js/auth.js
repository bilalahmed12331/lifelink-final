/* ==========================================================================
   auth.js — Registration, login, session management, logout,
   role-based redirects. Depends on storage.js + validation.js.
   ========================================================================== */

/* ---------------- Session helpers (shared with donor.js / patient.js) ---------------- */
async function getCurrentUser(){
  try {
    return await apiFetch('/api/auth/profile');
  } catch (error) {
    return null;
  }
}

async function requireRole(role){
  const user = await getCurrentUser();
  if(!user){ window.location.href = 'login.html'; return null; }
  if(user.role !== role){
    window.location.href = user.role === 'donor' ? 'donor-dashboard.html' : 'patient-dashboard.html';
    return null;
  }
  return user;
}

function logoutUser(){
  DB.clearSession();
  window.location.href = 'login.html';
}

/* ---------------- Password show/hide toggles (any page) ---------------- */
document.addEventListener('click', (e) => {
  if(e.target.classList.contains('pw-toggle')){
    const targetId = e.target.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if(!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    e.target.textContent = show ? 'Hide' : 'Show';
  }
});

/* ---------------- Password strength meter (signup page) ---------------- */
const pwField = document.getElementById('password');
if(pwField){
  pwField.addEventListener('input', () => {
    const meter = document.getElementById('strengthMeter');
    const s = Validate.passwordStrength(pwField.value);
    const score = [s.length, s.upper, s.lower, s.number].filter(Boolean).length;
    meter.className = 'strength-meter s' + score;
  });
}

/* ==========================================================================
   SIGN UP
   ========================================================================== */
const signupForm = document.getElementById('signupForm');
if(signupForm){
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors(signupForm);

    const role = signupForm.querySelector('input[name="role"]:checked').value;
    const fullName = document.getElementById('fullName');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const phone = document.getElementById('phone');
    const dob = document.getElementById('dob');
    const address = document.getElementById('address');
    const bloodGroup = document.getElementById('bloodGroup');
    const gender = document.getElementById('gender');

    let valid = true;

    [fullName, username, address].forEach(f => {
      if(!Validate.required(f.value)){ Validate.showError(f, 'This field is required.'); valid = false; }
    });

    if(!Validate.required(email.value)){ Validate.showError(email, 'Email is required.'); valid = false; }
    else if(!Validate.email(email.value)){ Validate.showError(email, 'Enter a valid email address.'); valid = false; }

    if(!Validate.required(phone.value)){ Validate.showError(phone, 'Phone number is required.'); valid = false; }
    else if(!Validate.phone(phone.value)){ Validate.showError(phone, 'Enter a valid phone number.'); valid = false; }

    if(!Validate.required(dob.value)){ Validate.showError(dob, 'Date of birth is required.'); valid = false; }
    if(!Validate.required(bloodGroup.value)){ Validate.showError(bloodGroup, 'Please select a blood group.'); valid = false; }
    if(!Validate.required(gender.value)){ Validate.showError(gender, 'Please select a gender.'); valid = false; }

    const strength = Validate.passwordStrength(password.value);
    if(!Validate.required(password.value)){ Validate.showError(password, 'Password is required.'); valid = false; }
    else if(!strength.pass()){ Validate.showError(password, 'Password must be 8+ chars with upper, lower and a number.'); valid = false; }

    if(!Validate.passwordsMatch(password.value, confirmPassword.value)){
      Validate.showError(confirmPassword, 'Passwords do not match.'); valid = false;
    }

    if(!valid){
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    const userData = {
      fullName: fullName.value.trim(),
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      phone: phone.value.trim(),
      dob: dob.value,
      address: address.value.trim(),
      bloodGroup: bloodGroup.value,
      gender: gender.value,
      role: role,
      city: address.value.split(',').pop().trim() || 'Unknown'
    };

    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, false)
    .then(data => {
      DB.setSession(data.token);
      showToast('Account created! Redirecting to your dashboard…', 'success');
      setTimeout(() => {
        window.location.href = data.user.role === 'donor' ? 'donor-dashboard.html' : 'patient-dashboard.html';
      }, 900);
    })
    .catch(error => {
      showToast(error.message || 'Registration failed. Please try again.', 'error');
    });
  });
}

/* ==========================================================================
   LOGIN
   ========================================================================== */
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors(loginForm);

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    let valid = true;

    if(!Validate.required(emailInput.value)){ Validate.showError(emailInput, 'Email is required.'); valid = false; }
    else if(!Validate.email(emailInput.value)){ Validate.showError(emailInput, 'Enter a valid email address.'); valid = false; }
    if(!Validate.required(passwordInput.value)){ Validate.showError(passwordInput, 'Password is required.'); valid = false; }

    if(!valid) return;

    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value
      })
    }, false)
    .then(data => {
      DB.setSession(data.token);
      showToast(`Welcome back, ${data.user.full_name.split(' ')[0]}!`, 'success');
      setTimeout(() => {
        window.location.href = data.user.role === 'donor' ? 'donor-dashboard.html' : 'patient-dashboard.html';
      }, 700);
    })
    .catch(error => {
      showToast(error.message || 'Login failed. Please try again.', 'error');
      Validate.showError(passwordInput, 'Incorrect email or password.');
    });
  });
}

/* ==========================================================================
   ADMIN LOGIN
   ========================================================================== */
const adminLoginForm = document.getElementById('adminLoginForm');
if(adminLoginForm){
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors(adminLoginForm);

    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    let valid = true;

    if(!Validate.required(emailInput.value)){ Validate.showError(emailInput, 'Email is required.'); valid = false; }
    if(!Validate.required(passwordInput.value)){ Validate.showError(passwordInput, 'Password is required.'); valid = false; }

    if(!valid) return;

    apiFetch('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value
      })
    }, false)
    .then(data => {
      DB.setSession(data.token);
      showToast('Admin login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 700);
    })
    .catch(error => {
      showToast(error.message || 'Admin login failed. Please try again.', 'error');
    });
  });
}
