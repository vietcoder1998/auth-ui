import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

interface ErrorDisplayProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ErrorInfo {
  id: string;
  message: string;
  status?: number;
  code?: string;
  timestamp: number;
  details?: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ className, style }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  // Load errors from cookie on mount and set up polling
  useEffect(() => {
    loadErrorsFromCookie();
    
    // Poll for new errors every 1 second
    const interval = setInterval(loadErrorsFromCookie, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadErrorsFromCookie = () => {
    try {
      const errorsCookie = Cookies.get('app_errors');
      if (errorsCookie) {
        const parsedErrors = JSON.parse(errorsCookie) as ErrorInfo[];
        // Only show errors from the last 5 minutes
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const recentErrors = parsedErrors.filter(error => error.timestamp > fiveMinutesAgo);
        setErrors(recentErrors);
        
        // Update cookie to remove old errors
        if (recentErrors.length !== parsedErrors.length) {
          if (recentErrors.length > 0) {
            Cookies.set('app_errors', JSON.stringify(recentErrors), { expires: 1 });
          } else {
            Cookies.remove('app_errors');
          }
        }
      } else {
        setErrors([]);
      }
    } catch (error) {
      console.error('Failed to load errors from cookie:', error);
      setErrors([]);
    }
  };

  const dismissError = (errorId: string) => {
    const updatedErrors = errors.filter(error => error.id !== errorId);
    setErrors(updatedErrors);
    
    // Update cookie
    if (updatedErrors.length > 0) {
      Cookies.set('app_errors', JSON.stringify(updatedErrors), { expires: 1 });
    } else {
      Cookies.remove('app_errors');
    }
  };

  const dismissAllErrors = () => {
    setErrors([]);
    Cookies.remove('app_errors');
  };

  const formatErrorMessage = (error: ErrorInfo) => {
    let message = error.message;
    
    // Add status code if available
    if (error.status) {
      message = `[${error.status}] ${message}`;
    }
    
    // Add error code if available and different from message
    if (error.code && !message.includes(error.code)) {
      message = `${message} (${error.code})`;
    }
    
    return message;
  };

  const getErrorType = (error: ErrorInfo) => {
    if (error.status) {
      if (error.status >= 500) return 'error';
      if (error.status >= 400) return 'warning';
    }
    return 'error';
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={className} style={{ marginBottom: '16px', ...style }}>
      {errors.map((error) => (
        <Alert
          key={error.id}
          type={getErrorType(error)}
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={formatErrorMessage(error)}
          description={
            error.details && (
              <details style={{ marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.8 }}>
                  View Details
                </summary>
                <pre style={{ 
                  fontSize: '11px', 
                  background: '#f5f5f5', 
                  padding: '8px', 
                  borderRadius: '4px',
                  marginTop: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )
          }
          action={
            <Button
              size="small"
              type="text"
              icon={<CloseOutlined />}
              onClick={() => dismissError(error.id)}
              style={{ color: 'inherit' }}
            />
          }
          style={{ marginBottom: '8px' }}
        />
      ))}
      
      {errors.length > 1 && (
        <div style={{ textAlign: 'right', marginTop: '8px' }}>
          <Button size="small" type="link" onClick={dismissAllErrors}>
            Dismiss All
          </Button>
        </div>
      )}
    </div>
  );
};

// Utility function to add errors to cookie from anywhere in the app
export const addErrorToCookie = (error: {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}) => {
  try {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      status: error.status,
      code: error.code,
      timestamp: Date.now(),
      details: error.details,
    };

    // Get existing errors
    const existingErrorsCookie = Cookies.get('app_errors');
    let existingErrors: ErrorInfo[] = [];
    
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
    Cookies.set('app_errors', JSON.stringify(existingErrors), { expires: 1 });
    
    console.error('Error added to cookie:', errorInfo);
  } catch (error) {
    console.error('Failed to add error to cookie:', error);
  }
};

export default ErrorDisplay;