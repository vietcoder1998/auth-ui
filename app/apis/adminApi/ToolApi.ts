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

  static async updateAgentTools(agentId: string, selectedToolIds: string[], allTools: any[]) {
    const results = [];

    // Get current tools to compare
    const currentResponse = await this.getToolsByAgent(agentId);
    const currentToolIds = currentResponse.data?.data?.map((tool: any) => tool.id) || [];

    // Enable selected tools that aren't currently enabled
    for (const toolId of selectedToolIds) {
      const tool = allTools.find((t) => t.id === toolId);
      if (tool && !currentToolIds.includes(toolId)) {
        try {
          await this.enableTool(agentId, tool.name);
          results.push({ action: 'enabled', tool: tool.name });
        } catch (error) {
          console.error(`Failed to enable tool ${tool.name}:`, error);
        }
      }
    }

    // Disable tools that are currently enabled but not selected
    for (const toolId of currentToolIds) {
      if (!selectedToolIds.includes(toolId)) {
        const tool = allTools.find((t) => t.id === toolId);
        if (tool) {
          try {
            await this.disableTool(agentId, tool.name);
            results.push({ action: 'disabled', tool: tool.name });
          } catch (error) {
            console.error(`Failed to disable tool ${tool.name}:`, error);
          }
        }
      }
    }

    return { data: { results } };
  }
}

export const ToolApiInstance = new ToolApi();
