// Mock data for admin API endpoints
export const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    nickname: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-12-01T14:20:00Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    nickname: 'Regular User',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-20T09:15:00Z',
    lastLogin: '2024-11-30T16:45:00Z',
  },
  {
    id: '3',
    email: 'manager@example.com',
    nickname: 'Manager',
    role: 'manager',
    status: 'inactive',
    createdAt: '2024-03-10T11:00:00Z',
    lastLogin: '2024-11-25T12:30:00Z',
  },
];

export const mockTokens = [
  {
    id: '1',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    userId: '1',
    userEmail: 'admin@example.com',
    type: 'access',
    expiresAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-12-01T10:00:00Z',
    isRevoked: false,
  },
  {
    id: '2',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    userId: '2',
    userEmail: 'user@example.com',
    type: 'refresh',
    expiresAt: '2025-01-15T23:59:59Z',
    createdAt: '2024-11-28T14:30:00Z',
    isRevoked: false,
  },
  {
    id: '3',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    userId: '1',
    userEmail: 'admin@example.com',
    type: 'access',
    expiresAt: '2024-11-20T23:59:59Z',
    createdAt: '2024-11-15T08:00:00Z',
    isRevoked: true,
  },
];

export const mockRoles = [
  {
    id: '1',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'manager',
    displayName: 'Manager',
    description: 'Management level access',
    permissions: ['read', 'write', 'manage_users'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'user',
    displayName: 'User',
    description: 'Basic user access',
    permissions: ['read'],
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockPermissions = [
  {
    id: '1',
    name: 'read',
    displayName: 'Read Access',
    description: 'Can view content and data',
    resource: '*',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'write',
    displayName: 'Write Access',
    description: 'Can create and edit content',
    resource: '*',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'delete',
    displayName: 'Delete Access',
    description: 'Can delete content and data',
    resource: '*',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'manage_users',
    displayName: 'Manage Users',
    description: 'Can create, edit, and delete users',
    resource: 'users',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'manage_roles',
    displayName: 'Manage Roles',
    description: 'Can create, edit, and delete roles',
    resource: 'roles',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockMailTemplates = [
  {
    id: '1',
    name: 'welcome_email',
    subject: 'Welcome to Our Platform!',
    body: '<h1>Welcome {{name}}!</h1><p>Thank you for joining our platform.</p>',
    type: 'welcome',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-01T14:30:00Z',
  },
  {
    id: '2',
    name: 'password_reset',
    subject: 'Password Reset Request',
    body: '<h1>Password Reset</h1><p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
    type: 'password_reset',
    isActive: true,
    createdAt: '2024-01-15T10:05:00Z',
    updatedAt: '2024-10-15T09:20:00Z',
  },
  {
    id: '3',
    name: 'account_suspended',
    subject: 'Account Suspended',
    body: '<h1>Account Suspended</h1><p>Your account has been temporarily suspended.</p>',
    type: 'account_alert',
    isActive: false,
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-09-10T16:45:00Z',
  },
];

export const mockNotificationTemplates = [
  {
    id: '1',
    name: 'task_assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: {{taskTitle}}',
    type: 'task',
    isActive: true,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-11-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'task_completed',
    title: 'Task Completed',
    message: 'Task "{{taskTitle}}" has been completed by {{userName}}',
    type: 'task',
    isActive: true,
    createdAt: '2024-01-20T12:05:00Z',
    updatedAt: '2024-10-20T14:15:00Z',
  },
  {
    id: '3',
    name: 'system_maintenance',
    title: 'System Maintenance',
    message: 'System maintenance scheduled for {{maintenanceDate}}',
    type: 'system',
    isActive: false,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-08-05T13:20:00Z',
  },
];

export const mockConfig = [
  {
    id: '1',
    key: 'app_name',
    value: 'Calendar Todo App',
    type: 'string',
    description: 'Application name displayed in UI',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
  },
  {
    id: '2',
    key: 'max_file_size',
    value: '10485760',
    type: 'number',
    description: 'Maximum file upload size in bytes (10MB)',
    isPublic: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-09-10T14:20:00Z',
  },
  {
    id: '3',
    key: 'enable_notifications',
    value: 'true',
    type: 'boolean',
    description: 'Enable push notifications for users',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-01T09:45:00Z',
  },
  {
    id: '4',
    key: 'smtp_server',
    value: 'smtp.example.com',
    type: 'string',
    description: 'SMTP server for sending emails',
    isPublic: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-07-20T16:10:00Z',
  },
  {
    id: '5',
    key: 'maintenance_mode',
    value: 'false',
    type: 'boolean',
    description: 'Enable maintenance mode',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T08:00:00Z',
  },
];

// Mock API functions that simulate network delays
export const adminApiMock = {
  async getUsers(params?: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: { data: mockUsers, total: mockUsers.length, message: 'Success' } };
  },

  async createUser(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    mockUsers.push(newUser);
    return { data: { data: newUser, message: 'User created successfully' } };
  },

  async deleteUser(email: string) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const index = mockUsers.findIndex((user) => user.email === email);
    if (index > -1) {
      mockUsers.splice(index, 1);
      return { data: { message: 'User deleted successfully' } };
    }
    throw new Error('User not found');
  },

  async getTokens(params?: any) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { data: { data: mockTokens, total: mockTokens.length, message: 'Success' } };
  },

  async createToken(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const newToken = {
      id: (mockTokens.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      isRevoked: false,
    };
    mockTokens.push(newToken);
    return { data: { data: newToken, message: 'Token created successfully' } };
  },

  async revokeToken(token: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const tokenObj = mockTokens.find((t) => t.token === token);
    if (tokenObj) {
      tokenObj.isRevoked = true;
      return { data: { message: 'Token revoked successfully' } };
    }
    throw new Error('Token not found');
  },

  async getRoles(params?: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { data: { data: mockRoles, total: mockRoles.length, message: 'Success' } };
  },

  async createRole(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newRole = {
      id: (mockRoles.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockRoles.push(newRole);
    return { data: { data: newRole, message: 'Role created successfully' } };
  },

  async deleteRole(id: string | number) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockRoles.findIndex((role) => role.id === id.toString());
    if (index > -1) {
      mockRoles.splice(index, 1);
      return { data: { message: 'Role deleted successfully' } };
    }
    throw new Error('Role not found');
  },

  async getPermissions(params?: any) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return { data: { data: mockPermissions, total: mockPermissions.length, message: 'Success' } };
  },

  async createPermission(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const newPermission = {
      id: (mockPermissions.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockPermissions.push(newPermission);
    return { data: { data: newPermission, message: 'Permission created successfully' } };
  },

  async deletePermission(id: string | number) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const index = mockPermissions.findIndex((perm) => perm.id === id.toString());
    if (index > -1) {
      mockPermissions.splice(index, 1);
      return { data: { message: 'Permission deleted successfully' } };
    }
    throw new Error('Permission not found');
  },

  async getMailTemplates(params?: any) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      data: { data: mockMailTemplates, total: mockMailTemplates.length, message: 'Success' },
    };
  },

  async createMailTemplate(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const newTemplate = {
      id: (mockMailTemplates.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockMailTemplates.push(newTemplate);
    return { data: { data: newTemplate, message: 'Mail template created successfully' } };
  },

  async deleteMailTemplate(id: string | number) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockMailTemplates.findIndex((template) => template.id === id.toString());
    if (index > -1) {
      mockMailTemplates.splice(index, 1);
      return { data: { message: 'Mail template deleted successfully' } };
    }
    throw new Error('Mail template not found');
  },

  async getNotificationTemplates(params?: any) {
    await new Promise((resolve) => setTimeout(resolve, 380));
    return {
      data: {
        data: mockNotificationTemplates,
        total: mockNotificationTemplates.length,
        message: 'Success',
      },
    };
  },

  async createNotificationTemplate(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 720));
    const newTemplate = {
      id: (mockNotificationTemplates.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockNotificationTemplates.push(newTemplate);
    return { data: { data: newTemplate, message: 'Notification template created successfully' } };
  },

  async deleteNotificationTemplate(id: string | number) {
    await new Promise((resolve) => setTimeout(resolve, 520));
    const index = mockNotificationTemplates.findIndex((template) => template.id === id.toString());
    if (index > -1) {
      mockNotificationTemplates.splice(index, 1);
      return { data: { message: 'Notification template deleted successfully' } };
    }
    throw new Error('Notification template not found');
  },

  async getConfig(params?: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { data: { data: mockConfig, total: mockConfig.length, message: 'Success' } };
  },

  async createConfig(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newConfig = {
      id: (mockConfig.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockConfig.push(newConfig);
    return { data: { data: newConfig, message: 'Config created successfully' } };
  },

  async updateConfig(id: string | number, data: any) {
    await new Promise((resolve) => setTimeout(resolve, 550));
    const config = mockConfig.find((c) => c.id === id.toString());
    if (config) {
      Object.assign(config, data, { updatedAt: new Date().toISOString() });
      return { data: { data: config, message: 'Config updated successfully' } };
    }
    throw new Error('Config not found');
  },

  async deleteConfig(id: string | number) {
    await new Promise((resolve) => setTimeout(resolve, 480));
    const index = mockConfig.findIndex((config) => config.id === id.toString());
    if (index > -1) {
      mockConfig.splice(index, 1);
      return { data: { message: 'Config deleted successfully' } };
    }
    throw new Error('Config not found');
  },
};
