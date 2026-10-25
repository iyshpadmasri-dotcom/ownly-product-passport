import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ownly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isLoginRequest) {
        localStorage.removeItem('ownly_token');
        localStorage.removeItem('ownly_user');
        // Let the AuthContext handle state update
      }
    }
    return Promise.reject(error);
  }
);

export default api;
