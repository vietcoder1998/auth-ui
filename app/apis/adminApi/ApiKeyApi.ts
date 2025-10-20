import { getApiInstance } from '../index.ts';

export class ApiKeyApi {
  static async getApiKeys(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/api-keys', { params });
  }
  static async createApiKey(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/api-keys', data);
  }
  static async updateApiKey(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/api-keys/${id}`, data);
  }
  static async deleteApiKey(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/api-keys/${id}`);
  }
  static async regenerateApiKey(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/api-keys/${id}/regenerate`);
  }
  static async getApiKeyStats() {
    const axios = getApiInstance();
    return axios.get('/admin/api-keys/stats');
  }
  static async getApiKeyLogs(id: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/api-keys/${id}/logs`, { params });
  }
}
