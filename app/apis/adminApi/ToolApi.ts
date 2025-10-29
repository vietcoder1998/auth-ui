import { AxiosInstance } from 'axios';
import { getApiInstance } from '../index.ts';
import { BaseApi } from './BaseApi.ts';

export class ToolApi extends BaseApi {
  constructor() {
    super('/admin/tools');
  }

  // Static methods for backward compatibility
  static async getTools(params?: any) {
    return BaseApi.staticGetAll('/admin/tools', params);
  }

  static async getToolsByAgent(agentId: string, name?: string) {
    const params: any = { agentId };
    if (name) {
      params.name = name;
    }
    return BaseApi.staticGetAll('/admin/tools', params);
  }

  static async createTool(data: any) {
    return BaseApi.staticCreate('/admin/tools', data);
  }

  static async updateTool(id: string | number, data: any) {
    return BaseApi.staticUpdate('/admin/tools', id, data);
  }

  static async deleteTool(id: string | number) {
    return BaseApi.staticDelete('/admin/tools', id);
  }

  static async enableTool(agentId: string, toolName: string) {
    const axios = getApiInstance();
    return axios.put(`/admin/tools/agent/${agentId}/enable/${toolName}`);
  }

  static async disableTool(agentId: string, toolName: string) {
    const axios = getApiInstance();
    return axios.put(`/admin/tools/agent/${agentId}/disable/${toolName}`);
  }

  static async updateAgentTools(agentId: string, selectedToolIds: string[], allTools?: any[]) {
    const axios = getApiInstance();
    return axios.put(`/admin/tools/agent/${agentId}/bulk-update`, {
      toolIds: selectedToolIds,
    });
  }
}

export const ToolApiInstance = new ToolApi();
