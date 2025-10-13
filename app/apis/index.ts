import axios, { AxiosInstance } from 'axios';

export function getApiInstance(): AxiosInstance {
    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:13030/api',
        withCredentials: true,
        timeout: 10000,
        headers: {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': import.meta.env.VITE_API_URL || 'http://localhost:5174',
            'Content-Type': 'application/json',
        }
    });
    // Optional: Add interceptors for auth, error handling, etc.
    // instance.interceptors.request.use((config) => {
    //   // Attach token or other headers here
    //   return config;
    // });
    // instance.interceptors.response.use(
    //   (response) => response,
    //   (error) => {
    //     // Handle errors globally
    //     return Promise.reject(error);
    //   }
    // );
    return instance;
}
