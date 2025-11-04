import { BaseApi } from './BaseApi.ts';

export interface PermissionGroup {
  id: string;
  name: string;
  description?: string;
  roleId?: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  permissions?: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    route?: string;
    method?: string;
  }[];
  _count?: {
    permissions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionGroupData {
  name: string;
  description?: string;
  roleId?: string;
}

export interface UpdatePermissionGroupData {
  name?: string;
  description?: string;
  roleId?: string;
}

export interface PermissionGroupSearchParams {
  page?: number;
  pageSize?: number;
  q?: string;
  includePermissions?: boolean;
  includeRole?: boolean;
}

export interface AddPermissionsToGroupData {
  permissionIds: string[];
}

export interface RemovePermissionsFromGroupData {
  permissionIds: string[];
}

export class PermissionGroupApi extends BaseApi<PermissionGroup, string> {
  constructor() {
    super('/admin/permission-groups');
  }

  // Override base methods with specific implementations
  async getPermissionGroups(params?: PermissionGroupSearchParams) {
    return this.getAll(params);
  }

  async createPermissionGroup(data: CreatePermissionGroupData) {
    return this.create(data);
  }

  async getPermissionGroupById(id: string, includePermissions = true, includeRole = true) {
    const params: any = {};
    if (includePermissions) params.includePermissions = 'true';
    if (includeRole) params.includeRole = 'true';

    return this.getById(id, { params });
  }

  async updatePermissionGroup(id: string, data: UpdatePermissionGroupData) {
    return this.update(id, data);
  }

  async deletePermissionGroup(id: string) {
    return this.delete(id);
  }

  // Permission management methods
  async getPermissionsNotInGroup(groupId: string) {
    return this.customGet(`/${groupId}/permissions/available`);
  }

  async addPermissionsToGroup(groupId: string, data: AddPermissionsToGroupData) {
    return this.customPost(`/${groupId}/permissions/add`, data);
  }

  async removePermissionsFromGroup(groupId: string, data: RemovePermissionsFromGroupData) {
    return this.customPost(`/${groupId}/permissions/remove`, data);
  }

  // Role assignment methods
  async assignGroupToRole(groupId: string, roleId: string) {
    return this.customPost(`/${groupId}/assign-role`, { roleId });
  }

  async unassignGroupFromRole(groupId: string) {
    return this.customPost(`/${groupId}/unassign-role`, {});
  }

  async getGroupsByRole(roleId: string) {
    return this.customGet(`/role/${roleId}`);
  }
}

// Export an instance
export const PermissionGroupApiInstance = new PermissionGroupApi();
