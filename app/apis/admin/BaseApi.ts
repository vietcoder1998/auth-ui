import { getApiInstance } from '../index.ts';
import { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * BaseApi - A generic base class for API operations
 * Provides common CRUD operations and utility methods
 *
 * @template T - The type of the entity
 * @template ID - The type of the entity ID (string | number)
 */
export class BaseApi<T = any, ID = string | number> {
  public api: AxiosInstance;
  protected basePath: string;

  /**
   * Constructor
   * @param basePath - The base path for the API endpoint (e.g., '/admin/users')
   */
  constructor(basePath: string) {
    this.api = getApiInstance();
    this.basePath = basePath;
  }

  protected get instance() {
    const instance = getApiInstance();

    return instance;
  }
  /**
   * Get all entities with optional query parameters
   * @param params - Query parameters for filtering, pagination, etc.
   * @returns Promise with the API response
   */
  async getAll(params?: any): Promise<any> {
    return this.api.get(this.basePath, { params });
  }

  /**
   * Get a single entity by ID
   * @param id - The entity ID
   * @param config - Optional Axios request config
   * @returns Promise with the API response
   */
  async getById(id: ID, config?: AxiosRequestConfig): Promise<any> {
    return this.api.get(`${this.basePath}/${id}`, config);
  }

  /**
   * Create a new entity
   * @param data - The entity data to create
   * @returns Promise with the API response
   */
  async create(data: Partial<T>): Promise<any> {
    return this.api.post(this.basePath, data);
  }

  /**
   * Update an existing entity
   * @param id - The entity ID
   * @param data - The entity data to update
   * @returns Promise with the API response
   */
  async update(id: ID, data: Partial<T>): Promise<any> {
    return this.api.put(`${this.basePath}/${id}`, data);
  }

  /**
   * Partially update an existing entity
   * @param id - The entity ID
   * @param data - The partial entity data to update
   * @returns Promise with the API response
   */
  async patch(id: ID, data: Partial<T>): Promise<any> {
    return this.api.patch(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete an entity
   * @param id - The entity ID
   * @returns Promise with the API response
   */
  async delete(id: ID): Promise<any> {
    return this.api.delete(`${this.basePath}/${id}`);
  }

  /**
   * Custom GET request to a sub-path
   * @param subPath - The sub-path to append to basePath
   * @param config - Optional Axios request config
   * @returns Promise with the API response
   */
  protected async customGet(subPath: string, config?: AxiosRequestConfig): Promise<any> {
    return this.api.get(`${this.basePath}${subPath}`, config);
  }

  /**
   * Custom POST request to a sub-path
   * @param subPath - The sub-path to append to basePath
   * @param data - The data to send
   * @param config - Optional Axios request config
   * @returns Promise with the API response
   */
  protected async customPost(
    subPath: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return this.api.post(`${this.basePath}${subPath}`, data, config);
  }

  /**
   * Custom PUT request to a sub-path
   * @param subPath - The sub-path to append to basePath
   * @param data - The data to send
   * @param config - Optional Axios request config
   * @returns Promise with the API response
   */
  protected async customPut(
    subPath: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return this.api.put(`${this.basePath}${subPath}`, data, config);
  }

  /**
   * Custom DELETE request to a sub-path
   * @param subPath - The sub-path to append to basePath
   * @param config - Optional Axios request config
   * @returns Promise with the API response
   */
  protected async customDelete(subPath: string, config?: AxiosRequestConfig): Promise<any> {
    return this.api.delete(`${this.basePath}${subPath}`, config);
  }

  /**
   * Static method for getting all entities (for backward compatibility)
   */
  static async staticGetAll(basePath: string, params?: any): Promise<any> {
    const axios = getApiInstance();
    return axios.get(basePath, { params });
  }

  /**
   * Static method for creating an entity (for backward compatibility)
   */
  static async staticCreate(basePath: string, data: any): Promise<any> {
    const axios = getApiInstance();
    return axios.post(basePath, data);
  }

  /**
   * Static method for updating an entity (for backward compatibility)
   */
  static async staticUpdate(basePath: string, id: string | number, data: any): Promise<any> {
    const axios = getApiInstance();
    return axios.put(`${basePath}/${id}`, data);
  }

  /**
   * Static method for deleting an entity (for backward compatibility)
   */
  static async staticDelete(basePath: string, id: string | number): Promise<any> {
    const axios = getApiInstance();
    return axios.delete(`${basePath}/${id}`);
  }
}
