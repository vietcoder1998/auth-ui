import { getApiInstance } from '../index.ts';

export class UserApi {
  static async getUsers(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/users', { params });
  }
  static async createUser(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/users', data);
  }
  static async updateUser(email: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/users/${email}`, data);
  }
  static async deleteUser(email: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/users/${email}`);
  }
  static async loginAsUser(email: string) {
    const axios = getApiInstance();
    return axios.post('/admin/users/login-as', { email });
  }
  static async validateUserToken(token: string) {
    const axios = getApiInstance();
    return axios.post('/admin/users/validate-token', { token });
  }
}
