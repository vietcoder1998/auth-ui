import { BaseApi } from './BaseApi.ts';

export class AIKeyApi extends BaseApi {
  constructor() {
    super('/admin/ai-keys');
  }

  // Custom methods
  async regenerateAIKey(id: string) {
    return this.customPost(`/${id}/regenerate`);
  }

  async getAIKeyStats() {
    return this.customGet('/stats');
  }

  async getAIKeyLogs(id: string, params?: any) {
    return this.customGet(`/${id}/logs`, { params });
  }

  // Static methods for backward compatibility
  static async getAIKeys(params?: any) {
    return BaseApi.staticGetAll('/admin/ai-keys', params);
  }

  static async createAIKey(data: any) {
    return BaseApi.staticCreate('/admin/ai-keys', data);
  }

  static async updateAIKey(id: string, data: any) {
    return BaseApi.staticUpdate('/admin/ai-keys', id, data);
  }

  static async deleteAIKey(id: string) {
    return BaseApi.staticDelete('/admin/ai-keys', id);
  }

  static async regenerateAIKey(id: string) {
    const instance = new AIKeyApi();
    return instance.regenerateAIKey(id);
  }

  static async getAIKeyStats() {
    const instance = new AIKeyApi();
    return instance.getAIKeyStats();
  }

  static async getAIKeyLogs(id: string, params?: any) {
    const instance = new AIKeyApi();
    return instance.getAIKeyLogs(id, params);
  }
}

export const AIKeyApiInstance = new AIKeyApi();
