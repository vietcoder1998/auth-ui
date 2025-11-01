import { BaseApi } from './BaseApi.ts';

export class AgentApi extends BaseApi {
  constructor() {
    super('/admin/agents');
  }

  get instance() {
    return super.instance;
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
}

export const AgentApiInstance = new AgentApi();
