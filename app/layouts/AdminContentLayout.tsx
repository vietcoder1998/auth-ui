import {
  AuditOutlined,
  BellOutlined,
  DatabaseOutlined,
  DragOutlined,
  EditOutlined,
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
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Breadcrumb, Button, Dropdown, Layout, Tooltip, Typography } from 'antd';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ErrorDisplay from '../components/ErrorDisplay.tsx';
import LLMChat from '../components/LLMChat.tsx';
import StatusIndicator from '../components/StatusIndicator.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import useCookie from '../hooks/useCookie.tsx';

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
      {
        key: '/admin/system/sockets',
        icon: <ThunderboltOutlined />,
        label: 'Socket Connections',
      },
    ],
  },
];

export default function AdminContentLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Add error handling for useAuth
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('useAuth error in AdminContentLayout:', error);
    // Fallback UI when AuthProvider is not available
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p>Please reload the page or contact support if the issue persists.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  const { logout, user } = auth;
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [chatPosition, setChatPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [editSidebar, setEditSidebar] = useState(false);
  const [search, setSearch] = useState('');

  // Load chat collapse state and position from cookie on mount
  useEffect(() => {
    const collapsed = Cookies.get('admin_chat_collapsed');
    setIsChatCollapsed(collapsed === 'true');

    const savedPosition = Cookies.get('admin_chat_position');
    if (savedPosition) {
      try {
        const position = savedPosition as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
        if (['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(position)) {
          setChatPosition(position);
        }
      } catch (error) {
        console.error('Failed to parse chat position from cookie:', error);
      }
    }
  }, []);

  // Handle chat position change via buttons
  const handlePositionChange = (position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => {
    setChatPosition(position);
    Cookies.set('admin_chat_position', position, { expires: 365 });
  };

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

  // Build merged sidebar items with correct Ant Design Menu structure
  const defaultSidebarItems = [
    {
      key: '/admin',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    { type: 'divider' as const },
    {
      type: 'group' as const,
      label: 'AI Management',
      key: 'ai-section',
      children: systemMenuItems.find(i => i.key === 'ai-section')?.children || [],
    },
    {
      type: 'group' as const,
      label: 'User Management',
      key: 'user-section',
      children: systemMenuItems.find(i => i.key === 'user-section')?.children || [],
    },
    {
      type: 'group' as const,
      label: 'Monitoring & Logs',
      key: 'monitoring-section',
      children: systemMenuItems.find(i => i.key === 'monitoring-section')?.children || [],
    },
    { type: 'divider' as const },
    {
      type: 'group' as const,
      label: 'Settings',
      key: 'settings-section',
      children: settingsMenuItems,
    },
  ];

  // Use cookie for sidebar order
  const [sidebarItems, setSidebarItems] = useCookie<any[]>('admin_sidebar_order', defaultSidebarItems);

  // Filter sidebar items by search
  const filteredSidebarItems = sidebarItems.map(item => {
    if (item.type === 'group') {
      return {
        ...item,
        children: item.children?.filter((child: any) =>
          child.label.toLowerCase().includes(search.toLowerCase())
        ) || [],
      };
    }
    if (item.label && typeof item.label === 'string') {
      return item.label.toLowerCase().includes(search.toLowerCase()) ? item : null;
    }
    return item;
  }).filter(Boolean);

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(sidebarItems);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setSidebarItems(items);
  };

  return (
    <Layout style={{ height: '100vh', background: '#f6f8fa' }}>
      <Sider
        style={{
          background: '#fff',
          borderRight: '1px solid #eee',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          overflowY: 'auto',
        }}
        width={250}
      >
        {/* Sidebar header with search and edit button */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8 }}>
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: '1px solid #eee', borderRadius: 4, padding: '4px 8px', fontSize: 14 }}
          />
          <Button
            icon={<EditOutlined />}
            type={editSidebar ? 'primary' : 'default'}
            size="small"
            onClick={() => setEditSidebar(!editSidebar)}
            style={{ marginLeft: 4 }}
          />
        </div>
        <DragDropContext onDragEnd={editSidebar ? onDragEnd : () => {}}>
          <Droppable droppableId="sidebar-menu" isDropDisabled={!editSidebar} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {filteredSidebarItems.map((item, index) => (
                  item.type === 'divider' ? (
                    <div key={`divider-${index}`} style={{ height: 16 }} />
                  ) : item.type === 'group' ? (
                    <div key={item.key} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, padding: '8px 16px', color: '#888' }}>
                        {item.label}
                        {editSidebar ? (
                          <DragOutlined style={{ marginLeft: 'auto', color: '#1890ff', cursor: 'grab' }} />
                        ) : (
                          <Button
                            icon={<DragOutlined />}
                            type="text"
                            size="small"
                            style={{ marginLeft: 'auto', color: '#aaa' }}
                            onClick={() => setEditSidebar(true)}
                          />
                        )}
                      </div>
                      {item.children && item.children.map((child: any, childIdx: number) => (
                        <Draggable key={child.key} draggableId={child.key} index={index + childIdx} isDragDisabled={!editSidebar}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...(editSidebar ? provided.dragHandleProps : {})}
                              style={{
                                userSelect: 'none',
                                padding: '8px 16px',
                                margin: '0 0 4px 0',
                                background: pathname === child.key ? '#e6f7ff' : 'transparent',
                                borderRadius: 4,
                                cursor: editSidebar ? 'grab' : 'pointer',
                                opacity: editSidebar ? 1 : 0.95,
                                ...provided.draggableProps.style,
                              }}
                              onClick={() => !editSidebar && navigate(child.key)}
                            >
                              {child.icon} <span style={{ marginLeft: 8 }}>{child.label}</span>
                              {editSidebar && <DragOutlined style={{ float: 'right', color: '#aaa', marginLeft: 8 }} />}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  ) : (
                    <Draggable key={item.key} draggableId={item.key} index={index} isDragDisabled={!editSidebar}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...(editSidebar ? provided.dragHandleProps : {})}
                          style={{
                            userSelect: 'none',
                            padding: '8px 16px',
                            margin: '0 0 4px 0',
                            background: pathname === item.key ? '#e6f7ff' : 'transparent',
                            borderRadius: 4,
                            cursor: editSidebar ? 'grab' : 'pointer',
                            opacity: editSidebar ? 1 : 0.95,
                            ...provided.draggableProps.style,
                          }}
                          onClick={() => !editSidebar && navigate(item.key)}
                        >
                          {item.icon} <span style={{ marginLeft: 8 }}>{item.label}</span>
                          {editSidebar && <DragOutlined style={{ float: 'right', color: '#aaa', marginLeft: 8 }} />}
                        </div>
                      )}
                    </Draggable>
                  )
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
      <Layout style={{ marginLeft: 250 }}>
        <Header style={{
          background: '#fff',
          borderBottom: '1px solid #eee',
          padding: '0 24px',
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
            {/* System Status Indicator */}
            <StatusIndicator />

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
            {/* Error Display at the top */}
            <ErrorDisplay style={{
              position: 'sticky',
              top: 0,
              zIndex: 999,
              marginBottom: '0',
            }} />

            <Outlet />
          </div>

          {/* Floating Chat Box - With Position Buttons */}
          <div
            style={{
              position: 'fixed',
              width: '400px',
              height: isChatCollapsed ? '60px' : '500px',
              background: '#fff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              zIndex: 1000,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(chatPosition === 'bottom-right' && { bottom: '20px', right: '20px' }),
              ...(chatPosition === 'bottom-left' && { bottom: '20px', left: '20px' }),
              ...(chatPosition === 'top-right' && { top: '20px', right: '20px' }),
              ...(chatPosition === 'top-left' && { top: '20px', left: '20px' }),
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Chat Header with Collapse Button and Position Controls */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: isChatCollapsed ? 'none' : '1px solid #f0f0f0',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '48px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageOutlined style={{ color: '#1890ff' }} />
                <Typography.Text strong style={{ fontSize: '14px' }}>
                  AI Assistant
                </Typography.Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Position Control Buttons */}
                <Tooltip title="Change Position" placement="bottom">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'top-left',
                          label: 'Top Left',
                          onClick: () => handlePositionChange('top-left'),
                        },
                        {
                          key: 'top-right',
                          label: 'Top Right',
                          onClick: () => handlePositionChange('top-right'),
                        },
                        {
                          key: 'bottom-left',
                          label: 'Bottom Left',
                          onClick: () => handlePositionChange('bottom-left'),
                        },
                        {
                          key: 'bottom-right',
                          label: 'Bottom Right',
                          onClick: () => handlePositionChange('bottom-right'),
                        },
                      ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DragOutlined />}
                      style={{
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  </Dropdown>
                </Tooltip>

                {/* Collapse Button */}
                <Button
                  type="text"
                  size="small"
                  icon={isChatCollapsed ? <ExpandOutlined /> : <MinusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newCollapsed = !isChatCollapsed;
                    setIsChatCollapsed(newCollapsed);
                    Cookies.set('admin_chat_collapsed', newCollapsed.toString(), { expires: 365 });
                  }}
                  style={{
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </div>
            </div>

            {/* Chat Content */}
            {!isChatCollapsed && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <LLMChat />
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}