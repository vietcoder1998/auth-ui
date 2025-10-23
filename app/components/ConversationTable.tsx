import { DeleteOutlined, EyeOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface Agent {
  id: string;
  name: string;
  description: string;
  model:
    | string
    | {
        id: string;
        name: string;
        description?: string;
        type?: string;
        platformId?: string;
        createdAt?: string;
        updatedAt?: string;
      };
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface Conversation {
  id: string;
  title: string;
  summary: string;
  isActive: boolean;
  agent: Agent;
  user: User;
  _count?: {
    messages: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ConversationTableProps {
  conversations: Conversation[];
  loading: boolean;
  onView: (conversation: Conversation) => void;
  onDelete: (conversation: Conversation) => void;
  getMessageTimeAgo?: (dateString: string) => string;
}

const ConversationTable: React.FC<ConversationTableProps> = ({
  conversations,
  loading,
  onView,
  onDelete,
  getMessageTimeAgo,
}) => {
  const columns = [
    {
      title: 'Conversation',
      key: 'conversation',
      width: 250,
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
            {record.title || 'Untitled Conversation'}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.summary || 'No summary available'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Agent',
      key: 'agent',
      width: 180,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar
            size="small"
            icon={<RobotOutlined />}
            style={{ backgroundColor: record.agent.isActive ? '#52c41a' : '#d9d9d9' }}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{record.agent.name}</div>
            <Tag color="blue" style={{ fontSize: '11px' }}>
              {typeof record.agent.model === 'object'
                ? record.agent.model.name
                : record.agent.model || 'N/A'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'User',
      key: 'user',
      width: 180,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>
              {record.user.nickname || record.user.email}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {record.user.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Messages',
      key: 'messages',
      width: 100,
      render: (_: any, record: any) => (
        <div style={{ textAlign: 'center' }}>
          <Badge count={record._count?.messages || 0} showZero />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Badge status={isActive ? 'success' : 'default'} text={isActive ? 'Active' : 'Archived'} />
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      render: (text: string) => (
        <div>
          <div style={{ fontSize: '12px' }}>{new Date(text).toLocaleDateString()}</div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {getMessageTimeAgo ? getMessageTimeAgo(text) : ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Conversation">
            <Button type="text" icon={<EyeOutlined />} onClick={() => onView(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete Conversation"
            description="Are you sure you want to delete this conversation? This action cannot be undone."
            onConfirm={() => onDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={conversations}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1200, y: 600 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `Total ${total} conversations`,
      }}
    />
  );
};

export default ConversationTable;
