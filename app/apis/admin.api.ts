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
  async updateUser(email: string, data: any) {
    return axios.put(`/admin/users/${email}`, data);
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
  async grantToken(userId: string) {
    return axios.post('/admin/tokens/grant', { userId });
  },
  async revokeToken(tokenId: string) {
    return axios.post('/admin/tokens/revoke', { tokenId });
  },
  async getRoles(params?: any) {
    return axios.get('/admin/roles', { params });
  },
  async createRole(data: any) {
    return axios.post('/admin/roles', data);
  },
  async updateRole(id: string | number, data: any) {
    return axios.put(`/admin/roles/${id}`, data);
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
  async updatePermission(id: string | number, data: any) {
    return axios.put(`/admin/permissions/${id}`, data);
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
  async updateMailTemplate(id: string | number, data: any) {
    return axios.put(`/admin/mail-templates/${id}`, data);
  },
  async getNotificationTemplates(params?: any) {
    return axios.get('/admin/notification-templates', { params });
  },
  async createNotificationTemplate(data: any) {
    return axios.post('/admin/notification-templates', data);
  },
  async updateNotificationTemplate(id: string | number, data: any) {
    return axios.put(`/admin/notification-templates/${id}`, data);
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
  async updateConfig(key: string, data: any) {
    return axios.put('/config', { key, ...data });
  },
  async deleteConfig(key: string) {
    return axios.delete(`/config/${key}`);
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
  
  // User impersonation
  async loginAsUser(email: string) {
    return axios.post('/admin/users/login-as', { email });
  },
};
