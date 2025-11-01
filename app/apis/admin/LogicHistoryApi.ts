import { getApiInstance } from '../index.ts';

export class LogicHistoryApi {
  static async getLogicHistory(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/logic-history', { params });
  }
  static async getLogicHistoryStats() {
    const axios = getApiInstance();
    return axios.get('/admin/logic-history/stats');
  }
  static async createLogicHistory(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/logic-history', data);
  }
  static async updateLogicHistory(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/logic-history/${id}`, data);
  }
  static async markNotificationSent(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/logic-history/${id}/notification-sent`);
  }
}
