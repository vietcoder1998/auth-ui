import { FaqApi } from './FaqApi.ts';
import { FileApi } from './FileApi.ts';
import { JobApi } from './JobApi.ts';
import { SystemApi } from './SystemApi.ts';
import { AgentApi } from './AgentApi.ts';
import { AIMemoryApi } from './AIMemoryApi.ts';
import { AIModelApiInstance } from './AIModelApi.ts';
import { AIPlatformApi } from './AIPlatformApi.ts';
import { ApiKeyApi } from './ApiKeyApi.ts';
import { BillingApi } from './BillingApi.ts';
import { CacheApi } from './CacheApi.ts';
import { ConfigApi } from './ConfigApi.ts';
import { ConversationApi } from './ConversationApi.ts';
import { DatabaseConnectionApi } from './DatabaseConnectionApi.ts';
import { LogApi } from './LogApi.ts';
import { LogicHistoryApi } from './LogicHistoryApi.ts';
import { LoginHistoryApi } from './LoginHistoryApi.ts';
import { MailApi } from './MailApi.ts';
import { NotificationApi } from './NotificationApi.ts';
import { PermissionApi } from './PermissionApi.ts';
import { PermissionGroupApiInstance } from './PermissionGroupApi.ts';
import { PromptHistoryApi } from './PromptHistoryApi.ts';
import { RoleApi } from './RoleApi.ts';
import { SeedApi } from './SeedApi.ts';
import { SocketApi } from './SocketApi.ts';
import { SSOApi } from './SSOApi.ts';
import { TokenApi } from './TokenApi.ts';
import { ToolApi } from './ToolApi.ts';
import { ToolCommandApi } from './ToolCommandApi.ts';
import { UserApi } from './UserApi.ts';
import { EntityApi } from './EntityApi.ts';
import { AIKeyApi } from './AIKeyApi.ts';

// Notification CRUD
export {
  AgentApi,
  AIMemoryApi,
  ApiKeyApi,
  CacheApi,
  ConfigApi,
  ConversationApi,
  DatabaseConnectionApi,
  LogApi,
  LogicHistoryApi,
  LoginHistoryApi,
  MailApi,
  NotificationApi,
  PermissionApi,
  PromptHistoryApi,
  RoleApi,
  SeedApi,
  SocketApi,
  SSOApi,
  TokenApi,
  ToolApi,
  ToolCommandApi,
  AIKeyApi,
};

export class AdminApi {
  // AIModelApi (for /ai-models)
  getAIModels = AIModelApiInstance.getAIModels.bind(AIModelApiInstance);
  createAIModel = AIModelApiInstance.createAIModel.bind(AIModelApiInstance);
  updateAIModel = AIModelApiInstance.updateAIModel.bind(AIModelApiInstance);
  deleteAIModel = AIModelApiInstance.deleteAIModel.bind(AIModelApiInstance);
  // AIKeyApi (for /ai-keys)
  getAIKeys = AIKeyApi.getAIKeys.bind(AIKeyApi);
  createAIKey = AIKeyApi.createAIKey.bind(AIKeyApi);
  updateAIKey = AIKeyApi.updateAIKey.bind(AIKeyApi);
  deleteAIKey = AIKeyApi.deleteAIKey.bind(AIKeyApi);
  // UserApi
  getUsers = UserApi.getUsers;
  createUser = UserApi.createUser;
  updateUser = UserApi.updateUser;
  deleteUser = UserApi.deleteUser;
  loginAsUser = UserApi.loginAsUser;
  validateUserToken = UserApi.validateUserToken;

  // TokenApi
  getTokens = TokenApi.getTokens;
  createToken = TokenApi.createToken;
  grantToken = TokenApi.grantToken;
  revokeToken = TokenApi.revokeToken;
  revokeRefreshToken = TokenApi.revokeRefreshToken;
  generateAccessTokenFromRefresh = TokenApi.generateAccessTokenFromRefresh;

  // RoleApi
  getRoles = RoleApi.getRoles;
  createRole = RoleApi.createRole;
  updateRole = RoleApi.updateRole;
  deleteRole = RoleApi.deleteRole;
  getPermissionsNotInRole = RoleApi.getPermissionsNotInRole;
  addPermissionsToRole = RoleApi.addPermissionsToRole;

  // PermissionApi
  getPermissions = PermissionApi.getPermissions;
  createPermission = PermissionApi.createPermission;
  updatePermission = PermissionApi.updatePermission;
  deletePermission = PermissionApi.deletePermission;

  // PermissionGroupApi
  getPermissionGroups = PermissionGroupApiInstance.getPermissionGroups.bind(
    PermissionGroupApiInstance
  );
  createPermissionGroup = PermissionGroupApiInstance.createPermissionGroup.bind(
    PermissionGroupApiInstance
  );
  getPermissionGroupById = PermissionGroupApiInstance.getPermissionGroupById.bind(
    PermissionGroupApiInstance
  );
  updatePermissionGroup = PermissionGroupApiInstance.updatePermissionGroup.bind(
    PermissionGroupApiInstance
  );
  deletePermissionGroup = PermissionGroupApiInstance.deletePermissionGroup.bind(
    PermissionGroupApiInstance
  );
  getPermissionsNotInGroup = PermissionGroupApiInstance.getPermissionsNotInGroup.bind(
    PermissionGroupApiInstance
  );
  addPermissionsToGroup = PermissionGroupApiInstance.addPermissionsToGroup.bind(
    PermissionGroupApiInstance
  );
  removePermissionsFromGroup = PermissionGroupApiInstance.removePermissionsFromGroup.bind(
    PermissionGroupApiInstance
  );
  assignGroupToRole = PermissionGroupApiInstance.assignGroupToRole.bind(PermissionGroupApiInstance);
  unassignGroupFromRole = PermissionGroupApiInstance.unassignGroupFromRole.bind(
    PermissionGroupApiInstance
  );
  getGroupsByRole = PermissionGroupApiInstance.getGroupsByRole.bind(PermissionGroupApiInstance);

  // MailApi
  getMailTemplates = MailApi.getMailTemplates;
  createMailTemplate = MailApi.createMailTemplate;
  deleteMailTemplate = MailApi.deleteMailTemplate;
  updateMailTemplate = MailApi.updateMailTemplate;
  getMails = MailApi.getMails;
  getMailStats = MailApi.getMailStats;
  createMail = MailApi.createMail;
  updateMail = MailApi.updateMail;
  deleteMail = MailApi.deleteMail;
  markMailAsSent = MailApi.markMailAsSent;
  markMailAsFailed = MailApi.markMailAsFailed;
  resendMail = MailApi.resendMail;

  // NotificationApi
  getNotificationTemplates = NotificationApi.getNotificationTemplates;
  createNotificationTemplate = NotificationApi.createNotificationTemplate;
  updateNotificationTemplate = NotificationApi.updateNotificationTemplate;
  deleteNotificationTemplate = NotificationApi.deleteNotificationTemplate;

  // ConfigApi
  getConfig = ConfigApi.getConfig;
  createConfig = ConfigApi.createConfig;
  updateConfig = ConfigApi.updateConfig;
  deleteConfig = ConfigApi.deleteConfig;
  getHealthStatus = ConfigApi.getHealthStatus;

  // CacheApi
  getCacheKeys = CacheApi.getCacheKeys;
  getCacheStats = CacheApi.getCacheStats;
  getCacheValue = CacheApi.getCacheValue;
  setCacheValue = CacheApi.setCacheValue;
  deleteCacheKey = CacheApi.deleteCacheKey;
  clearAllCache = CacheApi.clearAllCache;
  clearCacheByPattern = CacheApi.clearCacheByPattern;

  // SSOApi
  getSSOEntries = SSOApi.getSSOEntries;
  getSSOStats = SSOApi.getSSOStats;
  createSSO = SSOApi.createSSO;
  updateSSO = SSOApi.updateSSO;
  deleteSSO = SSOApi.deleteSSO;
  regenerateSSORKey = SSOApi.regenerateSSORKey;
  simulateSSOLogin = SSOApi.simulateSSOLogin;
  validateSSOKey = SSOApi.validateSSOKey;

  // LoginHistoryApi
  getLoginHistory = LoginHistoryApi.getLoginHistory;
  getLoginStats = LoginHistoryApi.getLoginStats;
  createLoginHistory = LoginHistoryApi.createLoginHistory;
  updateLoginHistory = LoginHistoryApi.updateLoginHistory;
  logoutUser = LoginHistoryApi.logoutUser;

  // LogicHistoryApi
  getLogicHistory = LogicHistoryApi.getLogicHistory;
  getLogicHistoryStats = LogicHistoryApi.getLogicHistoryStats;
  createLogicHistory = LogicHistoryApi.createLogicHistory;
  updateLogicHistory = LogicHistoryApi.updateLogicHistory;
  markNotificationSent = LogicHistoryApi.markNotificationSent;

  // ApiKeyApi
  getApiKeys = ApiKeyApi.getApiKeys;
  createApiKey = ApiKeyApi.createApiKey;
  updateApiKey = ApiKeyApi.updateApiKey;
  deleteApiKey = ApiKeyApi.deleteApiKey;
  regenerateApiKey = ApiKeyApi.regenerateApiKey;
  getApiKeyStats = ApiKeyApi.getApiKeyStats;
  getApiKeyLogs = ApiKeyApi.getApiKeyLogs;

  // AgentApi
  getAgents = AgentApi.getAgents;
  createAgent = AgentApi.createAgent;
  updateAgent = AgentApi.updateAgent;
  deleteAgent = AgentApi.deleteAgent;
  createAgentMemory = AgentApi.createAgentMemory;

  // ConversationApi
  getConversations = ConversationApi.getConversations;
  getConversation = ConversationApi.getConversation;
  createConversation = ConversationApi.createConversation;
  updateConversation = ConversationApi.updateConversation;
  deleteConversation = ConversationApi.deleteConversation;
  sendMessage = ConversationApi.sendMessage;
  getMessages = ConversationApi.getMessages;

  // SeedApi
  getSeedStats = SeedApi.getSeedStats;
  getSeedData = SeedApi.getSeedData;
  getSeedProgress = SeedApi.getSeedProgress;
  seedAll = SeedApi.seedAll;
  seedPermissions = SeedApi.seedPermissions;
  seedRoles = SeedApi.seedRoles;
  seedUsers = SeedApi.seedUsers;
  seedConfigs = SeedApi.seedConfigs;
  seedAgents = SeedApi.seedAgents;
  seedApiKeys = SeedApi.seedApiKeys;
  clearAllData = SeedApi.clearAllData;

  // LogApi
  getLogs = LogApi.getLogs;
  getLogStats = LogApi.getLogStats;
  exportLogs = LogApi.exportLogs;
  clearOldLogs = LogApi.clearOldLogs;
  createLogEntry = LogApi.createLogEntry;

  // DatabaseConnectionApi
  getDatabaseConnections = DatabaseConnectionApi.getDatabaseConnections;
  createDatabaseConnection = DatabaseConnectionApi.createDatabaseConnection;
  updateDatabaseConnection = DatabaseConnectionApi.updateDatabaseConnection;
  deleteDatabaseConnection = DatabaseConnectionApi.deleteDatabaseConnection;
  testDatabaseConnection = DatabaseConnectionApi.testDatabaseConnection;
  checkDatabaseConnection = DatabaseConnectionApi.checkDatabaseConnection;
  createDatabaseBackup = DatabaseConnectionApi.createDatabaseBackup;
  getDatabaseConnectionStats = DatabaseConnectionApi.getDatabaseConnectionStats;

  // SocketApi
  getSockets = SocketApi.getSockets;
  createSocket = SocketApi.createSocket;
  updateSocket = SocketApi.updateSocket;
  deleteSocket = SocketApi.deleteSocket;
  getSocketEvents = SocketApi.getSocketEvents;
  createSocketEvent = SocketApi.createSocketEvent;
  deleteSocketEvent = SocketApi.deleteSocketEvent;
  pingSocket = SocketApi.pingSocket;
  testSocketEvent = SocketApi.testSocketEvent;
  // AIMemoryApi
  getAgentMemories = AIMemoryApi.getAgentMemories;
  // FileApi
  getFiles = FileApi.getFiles;

  searchAll = EntityApi.staticGetAll;

  // PromptHistoryApi
  getPrompts = PromptHistoryApi.getPrompts;
  createPrompt = PromptHistoryApi.createPrompt;
  updatePrompt = PromptHistoryApi.updatePrompt;
  deletePrompt = PromptHistoryApi.deletePrompt;

  // FAQ API
  getFaqs = FaqApi.getFaqs;
  createFaq = FaqApi.createFaq;
  updateFaq = FaqApi.updateFaq;
  deleteFaq = FaqApi.deleteFaq;
  getJobs = JobApi.getJobs;
  createJob = JobApi.createJob;
  startJob = JobApi.startJob;
  restartJob = JobApi.restartJob;
  cancelJob = JobApi.cancelJob;
  getNotifications = NotificationApi.getNotifications;
  createNotification = NotificationApi.createNotification;
  updateNotification = NotificationApi.updateNotification;
  deleteNotification = NotificationApi.deleteNotification;

  // AIPlatformApi
  getAIPlatforms = AIPlatformApi.getAIPlatforms;
  createAIPlatform = AIPlatformApi.createAIPlatform;
  updateAIPlatform = AIPlatformApi.updateAIPlatform;
  deleteAIPlatform = AIPlatformApi.deleteAIPlatform;

  // BillingApi
  getBillings = BillingApi.getBillings;
  createBilling = BillingApi.createBilling;
  updateBilling = BillingApi.updateBilling;
  deleteBilling = BillingApi.deleteBilling;

  // System: Restart server
  restartServer = SystemApi.restartServer;

  // ToolApi - CRUD for tools
  getTools = ToolApi.getTools;
  createTool = ToolApi.createTool;
  updateTool = ToolApi.updateTool;
  deleteTool = ToolApi.deleteTool;

  // ToolCommandApi - CRUD for tool commands
  getToolCommands = ToolCommandApi.getToolCommands;
  getToolCommandById = ToolCommandApi.getToolCommandById;
  getToolCommandsByToolId = ToolCommandApi.getToolCommandsByToolId;
  createToolCommand = ToolCommandApi.createToolCommand;
  updateToolCommand = ToolCommandApi.updateToolCommand;
  deleteToolCommand = ToolCommandApi.deleteToolCommand;
  toggleToolCommand = ToolCommandApi.toggleToolCommand;
  executeToolCommand = ToolCommandApi.executeToolCommand;
  getToolCommandHistory = ToolCommandApi.getToolCommandHistory;
}

export const adminApi = new AdminApi();
