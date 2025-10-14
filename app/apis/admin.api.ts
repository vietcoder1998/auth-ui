// Admin API for user, token, role, permission, mail, notification, config
import { getApiInstance } from './index.ts';

const axios = getApiInstance();

export const adminApi = {
  async getUsers(params?: any) {
    return axios.get('/admin/users', { params });
  },
  async createUser(data: any) {
    return axios.post('/admin/users', data);
  },
  async deleteUser(email: string) {
    return axios.delete(`/admin/users/${email}`);
  },
  async getTokens(params?: any) {
    return axios.get('/admin/tokens', { params });
  },
  async createToken(data: any) {
    return axios.post('/admin/tokens', data);
  },
  async revokeToken(token: string) {
    return axios.delete(`/admin/tokens/${token}`);
  },
  async getRoles(params?: any) {
    return axios.get('/admin/roles', { params });
  },
  async createRole(data: any) {
    return axios.post('/admin/roles', data);
  },
  async deleteRole(id: string | number) {
    return axios.delete(`/admin/roles/${id}`);
  },
  async getPermissions(params?: any) {
    return axios.get('/admin/permissions', { params });
  },
  async createPermission(data: any) {
    return axios.post('/admin/permissions', data);
  },
  async deletePermission(id: string | number) {
    return axios.delete(`/admin/permissions/${id}`);
  },
  async getMailTemplates(params?: any) {
    return axios.get('/admin/mail-templates', { params });
  },
  async createMailTemplate(data: any) {
    return axios.post('/admin/mail-templates', data);
  },
  async deleteMailTemplate(id: string | number) {
    return axios.delete(`/admin/mail-templates/${id}`);
  },
  async getNotificationTemplates(params?: any) {
    return axios.get('/admin/notification-templates', { params });
  },
  async createNotificationTemplate(data: any) {
    return axios.post('/admin/notification-templates', data);
  },
  async deleteNotificationTemplate(id: string | number) {
    return axios.delete(`/admin/notification-templates/${id}`);
  },
  async getConfig(params?: any) {
    return axios.get('/config', { params });
  },
  async createConfig(data: any) {
    return axios.post('/config', data);
  },
  async updateConfig(id: string | number, data: any) {
    return axios.put(`/config/${id}`, data);
  },
  async deleteConfig(id: string | number) {
    return axios.delete(`/config/${id}`);
  },
  
  // Cache API methods
  async getCacheKeys(params?: any) {
    return axios.get('/admin/cache', { params });
  },
  async getCacheStats() {
    return axios.get('/admin/cache/stats');
  },
  async getCacheValue(key: string) {
    return axios.get(`/admin/cache/${encodeURIComponent(key)}`);
  },
  async setCacheValue(data: { key: string; value: any; ttl?: number }) {
    return axios.post('/admin/cache', data);
  },
  async deleteCacheKey(key: string) {
    return axios.delete(`/admin/cache/${encodeURIComponent(key)}`);
  },
  async clearAllCache() {
    return axios.delete('/admin/cache');
  },
  async clearCacheByPattern(pattern: string) {
    return axios.post('/admin/cache/clear', { pattern });
  },
};
