import { useState } from 'react';
import Cookies from 'js-cookie';
import { adminApi } from '../apis/admin.api.ts';

export function useUpdatePermissions() {
  const [fixingErrors, setFixingErrors] = useState<Set<string>>(new Set());

  const fixPermission = async (
    error: any,
    extractPermissionFromError: (error: any) => string | null,
    dismissError: (id: string) => void,
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
          dismissError(error.id);
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

  return { fixingErrors, fixPermission };
}
