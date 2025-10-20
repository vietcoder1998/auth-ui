import { message } from 'antd';
import axios, { AxiosInstance } from 'axios';
import { addErrorToCookie } from '../components/ErrorDisplay.tsx';
import { COOKIE_DOMAIN, COOKIE_PATH } from '../env.ts';

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
    },
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
      // Extract error message for toast
      let errorMessage = 'An error occurred';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add error to cookie for ErrorDisplay component
      const errorDetails = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestHeaders: error.config?.headers,
        timestamp: new Date().toISOString(),
      };

      addErrorToCookie({
        message: errorMessage,
        status: error.response?.status,
        code: error.code || 'AXIOS_ERROR',
        details: errorDetails,
      });

      // Handle different error status codes with toasts
      switch (true) {
        case error.response?.status === 401:
          errorMessage = 'Authentication failed. Please login again.';
          document.cookie = `auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${COOKIE_PATH};domain=${COOKIE_DOMAIN};`;
          document.cookie = `auth_user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${COOKIE_PATH};domain=${COOKIE_DOMAIN};`;
          localStorage.removeItem('token');
          message.error(errorMessage);
          setTimeout(() => {
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }, 1000);
          break;
        case error.response?.status === 403:
          errorMessage = "Access denied. You don't have permission to perform this action.";
          message.error(errorMessage);
          break;
        case error.response?.status === 404:
          errorMessage = 'Resource not found.';
          message.error(errorMessage);
          break;
        case error.response?.status >= 500:
          errorMessage = 'Server error. Please try again later.';
          message.error(errorMessage);
          break;
        case error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED':
          errorMessage = 'Network error. Please check your connection.';
          message.error(errorMessage);
          break;
        default:
          message.error(errorMessage);
          break;
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
