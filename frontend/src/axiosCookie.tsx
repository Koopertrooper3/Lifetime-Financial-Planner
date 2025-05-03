// Axios instance (e.g., in `src/api.js`)
import axios from 'axios';

const axiosCookie = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // ← Ensures cookies are sent with every request
});

export default axiosCookie;