import { getApiInstance } from '../index.ts';

export class SocketApi {
  static async getSockets() {
    const axios = getApiInstance();
    return axios.get('/admin/sockets');
  }
  static async createSocket(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/sockets', data);
  }
  static async updateSocket(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/sockets/${id}`, data);
  }
  static async deleteSocket(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/sockets/${id}`);
  }
  static async getSocketEvents(socketConfigId: string) {
    const axios = getApiInstance();
    return axios.get(`/admin/sockets/${socketConfigId}/events`);
  }
  static async createSocketEvent(socketConfigId: string, data: any) {
    const axios = getApiInstance();
    return axios.post(`/admin/sockets/${socketConfigId}/events`, data);
  }
  static async deleteSocketEvent(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/sockets/events/${id}`);
  }
  static async pingSocket(id: string) {
    const axios = getApiInstance();
    return axios.post(`/admin/sockets/${id}/ping`);
  }
  static async testSocketEvent(id: string, data: { event: string; payload: any }) {
    const axios = getApiInstance();
    return axios.post(`/admin/sockets/${id}/test-event`, data);
  }
  static async searchAll(query: string) {
    const axios = getApiInstance();
    return axios.get('/admin/search', { params: { q: query } });
  }
}
