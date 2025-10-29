import { BaseApi } from './BaseApi.ts';

export type EntityMethod = {
  id: string;
  entityId: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add other entity method-specific fields here
};

export type CreateEntityMethodData = {
  name: string;
  entityIds: string[]; // Support multiple entity IDs
  description?: string;
};

export class EntityMethodApi extends BaseApi<EntityMethod, string> {
  constructor() {
    super('/admin/entity-methods');
  }

  // Create methods for multiple entities
  async createForMultipleEntities(data: CreateEntityMethodData) {
    const { entityIds, ...methodData } = data;
    const results = [];

    // Create a method for each selected entity
    for (const entityId of entityIds) {
      try {
        const result = await this.create({
          ...methodData,
          entityId,
        });
        results.push({ entityId, success: true, data: result });
      } catch (error) {
        results.push({ entityId, success: false, error });
      }
    }

    return results;
  }

  // Get methods by entity ID
  async getMethodsByEntity(entityId: string) {
    return this.api.get(`${this.basePath}/entity/${entityId}/methods`);
  }

  // Get methods by name
  async getMethodsByName(name: string) {
    return this.api.get(`${this.basePath}/by-name/${name}`);
  }

  // Get entity method statistics
  async getStats() {
    return this.api.get(`${this.basePath}/stats`);
  }

  // Create method for specific entity (alternative endpoint)
  async createMethodForEntity(entityId: string, methodData: Omit<EntityMethod, 'id' | 'entityId'>) {
    return this.api.post(`${this.basePath}/entity/${entityId}/methods`, methodData);
  }
}

export const EntityMethodApiInstance = new EntityMethodApi();
