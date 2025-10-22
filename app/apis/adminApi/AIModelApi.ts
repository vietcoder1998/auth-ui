import { getApiInstance } from '../index.ts';

export class AIModelApi {
  private api = getApiInstance();

  getAIModels(search?: string) {
    const params = search ? { params: { search } } : {};
    return this.api.get('/admin/ai-models', params);
  }

  createAIModel(data: any) {
    return this.api.post('/admin/ai-models', data);
  }

  updateAIModel(id: string, data: any) {
    return this.api.put(`/admin/ai-models/${id}`, data);
  }

  deleteAIModel(id: string) {
    return this.api.delete(`/admin/ai-models/${id}`);
  }
}

export const AIModelApiInstance = new AIModelApi();
