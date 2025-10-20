import { getApiInstance } from '../index.ts';

export class ConfigApi {
  static async getConfig(params?: any) {
    const axios = getApiInstance();
    return axios.get('/config', { params });
  }
  static async createConfig(data: any) {
    const axios = getApiInstance();
    return axios.post('/config', data);
  }
  static async updateConfig(key: string, data: any) {
    const axios = getApiInstance();
    return axios.put('/config', { key, ...data });
  }
  static async deleteConfig(key: string) {
    const axios = getApiInstance();
    return axios.delete(`/config/${key}`);
  }
  static async getHealthStatus() {
    const axios = getApiInstance();
    return axios.get('/config/health');
  }
}
