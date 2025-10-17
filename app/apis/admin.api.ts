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
  async getPermissionsNotInRole(roleId: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/roles/${roleId}/permissions/available`, { params });
  },
  async addPermissionsToRole(roleId: string, permissionIds: string[]) {
    const axios = getApiInstance();
    return axios.post(`/admin/roles/${roleId}/permissions/add`, { permissionIds });
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
  
  // Token validation for impersonation
  async validateUserToken(token: string) {
    const axios = getApiInstance();
    return axios.post('/admin/users/validate-token', { token });
  },

  // SSO Management
  async getSSOEntries(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/sso', { params });
  },
  async getSSOStats() {
    const axios = getApiInstance();
    return axios.get('/admin/sso/stats');
  },
  async createSSO(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/sso', data);
  },
  async updateSSO(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/sso/${id}`, data);
  },
  async deleteSSO(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/sso/${id}`);
  },
  async regenerateSSORKey(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/sso/${id}/regenerate-key`);
  },

  // Login History Management
  async getLoginHistory(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/login-history', { params });
  },
  async getLoginStats() {
    const axios = getApiInstance();
    return axios.get('/admin/login-history/stats');
  },
  async createLoginHistory(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/login-history', data);
  },
  async updateLoginHistory(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/login-history/${id}`, data);
  },
  async logoutUser(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/login-history/${id}/logout`);
  },

  // Logic History Management
  async getLogicHistory(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/logic-history', { params });
  },
  async getLogicHistoryStats() {
    const axios = getApiInstance();
    return axios.get('/admin/logic-history/stats');
  },
  async createLogicHistory(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/logic-history', data);
  },
  async updateLogicHistory(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/logic-history/${id}`, data);
  },
  async markNotificationSent(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/logic-history/${id}/notification-sent`);
  },

  // SSO Simulation
  async simulateSSOLogin(ssoKey: string, loginData?: any) {
    const axios = getApiInstance();
    return axios.post('/sso/login', loginData || {
      deviceIP: '127.0.0.1',
      userAgent: navigator.userAgent,
      location: 'Admin Panel Simulator',
    }, {
      headers: {
        'x-sso-key': ssoKey,
      }
    });
  },

  // SSO Key Validation
  async validateSSOKey(keyOrSsoKey: string, gmail?: string) {
    const axios = getApiInstance();
    // Send both 'key' and 'ssoKey' for compatibility, plus Gmail verification
    return axios.post('/sso/validate-key', {
      key: keyOrSsoKey,
      ssoKey: keyOrSsoKey,
      gmail: gmail,
    });
  },

  // Mail Management
  async getMails(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/mails', { params });
  },
  async getMailStats() {
    const axios = getApiInstance();
    return axios.get('/admin/mails/stats');
  },
  async createMail(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/mails', data);
  },
  async updateMail(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/mails/${id}`, data);
  },
  async deleteMail(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/mails/${id}`);
  },
  async markMailAsSent(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/mails/${id}/sent`);
  },
  async markMailAsFailed(id: string, data: any) {
    const axios = getApiInstance();
    return axios.patch(`/admin/mails/${id}/failed`, data);
  },
  async resendMail(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/mails/${id}/resend`);
  },

  // API Key management
  async getApiKeys(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/api-keys', { params });
  },
  async createApiKey(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/api-keys', data);
  },
  async updateApiKey(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/api-keys/${id}`, data);
  },
  async deleteApiKey(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/api-keys/${id}`);
  },
  async regenerateApiKey(id: string) {
    const axios = getApiInstance();
    return axios.patch(`/admin/api-keys/${id}/regenerate`);
  },
  async getApiKeyStats() {
    const axios = getApiInstance();
    return axios.get('/admin/api-keys/stats');
  },
  async getApiKeyLogs(id: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/api-keys/${id}/logs`, { params });
  },

  // AI Agents Management
  async getAgents(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/agents', { params });
  },
  async createAgent(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/agents', data);
  },
  async updateAgent(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/agents/${id}`, data);
  },
  async deleteAgent(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/agents/${id}`);
  },
  async getAgentMemories(id: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/agents/${id}/memories`, { params });
  },
  async createAgentMemory(id: string, data: any) {
    const axios = getApiInstance();
    return axios.post(`/admin/agents/${id}/memories`, data);
  },

  // Conversations Management
  async getConversations(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/conversations', { params });
  },
  async getConversation(id: string) {
    const axios = getApiInstance();
    return axios.get(`/admin/conversations/${id}`);
  },
  async createConversation(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/conversations', data);
  },
  async updateConversation(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/conversations/${id}`, data);
  },
  async deleteConversation(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/conversations/${id}`);
  },
  async sendMessage(conversationId: string, data: any) {
    const axios = getApiInstance();
    return axios.post(`/admin/conversations/${conversationId}/messages`, data);
  },
  async getMessages(conversationId: string, params?: any) {
    const axios = getApiInstance();
    return axios.get(`/admin/conversations/${conversationId}/messages`, { params });
  },

  // Database Seed Management
  async getSeedStats() {
    const axios = getApiInstance();
    return axios.get('/admin/seed/stats');
  },
  async getSeedData() {
    const axios = getApiInstance();
    return axios.get('/admin/seed/data');
  },
  async seedAll() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/all');
  },
  async seedPermissions() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/permissions');
  },
  async seedRoles() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/roles');
  },
  async seedUsers() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/users');
  },
  async seedConfigs() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/configs');
  },
  async seedAgents() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/agents');
  },
  async seedApiKeys() {
    const axios = getApiInstance();
    return axios.post('/admin/seed/api-keys');
  },
  async clearAllData(confirmation: string = 'DELETE_ALL_DATA') {
    const axios = getApiInstance();
    return axios.delete('/admin/seed/clear-all', {
      data: { confirm: confirmation }
    });
  },

  // Log Management APIs
  async getLogs(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/logs', { params });
  },
  async getLogStats() {
    const axios = getApiInstance();
    return axios.get('/admin/logs/stats');
  },
  async exportLogs(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/logs/export', { params });
  },
  async clearOldLogs(daysToKeep: number) {
    const axios = getApiInstance();
    return axios.delete('/admin/logs/clear', {
      data: { daysToKeep }
    });
  },
  async createLogEntry(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/logs', data);
  },
};
