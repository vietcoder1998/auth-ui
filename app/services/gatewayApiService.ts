// API service for Gateway Management
interface GatewayService {
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

class GatewayApiService {
  private baseUrl: string;

  constructor() {
    // Use environment variable from Vite or default to localhost
    this.baseUrl = import.meta.env.VITE_GATEWAY_SERVICE_URL || 'http://localhost:3003/api/v1';
  }

  /**
   * Get all gateway services
   */
  async getServices(): Promise<GatewayService[]> {
    try {
      const response = await fetch(`${this.baseUrl}/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  }

  /**
   * Create a new gateway service
   */
  async createService(service: Omit<GatewayService, 'id'>): Promise<GatewayService> {
    try {
      const response = await fetch(`${this.baseUrl}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  }

  /**
   * Update an existing gateway service
   */
  async updateService(id: string, service: Partial<GatewayService>): Promise<GatewayService> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    }
  }

  /**
   * Delete a gateway service
   */
  async deleteService(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    }
  }

  /**
   * Test connection to a gateway service
   */
  async testConnection(id: string): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to test connection:', error);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(id: string): Promise<{
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastChecked?: string;
    responseTime?: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get service health:', error);
      throw error;
    }
  }

  /**
   * Get gateway statistics
   */
  async getStatistics(): Promise<{
    totalServices: number;
    enabledServices: number;
    healthyServices: number;
    unhealthyServices: number;
    averageResponseTime: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/services/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const gatewayApiService = new GatewayApiService();
export type { GatewayService };
