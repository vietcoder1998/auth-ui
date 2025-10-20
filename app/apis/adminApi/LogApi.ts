import { getApiInstance } from '../index.ts';

export class LogApi {
  static async getLogs(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/logs', { params });
  }
  static async getLogStats() {
    const axios = getApiInstance();
    return axios.get('/admin/logs/stats');
  }
  static async exportLogs(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/logs/export', { params });
  }
  static async clearOldLogs(daysToKeep: number) {
    const axios = getApiInstance();
    return axios.delete('/admin/logs/clear', {
      data: { daysToKeep },
    });
  }
  static async createLogEntry(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/logs', data);
  }
}
