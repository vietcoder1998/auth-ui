export interface Feature {
  label: string;
  path: string;
  description: string;
}

export interface FeatureSections {
  [key: string]: Feature[];
}

export const featureSections: FeatureSections = {
  Main: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      description:
        'Comprehensive system overview with real-time statistics, performance metrics, and quick access to key functionalities.',
    },
    {
      label: 'Admin Panel',
      path: '/admin',
      description:
        'Administrative control center for system management, user oversight, and configuration settings.',
    },
  ],
  'System Management': [
    {
      label: 'FAQ Management',
      path: '/admin/system/faqs',
      description:
        'Create, edit, and organize frequently asked questions to help users find answers quickly.',
    },
    {
      label: 'Job Queue',
      path: '/admin/system/jobs',
      description:
        'Monitor background job processing, view job status, and manage task scheduling and execution.',
    },
    {
      label: 'User Management',
      path: '/admin/system/users',
      description:
        'Comprehensive user administration including profiles, permissions, and account management.',
    },
    {
      label: 'API Tokens',
      path: '/admin/system/tokens',
      description:
        'Generate, manage, and monitor API authentication tokens for secure system integration.',
    },
    {
      label: 'Role Management',
      path: '/admin/system/roles',
      description:
        'Define and manage user roles with granular permission control for enhanced security.',
    },
    {
      label: 'Permissions',
      path: '/admin/system/permissions',
      description:
        'Fine-grained permission system for controlling access to features and resources.',
    },
    {
      label: 'Single Sign-On',
      path: '/admin/system/sso',
      description:
        'Configure SSO providers and manage authentication workflows for seamless user experience.',
    },
    {
      label: 'Login History',
      path: '/admin/system/login-history',
      description:
        'Track user authentication events, analyze login patterns, and monitor security incidents.',
    },
    {
      label: 'Logic History',
      path: '/admin/system/logic-history',
      description:
        'Audit trail of system logic execution, business rule processing, and decision workflows.',
    },
    {
      label: 'Cache Management',
      path: '/admin/system/cache',
      description:
        'Monitor cache performance, clear cached data, and optimize system response times.',
    },
    {
      label: 'System Logs',
      path: '/admin/system/logs',
      description:
        'Centralized logging system for error tracking, debugging, and system health monitoring.',
    },
  ],
  'AI & Communications': [
    {
      label: 'AI Agents',
      path: '/admin/system/agents',
      description:
        'Configure and manage AI agents, set up automated responses, and monitor AI performance.',
    },
    {
      label: 'Conversations',
      path: '/admin/system/conversations',
      description:
        'View chat history, analyze conversation patterns, and manage communication workflows.',
    },
    {
      label: 'Prompt History',
      path: '/admin/system/prompt-history',
      description:
        'Track AI prompt usage, analyze effectiveness, and optimize AI interaction patterns.',
    },
    {
      label: 'Socket Connections',
      path: '/admin/system/sockets',
      description:
        'Real-time WebSocket connection monitoring, management, and performance optimization.',
    },
  ],
  'File Management': [
    {
      label: 'Document Library',
      path: '/admin/system/documents',
      description:
        'Centralized document storage with version control, search capabilities, and access management.',
    },
    {
      label: 'File Manager',
      path: '/admin/system/files',
      description:
        'Upload, organize, and manage files with folder structures and metadata support.',
    },
  ],
  Settings: [
    {
      label: 'API Integration',
      path: '/admin/settings/api-keys',
      description:
        'Manage external API keys, configure third-party integrations, and monitor API usage.',
    },
    {
      label: 'Email Configuration',
      path: '/admin/settings/mail',
      description: 'Configure SMTP servers, email templates, and notification delivery settings.',
    },
    {
      label: 'Notifications',
      path: '/admin/settings/notifications',
      description:
        'Set up notification channels, customize alert preferences, and manage delivery methods.',
    },
    {
      label: 'System Config',
      path: '/admin/settings/config',
      description:
        'Core system configuration management including environment variables and feature flags.',
    },
    {
      label: 'Database Seeding',
      path: '/admin/settings/seed',
      description:
        'Initialize database with default data, run migration scripts, and manage data fixtures.',
    },
    {
      label: 'Database Admin',
      path: '/admin/settings/database',
      description:
        'Database connection management, query execution, and performance monitoring tools.',
    },
  ],
};

export const getSectionCount = (sectionName: string): number => {
  return featureSections[sectionName]?.length || 0;
};

export const getTotalFeatureCount = (): number => {
  return Object.values(featureSections).reduce((total, features) => total + features.length, 0);
};
