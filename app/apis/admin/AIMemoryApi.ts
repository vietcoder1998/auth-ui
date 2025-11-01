// AI Memory API routes
// Usage: adminApi.getAgentMemories({ q })

import { BaseApi } from './BaseApi.ts';

export class AIMemoryApi {
  static async getAgentMemories(params?: { q?: string; agentId?: string }) {
    // Adjust endpoint as needed
    const response = await BaseApi.staticGetAll('/admin/memories', { params });

    return response.data;
  }
  // Add more CRUD methods as needed
}
