import { BaseApi } from './BaseApi.ts';

export class AgentApi extends BaseApi {
  constructor() {
    super('/admin/agents');
  }

  // Custom methods for agent memories
  async getAgentMemories(id: string, params?: any) {
    return this.customGet(`/${id}/memories`, { params });
  }

  async createAgentMemory(id: string, data: any) {
    return this.customPost(`/${id}/memories`, data);
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
    return BaseApi.staticUpdate('/admin/agents', id, data);
  }

  static async deleteAgent(id: string) {
    return BaseApi.staticDelete('/admin/agents', id);
  }

  static async getAgentMemories(id: string, params?: any) {
    const instance = new AgentApi();
    return instance.getAgentMemories(id, params);
  }

  static async createAgentMemory(id: string, data: any) {
    const instance = new AgentApi();
    return instance.createAgentMemory(id, data);
  }
}

export const AgentApiInstance = new AgentApi();
