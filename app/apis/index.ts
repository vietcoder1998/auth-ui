import axios, { AxiosInstance } from 'axios';

// Cookie utility function
const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Get user ID from stored user data
const getUserId = (): string | null => {
  const userData = getCookie('auth_user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id || null;
    } catch (error) {
      console.error('Failed to parse user data from cookie:', error);
      return null;
    }
  }
  return null;
};

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

    // Add interceptors for auth, error handling, etc.
    instance.interceptors.request.use((config) => {
        // Attach token from cookie
        const token = getCookie('auth_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Attach user ID header that backend expects
        const userId = getUserId();
        if (userId) {
            config.headers['x-user-id'] = userId;
        }
        
        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            // Handle 401 errors globally
            if (error.response?.status === 401) {
                // Token might be expired, clear auth data
                document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
                document.cookie = 'auth_user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
                localStorage.removeItem('token');
                
                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
}
