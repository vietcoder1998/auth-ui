import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { adminApi } from '../apis/admin.api.ts';

export function useUpdatePermissions() {
  const [fixingErrors, setFixingErrors] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const prevErrorCount = useRef(0);

  // Poll for errors
  useEffect(() => {
    const loadErrorsFromCookie = () => {
      try {
        const errorsCookie = Cookies.get('app_errors');
        if (errorsCookie) {
          const parsedErrors = JSON.parse(errorsCookie);
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          const recentErrors = parsedErrors.filter((error: any) => error.timestamp > fiveMinutesAgo);
          setErrors(recentErrors);
          // Auto open dropdown if new error
          if (recentErrors.length > prevErrorCount.current) {
            setNotifOpen(true);
          }
          prevErrorCount.current = recentErrors.length;
        } else {
          setErrors([]);
          prevErrorCount.current = 0;
        }
      } catch {
        setErrors([]);
        prevErrorCount.current = 0;
      }
    };
    loadErrorsFromCookie();
    const interval = setInterval(loadErrorsFromCookie, 1000);
    return () => clearInterval(interval);
  }, []);

  const dismissError = (errorId: string) => {
    const updatedErrors = errors.filter(error => error.id !== errorId);
    setErrors(updatedErrors);
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

  const fixPermission = async (
    error: any,
    extractPermissionFromError: (error: any) => string | null,
    dismissErrorFn: (id: string) => void,
    onRefreshPermissions?: () => void // optional callback
  ) => {
    const permission = extractPermissionFromError(error);
    if (!permission) return;
    setFixingErrors(prev => new Set(prev).add(error.id));
    try {
      Cookies.remove('auth_user');
      let permissionId: string | null = null;
      try {
        const permissionsResponse = await adminApi.getPermissions();
        let permissions: any[] = [];
        if (Array.isArray(permissionsResponse.data)) {
          permissions = permissionsResponse.data;
        } else if (permissionsResponse.data && Array.isArray(permissionsResponse.data.data)) {
          permissions = permissionsResponse.data.data;
        }
        const existingPermission = permissions.find((p: any) => p.resource === permission);
        if (existingPermission) {
          permissionId = existingPermission.id;
        } else {
          const newPermResponse = await adminApi.createPermission({
            resource: permission,
            name: permission, // Add name field for backend validation
            action: permission.includes(':write') ? 'write' : 'read',
            description: `Auto-generated permission for ${permission}`,
            route: `/api${error.details?.url || ''}`,
            method: error.details?.method || 'GET',
          });
          if (!newPermResponse.data || !newPermResponse.data.id) {
            throw new Error('Failed to create permission');
          }
          permissionId = newPermResponse.data.id;
        }
      } catch (permError) {
        console.error('Error handling permission:', permError);
      }
      if (permissionId) {
        const rolesResponse = await adminApi.getRoles();
        const roles = rolesResponse.data || [];
        const superAdminRole = roles.find((role: any) => role.name === 'superadmin' || role.name === 'admin');
        if (superAdminRole) {
          await adminApi.addPermissionsToRole(superAdminRole.id, [permissionId]);
          dismissErrorFn(error.id);
          try {
            const { getMe } = await import('../apis/auth.api.ts');
            await getMe();
          } catch (refreshError) {
            console.error('Failed to refresh user info after fixing permission:', refreshError);
          }
          if (onRefreshPermissions) onRefreshPermissions();
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

  return { fixingErrors, fixPermission, errors, notifOpen, setNotifOpen, dismissError, dismissAllErrors };
}
