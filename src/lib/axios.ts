import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// Request Interceptor (Menambahkan Token)
api.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (Menangani Expired Token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika error 401 berarti token expired atau tidak valid
    if (error.response && error.response.status === 401) {
      // Dispatch event kustom agar bisa ditangkap oleh komponen UI
      window.dispatchEvent(new Event('auth-token-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;