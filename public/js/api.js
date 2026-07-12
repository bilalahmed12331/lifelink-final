const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : '/api';

async function apiFetch(path, options = {}, requiresAuth = true) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (requiresAuth) {
    const token = localStorage.getItem('lifelink_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem('lifelink_token');
      window.location.href = 'login.html';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'Unauthorized') {
      throw error;
    }
    console.error('API Error:', error);
    throw error;
  }
}
