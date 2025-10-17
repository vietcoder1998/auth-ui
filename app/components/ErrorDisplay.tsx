import { CloseOutlined, ExclamationCircleOutlined, ToolOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { adminApi } from '../apis/admin.api.ts';
import { extractPermissionFromUrl } from '../utils/permissionUtils.ts';

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
  const [fixingErrors, setFixingErrors] = useState<Set<string>>(new Set());
  
  // Get user info for super admin check
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // useAuth not available, continue without user info
  }

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

  // Check if user is super admin
  const isSuperAdmin = () => {
    console.log(user)
    return user?.role?.name === 'superadmin' || user?.role?.name === 'admin';
  };

  // Extract permission from URL for 403 errors
  const extractPermissionFromError = (error: ErrorInfo): string | null => {
    if (error.status !== 403) return null;
    
    const url = error.details?.url;
    const method = error.details?.method || 'GET';
    
    const permissionInfo = extractPermissionFromUrl(url, method);
    return permissionInfo?.resource || null;
  };

  // Fix permission by adding it to super admin role
  const fixPermission = async (error: ErrorInfo) => {
    const permission = extractPermissionFromError(error);
    if (!permission) return;

    setFixingErrors(prev => new Set(prev).add(error.id));

    try {
      // Remove client cookies for auth_token and auth_user to ensure clean state
      Cookies.remove('auth_token');
      Cookies.remove('auth_user');

      // First, try to find or create the permission
      let permissionId: string | null = null;
      try {
        // Get all permissions and find the one we need
        const permissionsResponse = await adminApi.getPermissions();
        const permissions = permissionsResponse.data || [];
        const existingPermission = permissions.find((p: any) => p.resource === permission);
        if (existingPermission) {
          permissionId = existingPermission.id;
        } else {
          // Create the permission if it doesn't exist
          const newPermissionResponse = await adminApi.createPermission({
            resource: permission,
            action: permission.includes(':write') ? 'write' : 'read',
            description: `Auto-generated permission for ${permission}`,
          });
          permissionId = newPermissionResponse.data?.id;
        }
      } catch (permError) {
        console.error('Error handling permission:', permError);
      }

      if (permissionId) {
        // Find super admin role
        const rolesResponse = await adminApi.getRoles();
        const roles = rolesResponse.data || [];
        const superAdminRole = roles.find((role: any) => 
          role.name === 'super_admin' || role.name === 'admin'
        );

        if (superAdminRole) {
          // Add permission to super admin role
          await adminApi.addPermissionsToRole(superAdminRole.id, [permissionId]);

          // Show success message
          console.log(`Permission ${permission} added to ${superAdminRole.name} role`);

          // Remove the error from display
          dismissError(error.id);

          // Recall getMe to refresh user info (role/permissions)
          try {
            // Use direct import with extension to avoid import error
            const { getMe } = await import('../apis/auth.api.ts');
            await getMe();
          } catch (refreshError) {
            console.error('Failed to refresh user info after fixing permission:', refreshError);
          }

          // Optionally refresh the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Failed to fix permission:', error);
    } finally {
      setFixingErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(error.id);
        return newSet;
      });
    }
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={className} style={{ marginBottom: '12px', ...style }}>
      {errors.map((error) => {
        const canFix = error.status === 403 && isSuperAdmin() && extractPermissionFromError(error);
        const isFixing = fixingErrors.has(error.id);
        
        return (
          <Alert
            key={error.id}
            type={getErrorType(error)}
            showIcon
            icon={<ExclamationCircleOutlined />}
            message={formatErrorMessage(error)}
            description={
              error.details && (
                <details style={{ marginTop: '6px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '11px', opacity: 0.7 }}>
                    View Details
                  </summary>
                  <pre style={{ 
                    fontSize: '10px', 
                    background: '#f5f5f5', 
                    padding: '6px', 
                    borderRadius: '3px',
                    marginTop: '3px',
                    overflow: 'auto',
                    maxHeight: '150px'
                  }}>
                    {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                  </pre>
                </details>
              )
            }
            action={
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {canFix && (
                  <Button
                    size="small"
                    type="primary"
                    icon={<ToolOutlined />}
                    loading={isFixing}
                    onClick={() => fixPermission(error)}
                    style={{ 
                      fontSize: '11px',
                      height: '24px',
                      padding: '0 8px'
                    }}
                    title={`Fix by adding permission: ${extractPermissionFromError(error)}`}
                  >
                    Fix
                  </Button>
                )}
                <Button
                  size="small"
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => dismissError(error.id)}
                  style={{ 
                    color: 'inherit',
                    fontSize: '11px',
                    height: '24px',
                    padding: '0 6px'
                  }}
                />
              </div>
            }
            style={{ 
              marginBottom: '6px',
              fontSize: '12px'
            }}
          />
        );
      })}
      
      {errors.length > 1 && (
        <div style={{ textAlign: 'right', marginTop: '6px' }}>
          <Button size="small" type="link" onClick={dismissAllErrors} style={{ fontSize: '11px' }}>
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