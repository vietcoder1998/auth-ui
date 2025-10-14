// Admin API for user, token, role, permission, mail, notification, config
import { getApiInstance } from './index.ts';

export const adminApi = {
  async getUsers(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/users', { params });
  },
  async createUser(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/users', data);
  },
  async updateUser(email: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/users/${email}`, data);
  },
  async deleteUser(email: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/users/${email}`);
  },
  async getTokens(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/tokens', { params });
  },
  async createToken(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/tokens', data);
  },
  async grantToken(userId: string) {
    const axios = getApiInstance();
    return axios.post('/admin/tokens/grant', { userId });
  },
  async revokeToken(tokenId: string) {
    const axios = getApiInstance();
    return axios.post('/admin/tokens/revoke', { tokenId });
  },
  async getRoles(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/roles', { params });
  },
  async createRole(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/roles', data);
  },
  async updateRole(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/roles/${id}`, data);
  },
  async deleteRole(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/roles/${id}`);
  },
  async getPermissions(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/permissions', { params });
  },
  async createPermission(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/permissions', data);
  },
  async updatePermission(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/permissions/${id}`, data);
  },
  async deletePermission(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/permissions/${id}`);
  },
  async getMailTemplates(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/mail-templates', { params });
  },
  async createMailTemplate(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/mail-templates', data);
  },
  async deleteMailTemplate(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/mail-templates/${id}`);
  },
  async updateMailTemplate(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/mail-templates/${id}`, data);
  },
  async getNotificationTemplates(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/notification-templates', { params });
  },
  async createNotificationTemplate(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/notification-templates', data);
  },
  async updateNotificationTemplate(id: string | number, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/notification-templates/${id}`, data);
  },
  async deleteNotificationTemplate(id: string | number) {
    const axios = getApiInstance();
    return axios.delete(`/admin/notification-templates/${id}`);
  },
  async getConfig(params?: any) {
    const axios = getApiInstance();
    return axios.get('/config', { params });
  },
  async createConfig(data: any) {
    const axios = getApiInstance();
    return axios.post('/config', data);
  },
  async updateConfig(key: string, data: any) {
    const axios = getApiInstance();
    return axios.put('/config', { key, ...data });
  },
  async deleteConfig(key: string) {
    const axios = getApiInstance();
    return axios.delete(`/config/${key}`);
  },
  
  // Cache API methods
  async getCacheKeys(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/cache', { params });
  },
  async getCacheStats() {
    const axios = getApiInstance();
    return axios.get('/admin/cache/stats');
  },
  async getCacheValue(key: string) {
    const axios = getApiInstance();
    return axios.get(`/admin/cache/${encodeURIComponent(key)}`);
  },
  async setCacheValue(data: { key: string; value: any; ttl?: number }) {
    const axios = getApiInstance();

    return axios.post('/admin/cache', data);
  },
  async deleteCacheKey(key: string) {
    const axios = getApiInstance();

    return axios.delete(`/admin/cache/${encodeURIComponent(key)}`);
  },
  async clearAllCache() {
    const axios = getApiInstance();

    return axios.delete('/admin/cache');
  },
  async clearCacheByPattern(pattern: string) {
    const axios = getApiInstance();

    return axios.post('/admin/cache/clear', { pattern });
  },
  
  // User impersonation
  async loginAsUser(email: string) {
    const axios = getApiInstance();

    return axios.post('/admin/users/login-as', { email });
  },
};
