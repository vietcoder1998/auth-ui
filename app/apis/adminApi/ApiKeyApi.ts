import { BaseApi } from './BaseApi.ts';

export class ApiKeyApi extends BaseApi {
  constructor() {
    super('/admin/api-keys');
  }

  // Custom methods
  async regenerateApiKey(id: string) {
    return this.customPost(`/${id}/regenerate`);
  }

  async getApiKeyStats() {
    return this.customGet('/stats');
  }

  async getApiKeyLogs(id: string, params?: any) {
    return this.customGet(`/${id}/logs`, { params });
  }

  // Static methods for backward compatibility
  static async getApiKeys(params?: any) {
    return BaseApi.staticGetAll('/admin/api-keys', params);
  }

  static async createApiKey(data: any) {
    return BaseApi.staticCreate('/admin/api-keys', data);
  }

  static async updateApiKey(id: string, data: any) {
    return BaseApi.staticUpdate('/admin/api-keys', id, data);
  }

  static async deleteApiKey(id: string) {
    return BaseApi.staticDelete('/admin/api-keys', id);
  }

  static async regenerateApiKey(id: string) {
    const instance = new ApiKeyApi();
    return instance.regenerateApiKey(id);
  }

  static async getApiKeyStats() {
    const instance = new ApiKeyApi();
    return instance.getApiKeyStats();
  }

  static async getApiKeyLogs(id: string, params?: any) {
    const instance = new ApiKeyApi();
    return instance.getApiKeyLogs(id, params);
  }
}

export const ApiKeyApiInstance = new ApiKeyApi();
