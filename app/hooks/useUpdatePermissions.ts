import { useEffect, useRef, useState } from 'react';
// Remove direct js-cookie usage
import { COOKIE_FIXING_ERRORS } from '~/env.ts';
import { adminApi } from '../apis/admin.api.ts';
import { useCookie, useLoginCookie } from './useCookie.tsx';

export function useUpdatePermissions() {
  // Use useLoginCookie for all login cookie handling
  const [, , removeLoginCookie] = useLoginCookie();
  // Use useCookie for fixing_errors
  const [fixingErrorsArr, setFixingErrorsArr, removeFixingErrorsCookie] = useCookie<string[]>(
    COOKIE_FIXING_ERRORS,
    []
  );
  const fixingErrors = new Set<string>(fixingErrorsArr);
  const [errors, setErrors] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const prevErrorCount = useRef(0);

  // Poll for errors and sync fixingErrors to cookie
  useEffect(() => {
    // Use useCookie for reading 'app_errors' cookie
    // import { useCookie } from './useCookie.tsx' at the top if not already
    const loadErrorsFromCookie = () => {
      try {
        const parsedErrors = Array.isArray(fixingErrorsArr) ? fixingErrorsArr : [];
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const recentErrors = parsedErrors.filter((error: any) => error.timestamp > fiveMinutesAgo);
        console.log(recentErrors);
        setErrors(recentErrors);
        // Always open dropdown if there are errors and not already open
        if (recentErrors.length > 0 && !notifOpen) {
          setNotifOpen(true);
        }
        prevErrorCount.current = recentErrors.length;
      } catch {
        setErrors([]);
        prevErrorCount.current = 0;
      }
    };
    loadErrorsFromCookie();
    const interval = setInterval(loadErrorsFromCookie, 1000);
    return () => clearInterval(interval);
  }, [notifOpen, fixingErrorsArr]);

  // Sync fixingErrors to cookie
  useEffect(() => {
    setFixingErrorsArr(Array.from(fixingErrors));
  }, []);

  const dismissError = (errorId: string) => {
    const updatedErrors = errors.filter((error) => error.id !== errorId);
    setErrors(updatedErrors);
    if (updatedErrors.length > 0) {
      setFixingErrorsArr(updatedErrors);
    } else {
      removeFixingErrorsCookie();
    }
  };

  const dismissAllErrors = () => {
    setErrors([]);
    removeFixingErrorsCookie();
  };

  const fixPermission = async (
    error: any,
    extractPermissionFromError: (error: any) => string | null,
    dismissErrorFn: (id: string) => void,
    onRefreshPermissions?: () => void // optional callback
  ) => {
    const permission = extractPermissionFromError(error);
    if (!permission) return;
    setFixingErrorsArr(Array.from(new Set<string>([...fixingErrorsArr, error.id])));
    try {
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
        if (existingPermission) permissionId = existingPermission.id;
        if (!existingPermission) {
          // Replace /...id/... with /:id/ in the route if detected
          let route = `/api${error.details?.url || ''}`;
          route = route.replace(/\/(\w*id)\b/g, '/:id');
          const newPermResponse = await adminApi.createPermission({
            resource: permission,
            name: permission,
            action: permission.includes(':write') ? 'write' : 'read',
            description: `Auto-generated permission for ${permission}`,
            route,
            method: error.details?.method || 'GET',
            category: 'custom',
          });
          if (!newPermResponse.data || !newPermResponse.data.id) {
            throw new Error('Failed to create permission');
          }
          permissionId = newPermResponse.data.id;
        }
      } catch (permError) {
        console.error('Error handling permission:', permError);
      }
      const rolesResponse = await adminApi.getRoles();
      const roles = rolesResponse.data || [];
      const superAdminRole = Array.isArray(roles)
        ? roles.find((role: any) => role.name === 'superadmin')
        : null;
      if (superAdminRole && typeof permissionId === 'string') {
        await adminApi.addPermissionsToRole(superAdminRole.id, [permissionId]);
        dismissErrorFn(error.id);
        removeLoginCookie();
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
    } catch (error) {
      console.error('Failed to fix permission:', error);
    } finally {
      const newSet = new Set<string>(fixingErrorsArr);
      newSet.delete(error.id);
      setFixingErrorsArr(Array.from(newSet));
    }
  };

  return {
    fixingErrors,
    fixPermission,
    errors,
    notifOpen,
    setNotifOpen,
    dismissError,
    dismissAllErrors,
  };
}
