// Normalize and ensure `/api` suffix
const normalizeWithApi = (url) => {
  const u = url.replace(/\/$/, '');
  return /\/api(\/|$)/i.test(u) ? u : `${u}/api`;
};

const getApiBaseUrl = () => {
  // Single source of truth: VITE_API_BASE_URL
  const raw = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (raw) return normalizeWithApi(raw);

  // Dev default (when no env set)
  if (import.meta.env.DEV) return 'http://localhost:5000/api';

  // Production fallback (Render service)
  return 'https://vnr-ibt-potholemapper.onrender.com/api';
};

export const API_BASE = getApiBaseUrl();

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export const handleApiError = (error, response) => {
  if (response && !response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  throw error;
};