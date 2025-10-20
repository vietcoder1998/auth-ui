import { getApiInstance } from '../index.ts';

export class MailApi {
  static async getMailTemplates(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/mail-templates', { params });
  }
  static async createMailTemplate(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/mail-templates', data);
  }
  static async deleteMailTemplate(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/mail-templates/${id}`);
  }
  static async updateMailTemplate(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/mail-templates/${id}`, data);
  }
  static async getMails(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/mails', { params });
  }
  static async getMailStats() {
    const axios = getApiInstance();
    return axios.get('/admin/mails/stats');
  }
  static async createMail(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/mails', data);
  }
  static async updateMail(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/mails/${id}`, data);
  }
  static async deleteMail(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/mails/${id}`);
  }
  static async markMailAsSent(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/mails/${id}/sent`);
  }
  static async markMailAsFailed(id: string, data: any) {
    const axios = getApiInstance();
    return axios.patch(`/admin/mails/${id}/failed`, data);
  }
  static async resendMail(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/mails/${id}/resend`);
  }
}
