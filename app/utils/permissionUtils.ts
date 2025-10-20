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
  const isWriteOperation = ['POST', 'PUT', 'PATCH', 'GET'].includes(normalizedMethod);
  const isDeleteOperation = normalizedMethod === 'DELETE';

  // Define URL to permission mappings
  const urlMappings: Array<{
    pattern: RegExp;
    resource: string;
    description: string;
  }> = [
    // User Management
    { pattern: /\/admin\/users/, resource: 'admin:users', description: 'User Management' },
    { pattern: /\/admin\/tokens/, resource: 'admin:tokens', description: 'Token Management' },
    { pattern: /\/admin\/roles/, resource: 'admin:roles', description: 'Role Management' },
    {
      pattern: /\/admin\/permissions/,
      resource: 'admin:permissions',
      description: 'Permission Management',
    },

    // Communication
    { pattern: /\/admin\/mail/, resource: 'admin:mail', description: 'Mail Management' },
    {
      pattern: /\/admin\/notification/,
      resource: 'admin:notifications',
      description: 'Notification Management',
    },

    // API & Integration
    { pattern: /\/admin\/api-keys/, resource: 'admin:api_keys', description: 'API Key Management' },
    { pattern: /\/admin\/sso/, resource: 'admin:sso', description: 'SSO Management' },

    // AI Management
    { pattern: /\/admin\/agents/, resource: 'admin:agents', description: 'AI Agent Management' },
    {
      pattern: /\/admin\/conversations/,
      resource: 'admin:conversations',
      description: 'Conversation Management',
    },

    // System Monitoring
    {
      pattern: /\/admin\/login-history/,
      resource: 'admin:login_history',
      description: 'Login History',
    },
    {
      pattern: /\/admin\/logic-history/,
      resource: 'admin:logic_history',
      description: 'Logic History',
    },
    { pattern: /\/admin\/logs/, resource: 'admin:logs', description: 'Application Logs' },
    { pattern: /\/admin\/cache/, resource: 'admin:cache', description: 'Cache Management' },

    // Database & System
    { pattern: /\/admin\/seed/, resource: 'admin:seed', description: 'Database Seeding' },
    {
      pattern: /\/admin\/database-connections/,
      resource: 'admin:database_connections',
      description: 'Database Connection Management',
    },

    // Configuration
    { pattern: /\/config/, resource: 'admin:config', description: 'System Configuration' },

    // Socket Management
    { pattern: /\/admin\/sockets/, resource: 'admin:sockets', description: 'Socket Management' },
  ];

  // Find matching pattern
  for (const mapping of urlMappings) {
    if (mapping.pattern.test(url)) {
      let action: 'read' | 'write' | 'delete' = 'read';
      if (isDeleteOperation) {
        action = 'delete';
      } else if (isWriteOperation) {
        action = 'write';
      }
      return {
        resource: `${mapping.resource}:${action}`,
        action,
        description: `${mapping.description} (${action})`,
      };
    }
  }

  // If no mapping found, generate resource from URL
  const urlParts = url.split('/').filter(Boolean);
  const lastSegment = urlParts[urlParts.length - 1] || 'unknown';
  let action: 'read' | 'write' | 'delete' = 'read';
  if (isDeleteOperation) {
    action = 'delete';
  } else if (isWriteOperation) {
    action = 'write';
  }
  return {
    resource: `custom:${lastSegment}:${action}`,
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
