import { BaseApi } from '../base.ts';

export class AIModelApi extends BaseApi {
  constructor() {
    super('/admin/ai-models');
  }

  // Override getAll to support search parameter
  getAIModels(search?: string) {
    const params = search ? { search } : undefined;
    return this.getAll(params);
  }

  // Alias methods for consistency
  createAIModel(data: any) {
    return this.create(data);
  }

  updateAIModel(id: string, data: any) {
    return this.update(id, data);
  }

  deleteAIModel(id: string) {
    return this.delete(id);
  }
}

export const AIModelApiInstance = new AIModelApi();
