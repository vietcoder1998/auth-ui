import { useEffect, useRef, useState } from 'react';
// Remove direct js-cookie usage
import { COOKIE_FIXING_ERRORS } from '~/env.ts';
import { extractPermissionFromUrl } from '~/utils/permissionUtils.ts';
import { adminApi } from '../apis/admin.api.ts';
import { useCookie, useLoginCookie } from './useCookie.tsx';
// Type for errors saved in fixing_errors cookie
export interface FixingError {
  id: string;
  message: string;
  status: number;
  code: string;
  timestamp: number;
  statusText: string;
  url: string;
  method?: string;
  responseData: {
    url?: string;
    method?: string;
    status?: number;
    statusText?: string;
    responseData?: any;
    requestHeaders?: any;
    [key: string]: any;
  };
}

export function useUpdatePermissions() {
  // Use useLoginCookie for all login cookie handling
  const [, , removeLoginCookie] = useLoginCookie();
  // Use useCookie for fixing_errors
  const [fixingErrorsArr, setFixingErrorsArr, removeFixingErrorsCookie] = useCookie<FixingError[]>(
    COOKIE_FIXING_ERRORS,
    []
  );
  // ...existing code...
  console.log('fixingErrorsArr:', fixingErrorsArr);
  // Set of error ids for quick lookup
  const fixingErrorIds = new Set<string>(fixingErrorsArr.map((e) => e.id));
  const [errors, setErrors] = useState<FixingError[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const prevErrorCount = useRef(0);
  // Extract permission from URL for 403 errors

  const extractPermissionFromError = (error: FixingError): string | null => {
    if (error.status !== 403) return null;

    const url = error?.url;
    const method = error?.method || 'GET';

    const permissionInfo = extractPermissionFromUrl(url ?? '', method);
    return permissionInfo?.resource || null;
  };
  // Poll for errors and sync fixingErrors to cookie
  useEffect(() => {
    // Use useCookie for reading fixing_errors cookie
    const loadErrorsFromCookie = () => {
      try {
        const parsedErrors = Array.isArray(fixingErrorsArr) ? fixingErrorsArr : [];
        setErrors(parsedErrors);
        // Always open dropdown if there are errors and not already open
        if (parsedErrors.length > 0 && !notifOpen) {
          setNotifOpen(true);
        }
        prevErrorCount.current = parsedErrors.length;
      } catch {
        setErrors([]);
        prevErrorCount.current = 0;
      }
    };
    loadErrorsFromCookie();
    const interval = setInterval(loadErrorsFromCookie, 1000);
    return () => clearInterval(interval);
  }, [notifOpen, fixingErrorsArr]);

  // No need to sync fixingErrors to cookie, handled by setFixingErrorsArr when updating

  const dismissError = (errorId: string) => {
    const updatedErrors = fixingErrorsArr.filter((error) => error.id !== errorId);
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
    error: FixingError,
    dismissErrorFn: (id: string) => void,
    onRefreshPermissions?: () => void // optional callback
  ) => {
    console.log(error);
    const permission = extractPermissionFromError(error);
    if (!permission) return;
    // Add error to fixingErrorsArr if not present
    if (!fixingErrorIds.has(error.id)) {
      setFixingErrorsArr([...fixingErrorsArr, error]);
    }
    try {
      let permissionId: string | null = null;
      try {
        const permissionsResponse = await adminApi.getPermissions();
        let permissions: any[] = [];
        switch (true) {
          case Array.isArray(permissionsResponse.data):
            permissions = permissionsResponse.data;
            break;
          case permissionsResponse.data && Array.isArray(permissionsResponse.data.data):
            permissions = permissionsResponse.data.data;
            break;
          default:
            permissions = [];
            break;
        }
        const existingPermission = permissions.find((p: any) => p.resource === permission);
        if (existingPermission) permissionId = existingPermission.id;
        if (!existingPermission) {
          // Replace /...id/... with /:id/ in the route if detected
          let route = `/api${error?.url || ''}`;
          route = route.replace(/\/(\w*id)\b/g, '/:id');
          const newPermResponse = await adminApi.createPermission({
            resource: permission,
            name: permission,
            action: permission.includes(':write') ? 'write' : 'read',
            description: `Auto-generated permission for ${permission}`,
            route,
            method: error.responseData?.method || 'GET',
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
      // Remove error from fixingErrorsArr
      setFixingErrorsArr(fixingErrorsArr.filter((e) => e.id !== error.id));
    }
  };

  return {
    fixingErrorsArr,
    fixPermission,
    errors,
    notifOpen,
    setNotifOpen,
    dismissError,
    dismissAllErrors,
  };
}
