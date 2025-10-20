import { getApiInstance } from '../index.ts';

export class LoginHistoryApi {
  static async getLoginHistory(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/login-history', { params });
  }
  static async getLoginStats() {
    const axios = getApiInstance();
    return axios.get('/admin/login-history/stats');
  }
  static async createLoginHistory(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/login-history', data);
  }
  static async updateLoginHistory(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/login-history/${id}`, data);
  }
  static async logoutUser(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/login-history/${id}/logout`);
  }
}
