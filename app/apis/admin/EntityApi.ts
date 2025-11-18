import { BaseApi } from '../base.ts';
import { EntityMethod } from './EntityMethodApi.ts';
export type Entity = {
  id: string;
  name: string;
  description?: string;
  // Add other entity-specific fields here
  entityMethods: EntityMethod[];
};

export class EntityApi extends BaseApi<Entity, string> {
  constructor() {
    super('/admin/entities');
  }
}

export const EntityApiInstance = new EntityApi();
