import { getApiInstance } from '../index.ts';

export class PermissionApi {
  static async getPermissions(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/permissions', { params });
  }
  static async createPermission(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/permissions', data);
  }
  static async updatePermission(id: string | number, data: any, roles?: string[]) {
    const axios = getApiInstance();
    const payload = roles ? { ...data, roles } : data;
    return axios.put(`/admin/permissions/${id}`, payload);
  }
  static async deletePermission(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/permissions/${id}`);
  }
}
