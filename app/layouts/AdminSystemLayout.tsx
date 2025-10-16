import { Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  UserOutlined,
  KeyOutlined,
  TeamOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  LinkOutlined,
  HistoryOutlined,
  AuditOutlined,
  RobotOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title } = Typography;

export default function AdminSystemLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const systemMenuItems = [
    {
      key: '/admin/system',
      icon: <DatabaseOutlined />,
      label: 'System Overview',
      onClick: () => navigate('/admin/system'),
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
          onClick: () => navigate('/admin/system/agents'),
        },
        {
          key: '/admin/system/conversations',
          icon: <MessageOutlined />,
          label: 'Conversations',
          onClick: () => navigate('/admin/system/conversations'),
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
          onClick: () => navigate('/admin/system/users'),
        },
        {
          key: '/admin/system/tokens',
          icon: <KeyOutlined />,
          label: 'Tokens',
          onClick: () => navigate('/admin/system/tokens'),
        },
        {
          key: '/admin/system/roles',
          icon: <TeamOutlined />,
          label: 'Roles',
          onClick: () => navigate('/admin/system/roles'),
        },
        {
          key: '/admin/system/permissions',
          icon: <SafetyOutlined />,
          label: 'Permissions',
          onClick: () => navigate('/admin/system/permissions'),
        },
        {
          key: '/admin/system/sso',
          icon: <LinkOutlined />,
          label: 'SSO Management',
          onClick: () => navigate('/admin/system/sso'),
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
          onClick: () => navigate('/admin/system/login-history'),
        },
        {
          key: '/admin/system/logic-history',
          icon: <AuditOutlined />,
          label: 'Logic History',
          onClick: () => navigate('/admin/system/logic-history'),
        },
        {
          key: '/admin/system/cache',
          icon: <DatabaseOutlined />,
          label: 'Cache',
          onClick: () => navigate('/admin/system/cache'),
        },
      ],
    },
  ];

  return (
    <Layout style={{  background: '#f5f5f5' }}>
      <Sider
        width={250}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
        collapsed={false}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            System Management
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={systemMenuItems} 
          style={{ borderRight: 0, height: 'calc(100% - 112px)' }}
        />
      </Sider>
      <Layout>
        <Content style={{ background: '#f5f5f5' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              minHeight: 360,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}