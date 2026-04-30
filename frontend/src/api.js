import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied via Vite config
});

export default api;
