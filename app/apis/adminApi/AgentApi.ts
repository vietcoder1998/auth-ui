import { getApiInstance } from '../index.ts';

export class AgentApi {
  static async getAgents(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/agents', { params });
  }
  static async createAgent(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/agents', data);
  }
  static async updateAgent(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/agents/${id}`, data);
  }
  static async deleteAgent(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/agents/${id}`);
  }
  static async getAgentMemories(id: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/agents/${id}/memories`, { params });
  }
  static async createAgentMemory(id: string, data: any) {
    const axios = getApiInstance();
    return axios.post(`/admin/agents/${id}/memories`, data);
  }
}
