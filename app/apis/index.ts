import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:13030/api',
  withCredentials: true, // send cookies with requests
  timeout: 10000,
});

// Optional: Add interceptors for auth, error handling, etc.
// api.interceptors.request.use((config) => {
//   // Attach token or other headers here
//   return config;
// });
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle errors globally
//     return Promise.reject(error);
//   }
// );

export default api;
