import { BaseApi } from './BaseApi.ts';

export class PermissionApi extends BaseApi {
  constructor() {
    super('/admin/permissions');
  }

  // Override update to support roles parameter
  async updateWithRoles(id: string | number, data: any, roles?: string[]) {
    const payload = roles ? { ...data, roles } : data;
    return this.update(id, payload);
  }

  // Static methods for backward compatibility
  static async getPermissions(params?: any) {
    return BaseApi.staticGetAll('/admin/permissions', params);
  }

  static async createPermission(data: any) {
    return BaseApi.staticCreate('/admin/permissions', data);
  }

  static async updatePermission(id: string | number, data: any, roles?: string[]) {
    const instance = new PermissionApi();
    return instance.updateWithRoles(id, data, roles);
  }

  static async deletePermission(id: string | number) {
    return BaseApi.staticDelete('/admin/permissions', id);
  }
}

export const PermissionApiInstance = new PermissionApi();
