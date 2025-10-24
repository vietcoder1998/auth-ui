import {
  ApiOutlined,
  AppstoreOutlined,
  CloudOutlined,
  DatabaseOutlined,
  FileOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  HomeOutlined,
  KeyOutlined,
  LoginOutlined,
  MailOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Menu, Space } from 'antd';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const features = [
  { label: 'Dashboard', path: '/dashboard', icon: <HomeOutlined /> },
  { label: 'Admin', path: '/admin', icon: <AppstoreOutlined /> },
  { label: 'FAQ', path: '/admin/system/faqs', icon: <QuestionCircleOutlined /> },
  { label: 'Jobs', path: '/admin/system/jobs', icon: <ThunderboltOutlined /> },
  { label: 'Users', path: '/admin/system/users', icon: <TeamOutlined /> },
  { label: 'Tokens', path: '/admin/system/tokens', icon: <KeyOutlined /> },
  { label: 'Roles', path: '/admin/system/roles', icon: <SafetyOutlined /> },
  { label: 'Permissions', path: '/admin/system/permissions', icon: <UnlockOutlined /> },
  { label: 'SSO', path: '/admin/system/sso', icon: <LoginOutlined /> },
  { label: 'Login History', path: '/admin/system/login-history', icon: <HistoryOutlined /> },
  { label: 'Logic History', path: '/admin/system/logic-history', icon: <RobotOutlined /> },
  { label: 'Cache', path: '/admin/system/cache', icon: <CloudOutlined /> },
  { label: 'Logs', path: '/admin/system/logs', icon: <FileTextOutlined /> },
  { label: 'Agents', path: '/admin/system/agents', icon: <RobotOutlined /> },
  { label: 'Conversations', path: '/admin/system/conversations', icon: <DatabaseOutlined /> },
  { label: 'Prompt History', path: '/admin/system/prompt-history', icon: <ThunderboltOutlined /> },
  { label: 'Sockets', path: '/admin/system/sockets', icon: <CloudOutlined /> },
  { label: 'Documents', path: '/admin/system/documents', icon: <FileOutlined /> },
  { label: 'Files', path: '/admin/system/files', icon: <FolderOpenOutlined /> },
  { label: 'API Keys', path: '/admin/settings/api-keys', icon: <ApiOutlined /> },
  { label: 'Mail', path: '/admin/settings/mail', icon: <MailOutlined /> },
  { label: 'Notifications', path: '/admin/settings/notifications', icon: <NotificationOutlined /> },
  { label: 'Config', path: '/admin/settings/config', icon: <SettingOutlined /> },
  { label: 'Seed', path: '/admin/settings/seed', icon: <DatabaseOutlined /> },
  { label: 'Database', path: '/admin/settings/database', icon: <DatabaseOutlined /> },
];

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const menuItems = features.map((feature) => ({
    key: feature.path,
    icon: feature.icon,
    label: <Link to={feature.path}>{feature.label}</Link>,
  }));

  return (
    <div className="w-full bg-white flex items-center justify-between px-6 py-3 shadow-sm">
      <Space>
        <Dropdown overlay={<Menu items={menuItems.slice(4)} />} placement="bottomLeft">
          <Menu
            mode="horizontal"
            selectable={false}
            items={menuItems.slice(0, 4)}
            style={{ border: 'none', background: 'transparent' }}
          />
        </Dropdown>
      </Space>
      <Space>
        <Button type="default" onClick={() => navigate('/blog')}>
          Blog
        </Button>
        <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
          Login
        </Button>
      </Space>
    </div>
  );
};

export default PublicHeader;
