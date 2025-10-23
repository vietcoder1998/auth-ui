import { getApiInstance } from './index.ts';

export class LLMDebugApi {
  static async generateDebug({
    prompt,
    agentId,
    modelId,
  }: {
    prompt: string;
    agentId?: string;
    modelId?: string | null;
  }) {
    const apiInstance = getApiInstance();
    const res = await apiInstance.post('/admin/prompts/generate', {
      prompt,
      agentId,
      modelId,
    });
    return res;
  }
}
