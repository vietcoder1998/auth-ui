import { ApiUtils } from './utils.api.ts';

/**
 * Error handling utility class for API errors
 */
export class ErrorHandler {
  /**
   * Handle axios errors in components
   */
  static handleApiError(error: any, context?: string) {
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
  }

  /**
   * Add success message (optional - for future extension)
   */
  static addSuccessMessage(message: string) {
    // For now, just log it. We could extend ErrorDisplay to show success messages too
    console.log('Success:', message);
  }

  /**
   * Add warning message
   */
  static addWarningMessage(message: string, details?: any) {
    ApiUtils.addErrorToCookie({
      message,
      code: 'WARNING',
      details,
    });
  }
}

// Export legacy functions for backward compatibility
export const handleApiError = ErrorHandler.handleApiError.bind(ErrorHandler);
export const addSuccessMessage = ErrorHandler.addSuccessMessage.bind(ErrorHandler);
export const addWarningMessage = ErrorHandler.addWarningMessage.bind(ErrorHandler);

export default ErrorHandler;
