import { getApiInstance } from '../index.ts';

export class SeedApi {
  static async getSeedStats() {
    const axios = getApiInstance();
    return axios.get('/admin/seed/stats');
  }
  static async getSeedData() {
    const axios = getApiInstance();
    return axios.get('/admin/seed/data');
  }
  static async seedAll() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/all');
  }
  static async seedPermissions() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/permissions');
  }
  static async seedRoles() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/roles');
  }
  static async seedUsers() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/users');
  }
  static async seedConfigs() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/configs');
  }
  static async seedAgents() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/agents');
  }
  static async seedApiKeys() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/api-keys');
  }
  static async clearAllData(confirmation: string = 'DELETE_ALL_DATA') {
    const axios = getApiInstance();
    return axios.delete('/admin/seed/clear-all', {
      data: { confirm: confirmation },
    });
  }
}
