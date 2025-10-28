import { BaseApi } from './BaseApi.ts';

export type EntityMethod = {
  id: string;
  entityId: string;
  name: string;
  description?: string;
  // Add other entity method-specific fields here
};

export class EntityMethodApi extends BaseApi<EntityMethod, string> {
  constructor() {
    super('/admin/entity-methods');
  }
}
