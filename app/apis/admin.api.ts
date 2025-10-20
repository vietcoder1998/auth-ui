
import { AgentApi } from './adminApi/AgentApi.ts';
import { ApiKeyApi } from './adminApi/ApiKeyApi.ts';
import { CacheApi } from './adminApi/CacheApi.ts';
import { ConfigApi } from './adminApi/ConfigApi.ts';
import { ConversationApi } from './adminApi/ConversationApi.ts';
import { DatabaseConnectionApi } from './adminApi/DatabaseConnectionApi.ts';
import { LogApi } from './adminApi/LogApi.ts';
import { LogicHistoryApi } from './adminApi/LogicHistoryApi.ts';
import { LoginHistoryApi } from './adminApi/LoginHistoryApi.ts';
import { MailApi } from './adminApi/MailApi.ts';
import { NotificationApi } from './adminApi/NotificationApi.ts';
import { PermissionApi } from './adminApi/PermissionApi.ts';
import { PromptHistoryApi } from './adminApi/PromptHistoryApi.ts';
import { RoleApi } from './adminApi/RoleApi.ts';
import { SeedApi } from './adminApi/SeedApi.ts';
import { SocketApi } from './adminApi/SocketApi.ts';
import { SSOApi } from './adminApi/SSOApi.ts';
import { TokenApi } from './adminApi/TokenApi.ts';
import { UserApi } from './adminApi/UserApi.ts';
export { AgentApi, ApiKeyApi, CacheApi, ConfigApi, ConversationApi, DatabaseConnectionApi, LogApi, LogicHistoryApi, LoginHistoryApi, MailApi, NotificationApi, PermissionApi, PromptHistoryApi, RoleApi, SeedApi, SocketApi, SSOApi, TokenApi, UserApi };

export const adminApi = {
  // UserApi
  getUsers: UserApi.getUsers,
  createUser: UserApi.createUser,
  updateUser: UserApi.updateUser,
  deleteUser: UserApi.deleteUser,
  loginAsUser: UserApi.loginAsUser,
  validateUserToken: UserApi.validateUserToken,

  // TokenApi
  getTokens: TokenApi.getTokens,
  createToken: TokenApi.createToken,
  grantToken: TokenApi.grantToken,
  revokeToken: TokenApi.revokeToken,

  // RoleApi
  getRoles: RoleApi.getRoles,
  createRole: RoleApi.createRole,
  updateRole: RoleApi.updateRole,
  deleteRole: RoleApi.deleteRole,
  getPermissionsNotInRole: RoleApi.getPermissionsNotInRole,
  addPermissionsToRole: RoleApi.addPermissionsToRole,

  // PermissionApi
  getPermissions: PermissionApi.getPermissions,
  createPermission: PermissionApi.createPermission,
  updatePermission: PermissionApi.updatePermission,
  deletePermission: PermissionApi.deletePermission,

  // MailApi
  getMailTemplates: MailApi.getMailTemplates,
  createMailTemplate: MailApi.createMailTemplate,
  deleteMailTemplate: MailApi.deleteMailTemplate,
  updateMailTemplate: MailApi.updateMailTemplate,
  getMails: MailApi.getMails,
  getMailStats: MailApi.getMailStats,
  createMail: MailApi.createMail,
  updateMail: MailApi.updateMail,
  deleteMail: MailApi.deleteMail,
  markMailAsSent: MailApi.markMailAsSent,
  markMailAsFailed: MailApi.markMailAsFailed,
  resendMail: MailApi.resendMail,

  // NotificationApi
  getNotificationTemplates: NotificationApi.getNotificationTemplates,
  createNotificationTemplate: NotificationApi.createNotificationTemplate,
  updateNotificationTemplate: NotificationApi.updateNotificationTemplate,
  deleteNotificationTemplate: NotificationApi.deleteNotificationTemplate,

  // ConfigApi
  getConfig: ConfigApi.getConfig,
  createConfig: ConfigApi.createConfig,
  updateConfig: ConfigApi.updateConfig,
  deleteConfig: ConfigApi.deleteConfig,
  getHealthStatus: ConfigApi.getHealthStatus,

  // CacheApi
  getCacheKeys: CacheApi.getCacheKeys,
  getCacheStats: CacheApi.getCacheStats,
  getCacheValue: CacheApi.getCacheValue,
  setCacheValue: CacheApi.setCacheValue,
  deleteCacheKey: CacheApi.deleteCacheKey,
  clearAllCache: CacheApi.clearAllCache,
  clearCacheByPattern: CacheApi.clearCacheByPattern,

  // SSOApi
  getSSOEntries: SSOApi.getSSOEntries,
  getSSOStats: SSOApi.getSSOStats,
  createSSO: SSOApi.createSSO,
  updateSSO: SSOApi.updateSSO,
  deleteSSO: SSOApi.deleteSSO,
  regenerateSSORKey: SSOApi.regenerateSSORKey,
  simulateSSOLogin: SSOApi.simulateSSOLogin,
  validateSSOKey: SSOApi.validateSSOKey,

  // LoginHistoryApi
  getLoginHistory: LoginHistoryApi.getLoginHistory,
  getLoginStats: LoginHistoryApi.getLoginStats,
  createLoginHistory: LoginHistoryApi.createLoginHistory,
  updateLoginHistory: LoginHistoryApi.updateLoginHistory,
  logoutUser: LoginHistoryApi.logoutUser,

  // LogicHistoryApi
  getLogicHistory: LogicHistoryApi.getLogicHistory,
  getLogicHistoryStats: LogicHistoryApi.getLogicHistoryStats,
  createLogicHistory: LogicHistoryApi.createLogicHistory,
  updateLogicHistory: LogicHistoryApi.updateLogicHistory,
  markNotificationSent: LogicHistoryApi.markNotificationSent,

  // ApiKeyApi
  getApiKeys: ApiKeyApi.getApiKeys,
  createApiKey: ApiKeyApi.createApiKey,
  updateApiKey: ApiKeyApi.updateApiKey,
  deleteApiKey: ApiKeyApi.deleteApiKey,
  regenerateApiKey: ApiKeyApi.regenerateApiKey,
  getApiKeyStats: ApiKeyApi.getApiKeyStats,
  getApiKeyLogs: ApiKeyApi.getApiKeyLogs,

  // AgentApi
  getAgents: AgentApi.getAgents,
  createAgent: AgentApi.createAgent,
  updateAgent: AgentApi.updateAgent,
  deleteAgent: AgentApi.deleteAgent,
  getAgentMemories: AgentApi.getAgentMemories,
  createAgentMemory: AgentApi.createAgentMemory,

  // ConversationApi
  getConversations: ConversationApi.getConversations,
  getConversation: ConversationApi.getConversation,
  createConversation: ConversationApi.createConversation,
  updateConversation: ConversationApi.updateConversation,
  deleteConversation: ConversationApi.deleteConversation,
  sendMessage: ConversationApi.sendMessage,
  getMessages: ConversationApi.getMessages,

  // SeedApi
  getSeedStats: SeedApi.getSeedStats,
  getSeedData: SeedApi.getSeedData,
  seedAll: SeedApi.seedAll,
  seedPermissions: SeedApi.seedPermissions,
  seedRoles: SeedApi.seedRoles,
  seedUsers: SeedApi.seedUsers,
  seedConfigs: SeedApi.seedConfigs,
  seedAgents: SeedApi.seedAgents,
  seedApiKeys: SeedApi.seedApiKeys,
  clearAllData: SeedApi.clearAllData,

  // LogApi
  getLogs: LogApi.getLogs,
  getLogStats: LogApi.getLogStats,
  exportLogs: LogApi.exportLogs,
  clearOldLogs: LogApi.clearOldLogs,
  createLogEntry: LogApi.createLogEntry,

  // DatabaseConnectionApi
  getDatabaseConnections: DatabaseConnectionApi.getDatabaseConnections,
  createDatabaseConnection: DatabaseConnectionApi.createDatabaseConnection,
  updateDatabaseConnection: DatabaseConnectionApi.updateDatabaseConnection,
  deleteDatabaseConnection: DatabaseConnectionApi.deleteDatabaseConnection,
  testDatabaseConnection: DatabaseConnectionApi.testDatabaseConnection,
  checkDatabaseConnection: DatabaseConnectionApi.checkDatabaseConnection,
  createDatabaseBackup: DatabaseConnectionApi.createDatabaseBackup,
  getDatabaseConnectionStats: DatabaseConnectionApi.getDatabaseConnectionStats,

  // SocketApi
  getSockets: SocketApi.getSockets,
  createSocket: SocketApi.createSocket,
  updateSocket: SocketApi.updateSocket,
  deleteSocket: SocketApi.deleteSocket,
  getSocketEvents: SocketApi.getSocketEvents,
  createSocketEvent: SocketApi.createSocketEvent,
  deleteSocketEvent: SocketApi.deleteSocketEvent,
  pingSocket: SocketApi.pingSocket,
  testSocketEvent: SocketApi.testSocketEvent,
  searchAll: SocketApi.searchAll,

  // PromptHistoryApi
  getPrompts: PromptHistoryApi.getPrompts,
  createPrompt: PromptHistoryApi.createPrompt,
  updatePrompt: PromptHistoryApi.updatePrompt,
  deletePrompt: PromptHistoryApi.deletePrompt,
};
