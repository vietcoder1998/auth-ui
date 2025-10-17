import {
    AuditOutlined,
    BellOutlined,
    DatabaseOutlined,
    ExpandOutlined,
    HistoryOutlined,
    HomeOutlined,
    KeyOutlined,
    LinkOutlined,
    LogoutOutlined,
    MailOutlined,
    MessageOutlined,
    MinusOutlined,
    ProfileOutlined,
    RobotOutlined,
    SafetyOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Breadcrumb, Button, Dropdown, Layout, Menu, Tooltip, Typography } from 'antd';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import LLMChat from '../components/LLMChat.tsx';
import { useAuth } from '../hooks/useAuth.tsx';

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: <HomeOutlined /> },
  { path: '/admin/system', label: 'System Management', icon: <DatabaseOutlined /> },
  { path: '/admin/settings', label: 'Settings Management', icon: <SettingOutlined /> },
];

const settingsMenuItems = [
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: 'Settings Overview',
  },
  {
    key: '/admin/settings/api-keys',
    icon: <KeyOutlined />,
    label: 'API Keys',
  },
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
];

const systemMenuItems = [
  {
    key: '/admin/system',
    icon: <DatabaseOutlined />,
    label: 'System Overview',
  },
  { type: 'divider' as const },
  {
    type: 'group' as const,
    label: 'AI Management',
    key: 'ai-section',
    children: [
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
    ],
  },
  { type: 'divider' as const },
  {
    type: 'group' as const,
    label: 'User Management',
    key: 'user-section',
    children: [
      {
        key: '/admin/system/users',
        icon: <UserOutlined />,
        label: 'Users',
      },
      {
        key: '/admin/system/tokens',
        icon: <KeyOutlined />,
        label: 'Tokens',
      },
      {
        key: '/admin/system/roles',
        icon: <TeamOutlined />,
        label: 'Roles',
      },
      {
        key: '/admin/system/permissions',
        icon: <SafetyOutlined />,
        label: 'Permissions',
      },
      {
        key: '/admin/system/sso',
        icon: <LinkOutlined />,
        label: 'SSO Management',
      },
    ],
  },
  { type: 'divider' as const },
  {
    type: 'group' as const,
    label: 'Monitoring & Logs',
    key: 'monitoring-section',
    children: [
      {
        key: '/admin/system/login-history',
        icon: <HistoryOutlined />,
        label: 'Login History',
      },
      {
        key: '/admin/system/logic-history',
        icon: <AuditOutlined />,
        label: 'Logic History',
      },
      {
        key: '/admin/system/logs',
        icon: <AuditOutlined />,
        label: 'Application Logs',
      },
      {
        key: '/admin/system/cache',
        icon: <DatabaseOutlined />,
        label: 'Cache',
      },
    ],
  },
];

export default function AdminContentLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  // Load chat collapse state from cookie on mount
  useEffect(() => {
    const collapsed = Cookies.get('admin_chat_collapsed');
    setIsChatCollapsed(collapsed === 'true');
  }, []);

  // Determine which section we're in
  const isMainAdmin = pathname === '/admin';
  const isSystemSection = pathname.startsWith('/admin/system');
  const isSettingsSection = pathname.startsWith('/admin/settings');

  // Determine selected keys based on current path
  const selectedKeys = [pathname];
  if (isSystemSection) {
    selectedKeys.push('/admin/system');
  } else if (isSettingsSection) {
    selectedKeys.push('/admin/settings');
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  // Generate breadcrumb items based on current path
  const generateBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: { title: React.ReactNode }[] = [
      {
        title: <Link to="/admin"><HomeOutlined /> Admin</Link>,
      }
    ];

    if (pathSegments.length > 1) {
      if (pathSegments[1] === 'system') {
        breadcrumbItems.push({
          title: <Link to="/admin/system">System Management</Link>
        });
        if (pathSegments[2]) {
          const pageTitle = pathSegments[2]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          breadcrumbItems.push({
            title: <span>{pageTitle}</span>
          });
        }
      } else if (pathSegments[1] === 'settings') {
        breadcrumbItems.push({
          title: <Link to="/admin/settings">Settings Management</Link>
        });
        if (pathSegments[2]) {
          const pageTitle = pathSegments[2]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          breadcrumbItems.push({
            title: <span>{pageTitle}</span>
          });
        }
      }
    }

    return breadcrumbItems;
  };

  // Profile dropdown menu
  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true
    }
  ];

  // Render main admin sidebar (narrow)
  const renderMainSidebar = () => (
    <Sider
      style={{ 
        background: '#fff', 
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1001
      }}
      width={80}
      collapsed={false}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        style={{ borderRight: 0, flex: 1 }}
        items={adminLinks.map(link => ({
          key: link.path,
          icon: <Link to={link.path}>{link.icon}</Link>,
        }))}
      />
      <div style={{ padding: '16px 8px', borderTop: '1px solid #eee' }}>
        <Tooltip title="Logout" placement="right">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ width: '100%', height: '40px' }}
            danger
          />
        </Tooltip>
      </div>
    </Sider>
  );

  // Render section sidebar (wide)
  const renderSectionSidebar = () => {
    if (isMainAdmin) return null;

    const menuItems = isSystemSection ? systemMenuItems : settingsMenuItems;
    const sectionTitle = isSystemSection ? 'System Management' : 'Settings Management';
    const sectionColor = isSystemSection ? '#1890ff' : '#52c41a';

    return (
      <Sider
        width={250}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          left: '80px',
          top: 0,
          bottom: 0,
          zIndex: 999
        }}
        collapsed={false}
      >
        {isSettingsSection && (
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ margin: 0, color: sectionColor }}>
              {sectionTitle}
            </Title>
          </div>
        )}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems.map(item => {
            if ('children' in item && item.children) {
              return {
                ...item,
                children: item.children.map((child: any) => ({
                  ...child,
                  onClick: () => handleMenuClick(child.key as string)
                }))
              };
            }
            return {
              ...item,
              onClick: item.key ? () => handleMenuClick(item.key as string) : undefined,
            };
          })}
          style={{ 
            borderRight: 0, 
            height: isSettingsSection ? 'calc(100% - 122px)' : 'calc(100% - 112px)', 
            overflowY: 'auto' 
          }}
        />
      </Sider>
    );
  };

  // Calculate left margin based on active sidebars
  const getContentMarginLeft = () => {
    if (isMainAdmin) return '80px';
    return '330px'; // 80px (main) + 250px (section)
  };

  return (
    <Layout style={{ height: '100vh', background: '#f6f8fa' }}>
      {renderMainSidebar()}
      {renderSectionSidebar()}
      
      <Layout style={{ marginLeft: getContentMarginLeft() }}>
        <Header style={{ 
          background: '#fff', 
          borderBottom: '1px solid #eee',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <Breadcrumb
            items={generateBreadcrumb()}
            style={{ fontSize: '14px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <div style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                {user?.nickname || user?.email || 'Unknown User'}
              </div>
              {user?.role && (
                <div style={{ color: '#666', fontSize: '12px' }}>
                  {user.role.name || 'No Role'}
                </div>
              )}
            </div>
            <Dropdown
              menu={{ items: profileMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: '#1890ff',
                  cursor: 'pointer'
                }}
              />
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          minWidth: 0, 
          background: isMainAdmin ? '#f6f8fa' : '#f5f5f5', 
          position: 'relative',
        }}>
          <div
            style={{
              background: '#fff',
              height: '100%',
              overflowY: 'auto',
              padding: isMainAdmin ? '24px' : (isSettingsSection ? '12px' : '0px'),
              minHeight: 360,
            }}
          >
            <Outlet/>
          </div>
          
          {/* Floating Chat Box - Bottom Right */}
          <div
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '400px',
              height: isChatCollapsed ? '60px' : '500px',
              background: '#fff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e0e0e0',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Chat Header with Collapse Button */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: isChatCollapsed ? 'none' : '1px solid #f0f0f0',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                minHeight: '48px'
              }}
              onClick={() => {
                const newCollapsed = !isChatCollapsed;
                setIsChatCollapsed(newCollapsed);
                Cookies.set('admin_chat_collapsed', newCollapsed.toString(), { expires: 365 });
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageOutlined style={{ color: '#1890ff' }} />
                <Typography.Text strong style={{ fontSize: '14px' }}>
                  AI Assistant
                </Typography.Text>
              </div>
              <Button
                type="text"
                size="small"
                icon={isChatCollapsed ? <ExpandOutlined /> : <MinusOutlined />}
                style={{ 
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </div>
            
            {/* Chat Content */}
            {!isChatCollapsed && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <LLMChat />
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}