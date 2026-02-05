import axios from 'axios';
import { getCookie } from 'cookies-next'; // Install: npm install cookies-next

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api', // Sesuaikan dengan {{local}} di Postman-mu
});

api.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;