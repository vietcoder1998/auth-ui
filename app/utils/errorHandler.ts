import { ApiUtils } from '~/apis/index.ts';

// Utility function to handle axios errors in components
export const handleApiError = (error: any, context?: string) => {
  console.error('API Error:', error);

  let errorMessage = 'An unexpected error occurred';
  let errorCode = 'UNKNOWN_ERROR';
  let status: number | undefined;
  let details: any = {};

  // Handle axios errors with switch-case
  const errorType = error.response ? 'response' : error.request ? 'request' : 'client';

  switch (errorType) {
    case 'response': {
      // Server responded with error
      status = error.response.status;
      errorCode = error.code || 'API_ERROR';
      const data = error.response.data;

      // Extract error message
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage =
          typeof data.error === 'string' ? data.error : data.error.message || 'API Error';
      } else {
        errorMessage = `Request failed with status ${status}`;
      }

      details = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        responseData: data,
        context,
      };
      break;
    }

    case 'request': {
      // Request was made but no response received
      errorMessage = 'Network error: Unable to connect to server';
      errorCode = 'NETWORK_ERROR';
      details = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        context,
      };
      break;
    }

    case 'client':
    default: {
      // Client-side error
      errorMessage = error.message || 'An unexpected error occurred';
      errorCode = error.code || 'CLIENT_ERROR';
      details = { context };
      break;
    }
  }

  // Add context to error message if provided
  if (context) {
    errorMessage = `${context}: ${errorMessage}`;
  }

  // Add error to cookie for display
  ApiUtils.addErrorToCookie({
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
  ApiUtils.addErrorToCookie({
    message,
    code: 'WARNING',
    details,
  });
};

export default handleApiError;
