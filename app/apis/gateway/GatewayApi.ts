import { BaseApi } from '../base.ts';

/**
 * Gateway Service Interface
 */
export interface GatewayService {
  id?: string;
  name: string;
  protocol: string;
  host: string;
  port: number;
  path: string;
  retries: number;
  connectTimeout: number;
  writeTimeout: number;
  readTimeout: number;
  enabled: boolean;
  tags: string[];
  status?: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked?: string;
  responseTime?: number;
}

/**
 * Gateway Statistics Interface
 */
export interface GatewayStatistics {
  totalServices: number;
  enabledServices: number;
  healthyServices: number;
  unhealthyServices: number;
  averageResponseTime: number;
}

/**
 * Health Check Result Interface
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

/**
 * Service Health Status Interface
 */
export interface ServiceHealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked?: string;
  responseTime?: number;
}

/**
 * Gateway API Class
 * Handles all communication with the gateway-service backend
 */
export class GatewayApi extends BaseApi<GatewayService, string> {
  constructor() {
    // Use gateway-service base path - can be configured via env
    super('/services');
  }

  /**
   * Get all gateway services
   * @param params - Optional query parameters
   */
  async getServices(params?: any): Promise<GatewayService[]> {
    const response = await this.getAll(params);
    return response.data;
  }

  /**
   * Get a single gateway service by ID
   * @param id - Service ID
   */
  async getService(id: string): Promise<GatewayService> {
    const response = await this.getById(id);
    return response.data;
  }

  /**
   * Create a new gateway service
   * @param service - Service data (without ID)
   */
  async createService(service: Omit<GatewayService, 'id'>): Promise<GatewayService> {
    const response = await this.create(service);
    return response.data;
  }

  /**
   * Update an existing gateway service
   * @param id - Service ID
   * @param service - Partial service data to update
   */
  async updateService(id: string, service: Partial<GatewayService>): Promise<GatewayService> {
    const response = await this.update(id, service);
    return response.data;
  }

  /**
   * Delete a gateway service
   * @param id - Service ID
   */
  async deleteService(id: string): Promise<void> {
    await this.delete(id);
  }

  /**
   * Test connection to a gateway service
   * @param id - Service ID
   */
  async testConnection(id: string): Promise<HealthCheckResult> {
    const response = await this.customPost(`/${id}/test`);
    return response.data;
  }

  /**
   * Get service health status
   * @param id - Service ID
   */
  async getServiceHealth(id: string): Promise<ServiceHealthStatus> {
    const response = await this.customGet(`/${id}/health`);
    return response.data;
  }

  /**
   * Get gateway statistics
   */
  async getStatistics(): Promise<GatewayStatistics> {
    const response = await this.customGet('/statistics');
    return response.data;
  }

  /**
   * Bulk enable/disable services
   * @param ids - Array of service IDs
   * @param enabled - Enable or disable
   */
  async bulkToggleServices(ids: string[], enabled: boolean): Promise<void> {
    await this.customPost('/bulk-toggle', { ids, enabled });
  }

  /**
   * Search services by tags
   * @param tags - Array of tags to search for
   */
  async searchByTags(tags: string[]): Promise<GatewayService[]> {
    const queryParams = new URLSearchParams();
    tags.forEach((tag) => queryParams.append('tags', tag));
    const response = await this.customGet(`/search?${queryParams.toString()}`);
    return response.data;
  }

  // Static methods for backward compatibility
  static async getServices(params?: any): Promise<GatewayService[]> {
    const response = await BaseApi.staticGetAll('/services', params);
    return response.data;
  }

  static async createService(service: Omit<GatewayService, 'id'>): Promise<GatewayService> {
    const response = await BaseApi.staticCreate('/services', service);
    return response.data;
  }

  static async updateService(
    id: string,
    service: Partial<GatewayService>
  ): Promise<GatewayService> {
    const response = await BaseApi.staticUpdate('/services', id, service);
    return response.data;
  }

  static async deleteService(id: string): Promise<void> {
    await BaseApi.staticDelete('/services', id);
  }
}

// Lazy singleton instance - created on first access to avoid circular dependency
let _gatewayApiInstance: GatewayApi | null = null;

export const gatewayApi = new Proxy({} as GatewayApi, {
  get(target, prop) {
    if (!_gatewayApiInstance) {
      _gatewayApiInstance = new GatewayApi();
    }
    return (_gatewayApiInstance as any)[prop];
  },
});
