import { BaseApi } from './BaseApi.ts';
import { getApiInstance } from '../index.ts';

export class ToolCommandApi extends BaseApi {
  constructor() {
    super('/admin/tool-commands');
  }

  // Static methods for backward compatibility
  static async getToolCommands(params?: any) {
    return BaseApi.staticGetAll('/admin/tool-commands', params);
  }

  static async getToolCommand(id: string) {
    const api = getApiInstance();
    return api.get(`/admin/tool-commands/${id}`);
  }

  static async getToolCommandById(id: string) {
    return BaseApi.staticGetAll('/admin/tool-commands/' + id);
  }

  static async getToolCommandsByToolId(toolId: string) {
    return BaseApi.staticGetAll('/admin/tool-commands', { toolId });
  }

  static async createToolCommand(data: any) {
    return BaseApi.staticCreate('/admin/tool-commands', data);
  }

  static async updateToolCommand(id: string | number, data: any) {
    return BaseApi.staticUpdate('/admin/tool-commands', id, data);
  }

  static async deleteToolCommand(id: string | number) {
    return BaseApi.staticDelete('/admin/tool-commands', id);
  }

  static async toggleToolCommand(id: string, enabled: boolean) {
    const api = getApiInstance();
    return api.patch(`/admin/tool-commands/${id}/toggle`, { enabled });
  }

  static async executeToolCommand(id: string, params?: any) {
    const api = getApiInstance();
    return api.post(`/admin/tool-commands/${id}/execute`, params);
  }

  static async getToolCommandHistory(id: string) {
    const api = getApiInstance();
    return api.get(`/admin/tool-commands/${id}/history`);
  }
}

export const ToolCommandApiInstance = new ToolCommandApi();
export default ToolCommandApiInstance;
