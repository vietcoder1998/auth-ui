import {
  AuditOutlined,
  BellOutlined,
  DatabaseOutlined,
  FileOutlined,
  FileTextOutlined,
  HistoryOutlined,
  HomeOutlined,
  KeyOutlined,
  LinkOutlined,
  MailOutlined,
  MessageOutlined,
  RobotOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';

export type MenuItem = {
  key: string;
  icon: React.ReactNode | string;
  label: string;
  children?: MenuItem[];
  type?: string;
};

export const defaultSidebarMenu: MenuItem[] = [
  // Blog moved under User Management below
  {
    key: '/admin',
    icon: <HomeOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/admin/system/ai',
    icon: <RobotOutlined />,
    label: 'AI',
    children: [
      {
        key: '/admin/system/ai-test',
        icon: <RobotOutlined />,
        label: 'AI Test',
      },
      {
        key: '/admin/system/agents',
        icon: <RobotOutlined />,
        label: 'AI Agents',
      },
      {
        key: '/admin/system/conversations',
        icon: <MessageOutlined />,
        label: 'Conversations',
      },
      {
        key: '/admin/system/prompt-history',
        icon: <MessageOutlined />,
        label: 'Prompt History',
      },
      {
        key: '/admin/system/faqs',
        icon: <FileTextOutlined />,
        label: 'FAQ',
      },
      {
        key: '/admin/system/jobs',
        icon: <ThunderboltOutlined />,
        label: 'Jobs',
      },
      {
        key: '/admin/system/ai-platforms',
        icon: <DatabaseOutlined />,
        label: 'AI Platforms',
      },
      {
        key: '/admin/system/ai-keys',
        icon: <KeyOutlined />,
        label: 'AI Keys',
      },
      {
        key: '/admin/system/billings',
        icon: <FileTextOutlined />,
        label: 'Billing',
      },
    ],
  },
  {
    key: '/admin/user',
    icon: <TeamOutlined style={{ fontSize: 16 }} />,
    label: 'User Management',
    children: [
      {
        key: '/admin/system/users',
        icon: <UserOutlined style={{ fontSize: 15 }} />,
        label: 'Users',
      },
      {
        key: '/admin/system/tokens',
        icon: <KeyOutlined style={{ fontSize: 15 }} />,
        label: 'Tokens',
      },
      {
        key: '/admin/system/roles',
        icon: <TeamOutlined style={{ fontSize: 15 }} />,
        label: 'Roles',
      },
      {
        key: '/admin/system/login-history',
        icon: <HistoryOutlined style={{ fontSize: 15 }} />,
        label: 'Login History',
      },
      {
        key: '/admin/system/permissions',
        icon: <SafetyOutlined style={{ fontSize: 15 }} />,
        label: 'Permissions',
      },
      {
        key: '/admin/blog',
        icon: <FileTextOutlined style={{ fontSize: 15 }} />,
        label: 'Blog',
        children: [
          {
            key: '/admin/blog/blogs',
            icon: <FileTextOutlined style={{ fontSize: 14 }} />,
            label: 'Blog Posts',
          },
          {
            key: '/admin/blog/categories',
            icon: <FileOutlined style={{ fontSize: 14 }} />,
            label: 'Categories',
          },
        ],
      },
      {
        key: '/admin/settings/api-keys',
        icon: <KeyOutlined style={{ fontSize: 15 }} />,
        label: 'API Keys',
      },
    ],
  },
  {
    key: '/admin/system/documents-group',
    icon: <FileTextOutlined />,
    label: 'Documents',
    children: [
      {
        key: '/admin/system/documents',
        icon: <FileTextOutlined />,
        label: 'Document List',
      },
      {
        key: '/admin/system/files',
        icon: <FileOutlined />,
        label: 'File List',
      },
    ],
  },
  {
    key: '/admin/system',
    icon: <DatabaseOutlined style={{ fontSize: 16 }} />,
    label: 'System Management',
    children: [
      {
        key: '/admin/system/sso',
        icon: <LinkOutlined style={{ fontSize: 15 }} />,
        label: 'SSO Management',
      },
      {
        key: '/admin/system/logic-history',
        icon: <AuditOutlined style={{ fontSize: 15 }} />,
        label: 'Logic History',
      },
      {
        key: '/admin/system/logs',
        icon: <AuditOutlined style={{ fontSize: 15 }} />,
        label: 'Application Logs',
      },
      {
        key: '/admin/system/cache',
        icon: <DatabaseOutlined style={{ fontSize: 15 }} />,
        label: 'Cache',
      },
      {
        key: '/admin/system/sockets',
        icon: <ThunderboltOutlined style={{ fontSize: 15 }} />,
        label: 'Socket Connections',
      },
    ],
  },
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: 'Settings Management',
    children: [
      {
        key: '/admin/settings/mail',
        icon: <MailOutlined />,
        label: 'Mail Templates',
      },
      {
        key: '/admin/settings/notifications',
        icon: <BellOutlined />,
        label: 'Notifications',
      },
      {
        key: '/admin/settings/config',
        icon: <SettingOutlined />,
        label: 'Configuration',
      },
      {
        key: '/admin/settings/seed',
        icon: <DatabaseOutlined />,
        label: 'Database Seed',
      },
      {
        key: '/admin/settings/database',
        icon: <DatabaseOutlined />,
        label: 'Database Connections',
      },
    ],
  },
];

export function useSidebarMenu(role?: string) {
  // Only use defaultSidebarMenu, do not fetch from API
  // Ensure menu is never empty
  return defaultSidebarMenu && defaultSidebarMenu.length > 0
    ? defaultSidebarMenu
    : [
        {
          key: '/admin',
          icon: <HomeOutlined />,
          label: 'Dashboard',
        },
      ];
}

export function getIcon(iconName: string | React.ReactNode): React.ReactNode {
  if (typeof iconName !== 'string') return iconName;
  const icons: Record<string, React.ReactNode> = {
    HomeOutlined: <HomeOutlined />,
    DatabaseOutlined: <DatabaseOutlined />,
    SettingOutlined: <SettingOutlined />,
    KeyOutlined: <KeyOutlined />,
    MailOutlined: <MailOutlined />,
    BellOutlined: <BellOutlined />,
    FileTextOutlined: <FileTextOutlined />,
    FileOutlined: <FileOutlined />,
    RobotOutlined: <RobotOutlined />,
    MessageOutlined: <MessageOutlined />,
    UserOutlined: <UserOutlined />,
    TeamOutlined: <TeamOutlined />,
    SafetyOutlined: <SafetyOutlined />,
    LinkOutlined: <LinkOutlined />,
    HistoryOutlined: <HistoryOutlined />,
    AuditOutlined: <AuditOutlined />,
    ThunderboltOutlined: <ThunderboltOutlined />,
  };
  return icons[iconName] || null;
}

export function mapMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    if (item.children) {
      return {
        ...item,
        icon: getIcon(item.icon),
        children: mapMenuItems(item.children),
      };
    }
    return {
      ...item,
      icon: getIcon(item.icon),
    };
  });
}

const AdminSidebarMenu: React.FC<{
  role?: string;
  onMenuClick?: (key: string) => void;
  selectedKeys?: string[];
}> = ({ role, onMenuClick, selectedKeys }) => {
  const menuItems = mapMenuItems(useSidebarMenu(role));
  return (
    <Menu
      mode="inline"
      items={menuItems as any}
      selectedKeys={selectedKeys}
      onClick={({ key }) => onMenuClick?.(key)}
      style={{ height: '100%', borderRight: 0, fontSize: 13 }}
      inlineIndent={12}
    />
  );
};

export default AdminSidebarMenu;
