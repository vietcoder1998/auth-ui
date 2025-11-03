import { useEffect, useRef, useState } from 'react';
import { extractPermissionFromUrl } from '~/utils/permissionUtils.ts';
import { adminApi } from '~/apis/admin/index.ts';
import { authApi } from '~/apis/auth.api.ts';
import { useLoginCookie } from './useCookie.tsx';

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
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const prevErrorCount = useRef(0);

  // Set loading state for a specific notification
  const setLoading = (id: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id]: isLoading }));
  };

  // Check if a notification is loading
  const isLoading = (id: string) => loadingStates[id] || false;

  // Extract permission from URL for 403 errors
  const extractPermissionFromError = (error: FixingError): string | null => {
    if (error.status !== 403) return null;
    console.log(error);
    const url = error?.url;
    const method = error?.method || 'GET';
    debugger;
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
    const permission = extractPermissionFromError(error);
    if (!permission) {
      console.warn('No permission extracted from error:', error);
      return;
    }

    // Set loading state
    setLoading(dataId, true);

    try {
      // Get or create permission
      let permissionId = await getOrCreatePermission(permission, error);
      if (!permissionId) {
        throw new Error('Failed to get or create permission');
      }

      // Assign permission to superadmin role
      await assignPermissionToSuperadmin(permissionId);

      // Remove the notification from backend and local state
      await dismissErrorFn(dataId);

      // Cleanup and refresh
      removeLoginCookie();
      await authApi.getMe();
      onRefreshPermissions?.();

      // Reload page after a short delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Failed to fix permission:', error);
      setLoading(dataId, false);
      throw error;
    } finally {
      // Clear loading state after a delay if page doesn't reload
      setTimeout(() => setLoading(dataId, false), 2000);
    }
  };

  const getOrCreatePermission = async (
    permission: string,
    error: FixingError
  ): Promise<string | null> => {
    const permissionsResponse = await adminApi.getPermissions();
    const permissions: any[] = Array.isArray(permissionsResponse.data)
      ? permissionsResponse.data
      : (permissionsResponse.data?.data ?? []);

    // Check if permission already exists
    const existingPermission = permissions.find((p: any) => p.resource === permission);
    if (existingPermission) {
      return existingPermission.id;
    }

    // Create new permission
    const route = `/api${error?.url || ''}`.replace(/\/(\w*id)\b/g, '/:id');
    const method = error?.method?.toUpperCase() || 'GET';
    const action = getActionFromMethod(method);

    const permissionName = permission.includes(':id') ? `${permission}/:id` : permission;
    debugger;
    const newPermResponse = await adminApi.createPermission({
      resource: permission,
      name: permissionName,
      action,
      description: `Auto-generated permission for ${permission}`,
      route,
      method: error?.method || 'GET',
      category: 'custom',
    });

    return newPermResponse.data?.id || null;
  };

  const getActionFromMethod = (method: string): string => {
    switch (method) {
      case 'POST':
        return 'create';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      case 'GET':
        return 'read';
      case 'HEAD':
      case 'OPTIONS':
      default:
        return 'read';
    }
  };

  const assignPermissionToSuperadmin = async (permissionId: string): Promise<void> => {
    const rolesResponse = await adminApi.getRoles();
    const roles = Array.isArray(rolesResponse.data)
      ? rolesResponse.data
      : (rolesResponse.data ?? []);

    const superAdminRole = roles.find((role: any) => role.name === 'superadmin');
    if (!superAdminRole) {
      throw new Error('Superadmin role not found');
    }

    await adminApi.addPermissionsToRole(superAdminRole.id, [permissionId]);
  };

  return {
    fixPermission,
    errors,
    notifOpen,
    setNotifOpen,
    dismissError,
    dismissAllErrors,
    loadingStates,
    isLoading,
  };
}
