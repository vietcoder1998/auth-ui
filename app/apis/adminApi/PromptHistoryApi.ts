import { getApiInstance } from '../index.ts';

export class PromptHistoryApi {
  static async getPrompts(search?: string) {
    const axios = getApiInstance();
    const params = search ? { params: { q: search } } : undefined;
    return axios.get(`/admin/prompts`, params);
  }
  static async createPrompt(conversationId: string, prompt: string) {
    const axios = getApiInstance();
    return axios.post(`/admin/conversations/${conversationId}/prompts`, { conversationId, prompt });
  }
  static async updatePrompt(promptId: string, prompt: string) {
    const axios = getApiInstance();
    return axios.put(`/admin/prompts/${promptId}`, { prompt });
  }
  static async deletePrompt(promptId: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/prompts/${promptId}`);
  }
}
