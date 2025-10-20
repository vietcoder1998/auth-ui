import { getApiInstance } from '../index.ts';

export class DatabaseConnectionApi {
  static async getDatabaseConnections(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/database-connections', { params });
  }
  static async createDatabaseConnection(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/database-connections', data);
  }
  static async updateDatabaseConnection(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/database-connections/${id}`, data);
  }
  static async deleteDatabaseConnection(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/database-connections/${id}`);
  }
  static async testDatabaseConnection(id: string) {
    const axios = getApiInstance();
    return axios.post(`/admin/database-connections/${id}/test`);
  }
  static async checkDatabaseConnection(id: string) {
    const axios = getApiInstance();
    return axios.post(`/admin/database-connections/${id}/check`);
  }
  static async createDatabaseBackup(id: string) {
    const axios = getApiInstance();
    return axios.post(`/admin/database-connections/${id}/backup`);
  }
  static async getDatabaseConnectionStats() {
    const axios = getApiInstance();
    return axios.get('/admin/database-connections/stats');
  }
}
