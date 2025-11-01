import { getApiInstance } from '../index.ts';

export class ConversationApi {
  static async getConversations(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/conversations', { params });
  }
  static async getConversation(id: string) {
    const axios = getApiInstance();
    return axios.get(`/admin/conversations/${id}`);
  }
  static async createConversation(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/conversations', data);
  }
  static async updateConversation(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/conversations/${id}`, data);
  }
  static async deleteConversation(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/conversations/${id}`);
  }
  static async sendMessage(conversationId: string, data: any) {
    const axios = getApiInstance();
    return axios.post(`/admin/conversations/${conversationId}/messages`, data);
  }
  static async getMessages(conversationId: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/conversations/${conversationId}/messages`, { params });
  }
}
