import { useEffect, useRef, useState } from 'react';
import { getMe } from '../apis/auth.api.ts';
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

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  errorPayload: string; // JSON stringified FixingError
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUpdatePermissions() {
  // Use useLoginCookie for all login cookie handling
  const [, , removeLoginCookie] = useLoginCookie();
  const [errors, setErrors] = useState<NotificationItem[]>([]);
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

  // Fetch errors from backend (not cookie)
  useEffect(() => {
    const fetchErrors = async () => {
      try {
        // Replace with your notification API endpoint for errors
        const response = await adminApi.getNotifications();
        const errorNotifications = Array.isArray(response.data.data)
          ? response.data.data.filter((n: any) => n.type === 'error')
          : [];
        setErrors(errorNotifications);
        if (errorNotifications.length > 0 && !notifOpen) {
          setNotifOpen(true);
        }
        prevErrorCount.current = errorNotifications.length;
      } catch {
        setErrors([]);
        prevErrorCount.current = 0;
      }
    };
    fetchErrors();
    const interval = setInterval(fetchErrors, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [notifOpen]);

  const dismissError = async (errorId: string) => {
    try {
      await adminApi.deleteNotification(errorId);
    } catch {
      // fallback: ignore
    }
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  };

  const dismissAllErrors = async () => {
    try {
      await Promise.all(errors.map((error) => adminApi.deleteNotification(error.id)));
    } catch {
      // fallback: ignore
    }
    setErrors([]);
  };

  const fixPermission = async (
    dataId: string,
    error: FixingError,
    dismissErrorFn: (id: string) => void,
    onRefreshPermissions?: () => void
  ) => {
    console.log(error);
    const permission = extractPermissionFromError(error);
    if (!permission) return;
    try {
      let permissionId: string | null = null;
      const permissionsResponse = await adminApi.getPermissions();
      const permissions: any[] = Array.isArray(permissionsResponse.data)
        ? permissionsResponse.data
        : (permissionsResponse.data?.data ?? []);
      const existingPermission = permissions.find((p: any) => p.resource === permission);
      if (existingPermission) {
        permissionId = existingPermission.id;
      } else {
        let route = `/api${error?.url || ''}`;
        route = route.replace(/\/(\w*id)\b/g, '/:id');
        console.log(error);
        const newPermResponse = await adminApi.createPermission({
          resource: permission,
          name: permission,
          action: permission.includes(':write') ? 'write' : 'read',
          description: `Auto-generated permission for ${permission}`,
          route,
          method: error.responseData?.method || 'GET',
          category: 'custom',
        });
        if (!newPermResponse.data?.id) {
          throw new Error('Failed to create permission');
        }
        permissionId = newPermResponse.data.id;
      }
      const rolesResponse = await adminApi.getRoles();
      const roles = Array.isArray(rolesResponse.data)
        ? rolesResponse.data
        : (rolesResponse.data ?? []);
      const superAdminRole = roles.find((role: any) => role.name === 'superadmin');

      if (superAdminRole && typeof permissionId === 'string') {
        await adminApi.addPermissionsToRole(superAdminRole.id, [permissionId]);
        await dismissErrorFn(dataId);
        removeLoginCookie();
        await getMe();
        onRefreshPermissions?.();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to fix permission:', error);
    }
  };

  return {
    fixPermission,
    errors,
    notifOpen,
    setNotifOpen,
    dismissError,
    dismissAllErrors,
  };
}
