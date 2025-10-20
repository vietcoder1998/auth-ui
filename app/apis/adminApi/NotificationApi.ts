import { getApiInstance } from '../index.ts';

export class NotificationApi {
  static async getNotificationTemplates(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/notification-templates', { params });
  }
  static async createNotificationTemplate(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/notification-templates', data);
  }
  static async updateNotificationTemplate(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/notification-templates/${id}`, data);
  }
  static async deleteNotificationTemplate(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/notification-templates/${id}`);
  }
}
