// Utility functions for permission management and error handling

export interface PermissionInfo {
  resource: string;
  action: 'read' | 'write' | 'delete';
  description: string;
}

// Map URL patterns to permission resources
export const extractPermissionFromUrl = (
  url: string,
  method: string = 'GET'
): PermissionInfo | null => {
  if (!url) return null;

  const normalizedMethod = method.toUpperCase();
  const isWriteOperation = ['POST', 'PUT', 'PATCH'].includes(normalizedMethod);
  const isDeleteOperation = normalizedMethod === 'DELETE';

  // Define resource name mappings for special cases
  const resourceMappings: Record<string, { resource: string; description: string }> = {
    users: { resource: 'admin:users', description: 'User Management' },
    tokens: { resource: 'admin:tokens', description: 'Token Management' },
    roles: { resource: 'admin:roles', description: 'Role Management' },
    permissions: { resource: 'admin:permissions', description: 'Permission Management' },
    mail: { resource: 'admin:mail', description: 'Mail Management' },
    notification: { resource: 'admin:notifications', description: 'Notification Management' },
    'api-keys': { resource: 'admin:api_keys', description: 'API Key Management' },
    sso: { resource: 'admin:sso', description: 'SSO Management' },
    agents: { resource: 'admin:agents', description: 'AI Agent Management' },
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

  // Extract resource from URL path
  const urlParts = url.split('/').filter(Boolean);

  // Try to find the resource segment (usually after /admin/ or /api/admin/)
  let resourceSegment: string | null = null;
  const adminIndex = urlParts.findIndex((part) => part === 'admin');

  if (adminIndex !== -1 && adminIndex + 1 < urlParts.length) {
    // Get the segment after 'admin'
    resourceSegment = urlParts[adminIndex + 1];
  } else if (urlParts.length > 0) {
    // Fallback to the first segment
    resourceSegment = urlParts[0];
  }

  // Determine action based on method
  let action: 'read' | 'write' | 'delete' = 'read';
  if (isDeleteOperation) {
    action = 'delete';
  } else if (isWriteOperation) {
    action = 'write';
  }

  // Find matching resource mapping
  if (resourceSegment && resourceMappings[resourceSegment]) {
    const mapping = resourceMappings[resourceSegment];
    return {
      resource: `${mapping.resource}:${action}`,
      action,
      description: `${mapping.description} (${action})`,
    };
  }

  // If no mapping found, generate resource from URL segment
  const lastSegment = resourceSegment || urlParts[urlParts.length - 1] || 'unknown';
  const generatedResource = lastSegment.replace(/-/g, '_');

  return {
    resource: `custom:${generatedResource}:${action}`,
    action,
    description: `Custom resource for ${lastSegment} (${action})`,
  };
};

// Generate permission suggestions based on common admin operations
export const getCommonAdminPermissions = (): PermissionInfo[] => {
  return [
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
};

export default {
  extractPermissionFromUrl,
  getCommonAdminPermissions,
};
