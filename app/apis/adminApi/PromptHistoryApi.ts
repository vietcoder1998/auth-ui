import { getApiInstance } from '../index.ts';

export class PromptHistoryApi {
  static async getPrompts(conversationId: string) {
    const axios = getApiInstance();
    return axios.get(`/admin/conversations/${conversationId}/prompts`);
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
