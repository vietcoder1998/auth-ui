import { getApiInstance } from '../index.ts';

export class CacheApi {
  static async getCacheKeys(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/cache', { params });
  }
  static async getCacheStats() {
    const axios = getApiInstance();
    return axios.get('/admin/cache/stats');
  }
  static async getCacheValue(key: string) {
    const axios = getApiInstance();
    return axios.get(`/admin/cache/${encodeURIComponent(key)}`);
  }
  static async setCacheValue(data: { key: string; value: any; ttl?: number }) {
    const axios = getApiInstance();
    return axios.post('/admin/cache', data);
  }
  static async deleteCacheKey(key: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/cache/${encodeURIComponent(key)}`);
  }
  static async clearAllCache() {
    const axios = getApiInstance();
    return axios.delete('/admin/cache');
  }
  static async clearCacheByPattern(pattern: string) {
    const axios = getApiInstance();
    return axios.post('/admin/cache/clear', { pattern });
  }
}
