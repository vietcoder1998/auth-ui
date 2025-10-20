import { getApiInstance } from '../index.ts';

export class SSOApi {
  static async getSSOEntries(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/sso', { params });
  }
  static async getSSOStats() {
    const axios = getApiInstance();
    return axios.get('/admin/sso/stats');
  }
  static async createSSO(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/sso', data);
  }
  static async updateSSO(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/sso/${id}`, data);
  }
  static async deleteSSO(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/sso/${id}`);
  }
  static async regenerateSSORKey(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/sso/${id}/regenerate-key`);
  }
  static async simulateSSOLogin(ssoKey: string, loginData?: any) {
    const axios = getApiInstance();
    return axios.post(
      '/sso/login',
      loginData || {
        deviceIP: '127.0.0.1',
        userAgent: navigator.userAgent,
        location: 'Admin Panel Simulator',
      },
      {
        headers: {
          'x-sso-key': ssoKey,
        },
      }
    );
  }
  static async validateSSOKey(keyOrSsoKey: string, gmail?: string) {
    const axios = getApiInstance();
    return axios.post('/sso/validate-key', {
      key: keyOrSsoKey,
      ssoKey: keyOrSsoKey,
      gmail: gmail,
    });
  }
}
