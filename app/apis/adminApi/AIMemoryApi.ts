// AI Memory API routes
// Usage: adminApi.getAgentMemories({ q })

import { getApiInstance } from '../index.ts';

export class AIMemoryApi {
  static async getAgentMemories(params?: { q?: string; agentId?: string }) {
    // Adjust endpoint as needed
    const api = getApiInstance();
    const response = await api.get('/admin/agents/memories', { params });
    return response.data;
  }
  // Add more CRUD methods as needed
}
