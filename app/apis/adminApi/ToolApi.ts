import { BaseApi } from './BaseApi.ts';

export class ToolApi extends BaseApi {
  constructor() {
    super('/admin/tools');
  }

  // Static methods for backward compatibility
  static async getTools(params?: any) {
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
}

export const ToolApiInstance = new ToolApi();
