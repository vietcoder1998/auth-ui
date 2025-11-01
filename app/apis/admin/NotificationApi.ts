import { getApiInstance } from '../index.ts';

export class NotificationApi {
  // Notification CRUD
  static async getNotifications(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/notifications', { params });
  }
  static async getNotification(id: string | number) {
    const axios = getApiInstance();
    return axios.get(`/admin/notifications/${id}`);
  }
  static async createNotification(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/notifications', data);
  }
  static async updateNotification(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/notifications/${id}`, data);
  }
  static async deleteNotification(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/notifications/${id}`);
  }
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
