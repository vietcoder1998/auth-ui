import { message } from 'antd';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { FixingError } from '~/hooks/useUpdatePermissions.ts';
import { COOKIE_DOMAIN, COOKIE_FIXING_ERRORS, COOKIE_PATH } from '../env.ts';

export class ApiUtils {
  static addErrorToCookie(error: {
    message: string;
    status?: number;
    code?: string;
    details?: any;
    url?: string;
    method?: string;
  }) {
    try {
      const errorInfo: FixingError = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: error.message,
        status: error.status ?? 0,
        code: error.code ?? 'UNKNOWN_ERROR',
        timestamp: Date.now(),
        responseData: error.details,
        statusText: error.status ? String(error.status) : 'N/A',
        url: error?.url || 'N/A',
        method: error?.details?.method || 'N/A',
      };

      // Get existing errors
      const existingErrorsCookie = Cookies.get(COOKIE_FIXING_ERRORS);
      let existingErrors: FixingError[] = [];

      if (existingErrorsCookie) {
        try {
          existingErrors = JSON.parse(existingErrorsCookie);
        } catch (parseError) {
          console.error('Failed to parse existing errors:', parseError);
          existingErrors = [];
        }
      }

      // Add new error
      existingErrors.push(errorInfo);

      // Keep only the last 10 errors to prevent cookie from getting too large
      if (existingErrors.length > 10) {
        existingErrors = existingErrors.slice(-10);
      }

      // Save to cookie (expires in 1 day)
      Cookies.set(COOKIE_FIXING_ERRORS, JSON.stringify(existingErrors), { expires: 1 });

      console.error('Error added to cookie:', errorInfo);
    } catch (error) {
      console.error('Failed to add error to cookie:', error);
    }
  }

  static getUserId(): string | null {
    const userData = Cookies.get('auth_user');
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
  }

  static getApiInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:13030/api',
      withCredentials: true,
      timeout: 20000,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': import.meta.env.VITE_API_URL || 'http://localhost:5174',
        'Content-Type': 'application/json',
      },
    });

    // Push notification API
    const pushNotification = async (payload: {
      message: string;
      type?: string;
      templateId?: string;
      errorPayload?: any;
    }) => {
      try {
        const res = await instance.post('/admin/notifications', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        if (res.status < 200 || res.status >= 300) throw new Error('Failed to push notification');
        return res.data;
      } catch (err) {
        console.error('Push notification error:', err);
        return null;
      }
    };

    // Add interceptors for auth, error handling, etc.
    instance.interceptors.request.use((config) => {
      // Attach token from cookie
      const token = Cookies.get('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Attach user ID header that backend expects
      const userId = ApiUtils.getUserId();
      if (userId) {
        config.headers['x-user-id'] = userId;
      }

      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Extract error message for toast
        let errorMessage =
          error.response?.data?.message ??
          error.response?.data?.error ??
          error.message ??
          'An error occurred';
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

        console.log(error);

        // Handle different error status codes with toasts
        switch (true) {
          case error.response?.status === 401:
            errorMessage = 'Authentication failed. Please login again.';
            message.error(errorMessage);
            setTimeout(() => {
              if (!window.location.pathname.includes('/login')) {
                Cookies.remove('auth_token', { path: COOKIE_PATH, domain: COOKIE_DOMAIN });
                Cookies.remove('auth_user', { path: COOKIE_PATH, domain: COOKIE_DOMAIN });
                window.location.href = '/login';
              }
            }, 1000);
            break;
          case error.response?.status === 403:
            errorMessage = "Access denied. You don't have permission to perform this action.";
            // Write error to fixing_errors cookie using js-cookie
            try {
              const prevErrors = Cookies.get(COOKIE_FIXING_ERRORS);
              let errorsArr = [];
              if (prevErrors) {
                errorsArr = JSON.parse(prevErrors);
                if (!Array.isArray(errorsArr)) errorsArr = [];
              }
              errorsArr.push(errorDetails);
              Cookies.set(COOKIE_FIXING_ERRORS, JSON.stringify(errorsArr), {
                path: COOKIE_PATH,
                domain: COOKIE_DOMAIN,
                expires: 365,
              });
            } catch (e) {
              // fallback: just set the error
              Cookies.set(COOKIE_FIXING_ERRORS, JSON.stringify([errorDetails]), {
                path: COOKIE_PATH,
                domain: COOKIE_DOMAIN,
                expires: 365,
              });
            }
            // Push notification for 403 error
            pushNotification({
              message: errorMessage,
              type: 'error',
              errorPayload: JSON.stringify(errorDetails),
            });
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
}

export const getApiInstance = ApiUtils.getApiInstance;
