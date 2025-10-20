import { getApiInstance } from '../index.ts';

export class RoleApi {
  static async getRoles(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/roles', { params });
  }
  static async createRole(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/roles', data);
  }
  static async updateRole(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/roles/${id}`, data);
  }
  static async deleteRole(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/roles/${id}`);
  }
  static async getPermissionsNotInRole(roleId: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/roles/${roleId}/permissions/available`, { params });
  }
  static async addPermissionsToRole(roleId: string, permissionIds: string[]) {
    const axios = getApiInstance();
    return axios.post(`/admin/roles/${roleId}/permissions/add`, { permissionIds });
  }
}
