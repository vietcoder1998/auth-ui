import { PermissionInfo } from '~/types/permissions.ts';

// Resource mappings constant (moved outside for reusability)
const RESOURCE_MAPPINGS: Record<string, { resource: string; description: string }> = {
  users: { resource: 'admin:users', description: 'User Management' },
  tokens: { resource: 'admin:tokens', description: 'Token Management' },
  roles: { resource: 'admin:roles', description: 'Role Management' },
  permissions: { resource: 'admin:permissions', description: 'Permission Management' },
  mail: { resource: 'admin:mail', description: 'Mail Management' },
  notification: { resource: 'admin:notifications', description: 'Notification Management' },
  'api-keys': { resource: 'admin:api_keys', description: 'API Key Management' },
  'ai-keys': { resource: 'admin:ai_keys', description: 'AI Key Management' },
  sso: { resource: 'admin:sso', description: 'SSO Management' },
  agents: { resource: 'admin:agents', description: 'AI Agent Management' },
  memories: { resource: 'admin:memories', description: 'Memory Management' },
  conversations: { resource: 'admin:conversations', description: 'Conversation Management' },
  'login-history': { resource: 'admin:login_history', description: 'Login History' },
  'logic-history': { resource: 'admin:logic_history', description: 'Logic History' },
  logs: { resource: 'admin:logs', description: 'Application Logs' },
  cache: { resource: 'admin:cache', description: 'Cache Management' },
  seed: { resource: 'admin:seed', description: 'Database Seeding' },
  'database-connections': {
    resource: 'admin:database_connections',
    description: 'Database Connection Management',
  },
  config: { resource: 'admin:config', description: 'System Configuration' },
  sockets: { resource: 'admin:sockets', description: 'Socket Management' },
  tools: { resource: 'admin:tools', description: 'Tool Management' },
  entities: { resource: 'admin:entities', description: 'Entity Management' },
  'entity-methods': { resource: 'admin:entity_methods', description: 'Entity Method Management' },
};

// Map URL patterns to permission resources
export const extractPermissionFromUrl = (
  url: string,
  method: string = 'GET'
): PermissionInfo | null => {
  if (!url) return null;

  // Determine action based on HTTP method using switch-case
  const normalizedMethod = method.toUpperCase();
  let action: 'read' | 'write' | 'delete';

  switch (normalizedMethod) {
    case 'DELETE':
      action = 'delete';
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      action = 'write';
      break;
    case 'GET':
    default:
      action = 'read';
      break;
  }

  // Extract resource segment from URL
  const urlParts = url.split('/').filter(Boolean);
  const adminIndex = urlParts.findIndex((part) => part === 'admin');

  const resourceSegment =
    adminIndex !== -1 && adminIndex + 1 < urlParts.length
      ? urlParts[adminIndex + 1]
      : urlParts[0] || null;

  // Find matching resource mapping
  const mapping = resourceSegment ? RESOURCE_MAPPINGS[resourceSegment] : null;

  if (mapping) {
    return {
      resource: `${mapping.resource}:${action}`,
      action,
      description: `${mapping.description} (${action})`,
    };
  }

  // Generate custom resource for unmapped segments
  const lastSegment = resourceSegment || urlParts[urlParts.length - 1] || 'unknown';
  const generatedResource = lastSegment.replace(/-/g, '_');

  return {
    resource: `custom:${generatedResource}:${action}`,
    action,
    description: `Custom resource for ${lastSegment} (${action})`,
  };
};

// Generate permission suggestions based on common admin operations
export const getCommonAdminPermissions = (id: string): PermissionInfo[] => {
  const permissions: PermissionInfo[] = [
    { resource: 'admin:users:read', action: 'read', description: 'View users' },
    { resource: 'admin:users:write', action: 'write', description: 'Create/Update users' },
    { resource: 'admin:users:delete', action: 'delete', description: 'Delete users' },
    { resource: 'admin:roles:read', action: 'read', description: 'View roles' },
    { resource: 'admin:roles:write', action: 'write', description: 'Create/Update roles' },
    { resource: 'admin:permissions:read', action: 'read', description: 'View permissions' },
    {
      resource: 'admin:permissions:write',
      action: 'write',
      description: 'Create/Update permissions',
    },
    { resource: 'admin:cache:read', action: 'read', description: 'View cache' },
    { resource: 'admin:cache:write', action: 'write', description: 'Manage cache' },
    { resource: 'admin:logs:read', action: 'read', description: 'View application logs' },
    { resource: 'admin:seed:read', action: 'read', description: 'View seed data' },
    { resource: 'admin:seed:write', action: 'write', description: 'Execute database seeding' },
  ];

  if (id) {
    return permissions.map((perm) => ({
      ...perm,
      resource: perm.resource.replace(':', `:${id}:`),
    }));
  }

  return permissions;
};

export default {
  extractPermissionFromUrl,
  getCommonAdminPermissions,
};
