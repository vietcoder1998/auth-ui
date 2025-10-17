import { addErrorToCookie } from '../components/ErrorDisplay.tsx';

// Utility function to handle axios errors in components
export const handleApiError = (error: any, context?: string) => {
  console.error('API Error:', error);
  
  let errorMessage = 'An unexpected error occurred';
  let errorCode = 'UNKNOWN_ERROR';
  let status: number | undefined;
  let details: any = {};

  // Handle axios errors
  if (error.response) {
    status = error.response.status;
    errorCode = error.code || 'API_ERROR';
    
    // Extract meaningful error message
    if (error.response.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = typeof data.error === 'string' ? data.error : data.error.message || 'API Error';
      } else {
        errorMessage = `Request failed with status ${status}`;
      }
      
      details = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        responseData: data,
        context,
      };
    } else {
      errorMessage = `Request failed with status ${status}`;
    }
  } else if (error.request) {
    errorMessage = 'Network error: Unable to connect to server';
    errorCode = 'NETWORK_ERROR';
    details = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      context,
    };
  } else if (error.message) {
    errorMessage = error.message;
    errorCode = error.code || 'CLIENT_ERROR';
    details = { context };
  }

  // Add context to error message if provided
  if (context) {
    errorMessage = `${context}: ${errorMessage}`;
  }

  // Add error to cookie for display
  addErrorToCookie({
    message: errorMessage,
    status,
    code: errorCode,
    details,
  });
};

// Utility function to manually add success/info messages (optional)
export const addSuccessMessage = (message: string) => {
  // For now, just log it. We could extend ErrorDisplay to show success messages too
  console.log('Success:', message);
};

// Utility function to manually add warnings
export const addWarningMessage = (message: string, details?: any) => {
  addErrorToCookie({
    message,
    code: 'WARNING',
    details,
  });
};

export default handleApiError;