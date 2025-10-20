import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { addErrorToCookie } from '../components/ErrorDisplay.tsx';

// Create axios interceptor for error handling that works with existing axios instances
export const setupAxiosErrorInterceptor = (instance?: AxiosInstance) => {
  const axiosInstance = instance || axios;

  // Response interceptor to catch errors
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Return successful responses as-is
      return response;
    },
    (error: AxiosError) => {
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = getErrorMessage(error);
        const errorDetails = getErrorDetails(error);

        addErrorToCookie({
          message: errorMessage,
          status: error.response.status,
          code: error.code || 'AXIOS_ERROR',
          details: errorDetails,
        });
      } else if (error.request) {
        // Request was made but no response received
        addErrorToCookie({
          message: 'Network error: No response from server',
          code: error.code || 'NETWORK_ERROR',
          details: {
            message: error.message,
            url: error.config?.url,
            method: error.config?.method,
          },
        });
      } else {
        // Something else happened
        addErrorToCookie({
          message: error.message || 'Unknown error occurred',
          code: error.code || 'UNKNOWN_ERROR',
          details: {
            stack: error.stack,
            config: error.config,
          },
        });
      }

      // Re-throw the error so it can still be handled by the calling code
      return Promise.reject(error);
    }
  );
};

// Extract meaningful error message from axios error
const getErrorMessage = (error: AxiosError): string => {
  // Try to get error message from response data
  if (error.response?.data) {
    const data = error.response.data as any;

    // Common error message patterns
    if (typeof data === 'string') {
      return data;
    }

    if (data.message) {
      return data.message;
    }

    if (data.error) {
      if (typeof data.error === 'string') {
        return data.error;
      }
      if (data.error.message) {
        return data.error.message;
      }
    }

    if (data.details) {
      return data.details;
    }
  }

  // Fallback to default message
  if (error.response?.status) {
    return `Request failed with status code ${error.response.status}`;
  }

  return error.message || 'An unknown error occurred';
};

// Extract error details for debugging
const getErrorDetails = (error: AxiosError): any => {
  return {
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: error.response?.data,
    requestHeaders: error.config?.headers,
    timestamp: new Date().toISOString(),
  };
};

export default setupAxiosErrorInterceptor;
