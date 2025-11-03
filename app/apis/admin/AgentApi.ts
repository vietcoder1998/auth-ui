import { BaseApi } from './BaseApi.ts';
import { getApiInstance } from '../index.ts';

export class AgentApi extends BaseApi {
  constructor() {
    super('/admin/agents');
  }

  // Custom methods for agent memories
  async getAgentMemories(id: string, params?: any) {
    return BaseApi.staticGetAll(`/admin/agents/${id}/memories`, { params });
  }

  async createAgentMemory(id: string, data: any) {
    return BaseApi.staticCreate(`/admin/memories/${id}`, data);
  }

  // Static methods for backward compatibility
  static async getAgents(params?: any) {
    return BaseApi.staticGetAll('/admin/agents', params);
  }
  //
  static async createAgent(data: any) {
    return BaseApi.staticCreate('/admin/agents', data);
  }

  static async updateAgent(id: string, data: any) {
    return BaseApi.staticUpdate(`/admin/agents`, id, data);
  }

  static async deleteAgent(id: string) {
    return BaseApi.staticDelete(`/admin/agents`, id);
  }

  static async getAgentMemories(id: string, params?: any) {
    return BaseApi.staticGetAll(`/admin/agents/${id}/memories`, params);
  }

  static async createAgentMemory(id: string, data: any) {
    return BaseApi.staticCreate(`/admin/agents/${id}/memories`, data);
  }

  static async updateAgentKeys(id: string, aiKeyIds: string[]) {
    const axios = getApiInstance();
    return axios.put(`/admin/agents/${id}/ai-keys`, { aiKeyIds });
  }

  static async addKeysToAgent(id: string, aiKeyIds: string[]) {
    const axios = getApiInstance();
    return axios.post(`/admin/agents/${id}/ai-keys/add`, { aiKeyIds });
  }

  static async removeKeysFromAgent(id: string, aiKeyIds: string[]) {
    const axios = getApiInstance();
    return axios.post(`/admin/agents/${id}/ai-keys/remove`, { aiKeyIds });
  }
}

export const AgentApiInstance = new AgentApi();
