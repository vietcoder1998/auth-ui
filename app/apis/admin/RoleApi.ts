import { BaseApi } from '../base.ts';

export class RoleApi extends BaseApi {
  constructor() {
    super('/admin/roles');
  }

  // Custom methods beyond CRUD
  async getPermissionsNotInRole(roleId: string, params?: any) {
    return this.customGet(`/${roleId}/permissions/available`, { params });
  }

  async addPermissionsToRole(roleId: string, permissionIds: string[]) {
    return this.customPost(`/${roleId}/permissions/add`, { permissionIds });
  }

  // Static methods for backward compatibility
  static async getRoles(params?: any) {
    return BaseApi.staticGetAll('/admin/roles', params);
  }

  static async createRole(data: any) {
    return BaseApi.staticCreate('/admin/roles', data);
  }

  static async updateRole(id: string | number, data: any) {
    return BaseApi.staticUpdate('/admin/roles', id, data);
  }

  static async deleteRole(id: string | number) {
    return BaseApi.staticDelete('/admin/roles', id);
  }

  static async getPermissionsNotInRole(roleId: string, params?: any) {
    const instance = new RoleApi();
    return instance.getPermissionsNotInRole(roleId, params);
  }

  static async addPermissionsToRole(roleId: string, permissionIds: string[]) {
    const instance = new RoleApi();
    return instance.addPermissionsToRole(roleId, permissionIds);
  }
}

export const RoleApiInstance = new RoleApi();
