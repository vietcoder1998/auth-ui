import React from 'react';
import { Timeline, Card, Row, Col, Typography, Tag, Progress, Space, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  RocketOutlined, 
  BulbOutlined,
  UserOutlined,
  SecurityScanOutlined,
  MailOutlined,
  SettingOutlined,
  ApiOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const roadmapData = [
  {
    id: 1,
    title: 'Authentication & Authorization System',
    description: 'Complete user management with roles and permissions',
    status: 'completed',
    progress: 100,
    quarter: 'Q4 2024',
    features: [
      { name: 'User Management', completed: true },
      { name: 'Role-based Access Control', completed: true },
      { name: 'JWT Token Management', completed: true },
      { name: 'Permission System', completed: true },
    ],
    icon: <UserOutlined />,
    color: '#52c41a'
  },
  {
    id: 2,
    title: 'Security & Monitoring',
    description: 'Enhanced security features and comprehensive monitoring',
    status: 'in-progress',
    progress: 80,
    quarter: 'Q1 2025',
    features: [
      { name: 'API Key Management', completed: true },
      { name: 'Cache System', completed: true },
      { name: 'Audit Logging', completed: true },
      { name: 'Rate Limiting', completed: false },
      { name: 'Security Alerts', completed: false },
    ],
    icon: <SecurityScanOutlined />,
    color: '#1890ff'
  },
  {
    id: 3,
    title: 'Communication Platform',
    description: 'Email templates, notifications, and messaging system',
    status: 'in-progress',
    progress: 70,
    quarter: 'Q1 2025',
    features: [
      { name: 'Mail Templates', completed: true },
      { name: 'Notification System', completed: true },
      { name: 'SMS Integration', completed: false },
      { name: 'Push Notifications', completed: false },
      { name: 'Webhook Support', completed: false },
    ],
    icon: <MailOutlined />,
    color: '#722ed1'
  },
  {
    id: 4,
    title: 'AI Agent Integration',
    description: 'Conversational AI with memory and tool integration',
    status: 'planned',
    progress: 30,
    quarter: 'Q2 2025',
    features: [
      { name: 'Agent Management', completed: true },
      { name: 'Conversation System', completed: false },
      { name: 'Memory System', completed: false },
      { name: 'Tool Integration', completed: false },
      { name: 'Multi-model Support', completed: false },
    ],
    icon: <RocketOutlined />,
    color: '#fa8c16'
  },
  {
    id: 5,
    title: 'Advanced Analytics',
    description: 'Comprehensive analytics and reporting dashboard',
    status: 'planned',
    progress: 10,
    quarter: 'Q3 2025',
    features: [
      { name: 'Usage Analytics', completed: false },
      { name: 'Performance Metrics', completed: false },
      { name: 'Custom Reports', completed: false },
      { name: 'Data Export', completed: false },
      { name: 'Real-time Dashboard', completed: false },
    ],
    icon: <DatabaseOutlined />,
    color: '#eb2f96'
  },
  {
    id: 6,
    title: 'Enterprise Features',
    description: 'Scalability and enterprise-grade features',
    status: 'future',
    progress: 0,
    quarter: 'Q4 2025',
    features: [
      { name: 'Multi-tenancy', completed: false },
      { name: 'SSO Integration', completed: false },
      { name: 'Advanced Compliance', completed: false },
      { name: 'Custom Branding', completed: false },
      { name: 'API Marketplace', completed: false },
    ],
    icon: <BulbOutlined />,
    color: '#13c2c2'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in-progress': return 'processing';
    case 'planned': return 'warning';
    case 'future': return 'default';
    default: return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'in-progress': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    case 'planned': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    case 'future': return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    default: return <ClockCircleOutlined />;
  }
};

export default function AdminIndexPage() {
  const completedFeatures = roadmapData.reduce((acc, item) => 
    acc + item.features.filter(f => f.completed).length, 0
  );
  const totalFeatures = roadmapData.reduce((acc, item) => acc + item.features.length, 0);
  const overallProgress = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={1} style={{ margin: 0, color: '#1890ff' }}>
              <ApiOutlined /> Auth Platform Roadmap
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Building the next-generation authentication and authorization platform
            </Paragraph>
            <div>
              <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>Overall Progress: </Text>
              <Progress 
                percent={overallProgress} 
                style={{ width: '300px', display: 'inline-block', marginLeft: '16px' }}
                strokeColor="#1890ff"
              />
            </div>
          </Space>
        </Card>

        {/* Timeline */}
        <Card title={<><ClockCircleOutlined /> Development Timeline</>} style={{ marginBottom: '24px' }}>
          <Timeline
            mode="left"
            items={roadmapData.map((item) => ({
              key: item.id,
              dot: getStatusIcon(item.status),
              color: item.color,
              label: <Tag color={item.color}>{item.quarter}</Tag>,
              children: (
                <Card
                  size="small"
                  style={{ maxWidth: '800px' }}
                  title={
                    <Space>
                      {item.icon}
                      <span>{item.title}</span>
                      <Tag color={getStatusColor(item.status)}>
                        {item.status.replace('-', ' ').toUpperCase()}
                      </Tag>
                    </Space>
                  }
                >
                  <Paragraph style={{ margin: '0 0 16px 0' }}>{item.description}</Paragraph>
                  <Progress
                    percent={item.progress}
                    size="small"
                    strokeColor={item.color}
                    style={{ marginBottom: '16px' }}
                  />
                  <div>
                    <Text strong>Features:</Text>
                    <div style={{ marginTop: '8px' }}>
                      {item.features.map((feature, index) => (
                        <Tag
                          key={index}
                          color={feature.completed ? 'success' : 'default'}
                          style={{ margin: '2px' }}
                        >
                          {feature.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                          {' '}{feature.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Card>
              ),
            }))}
          />
        </Card>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                {roadmapData.filter(item => item.status === 'completed').length}
              </Title>
              <Text>Completed Phases</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                {roadmapData.filter(item => item.status === 'in-progress').length}
              </Title>
              <Text>In Progress</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#faad14', margin: 0 }}>
                {roadmapData.filter(item => item.status === 'planned').length}
              </Title>
              <Text>Planned</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#13c2c2', margin: 0 }}>
                {completedFeatures}/{totalFeatures}
              </Title>
              <Text>Features Complete</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
