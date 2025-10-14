import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin, message, Modal, Form, Select, Space, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';

interface Token {
  id: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  user?: {
    id: string;
    email: string;
    nickname?: string;
    role?: {
      name: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  nickname?: string;
}

export default function AdminTokenPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTokens();
    fetchUsers();
  }, []);

  const fetchTokens = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await adminApi.getTokens();
      // Handle different response structures
      const rawData = res.data?.data || res.data || [];
      if (Array.isArray(rawData)) {
        setTokens(rawData as Token[]);
      } else {
        console.warn('Expected array but got:', rawData);
        setTokens([]);
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      message.error('Failed to fetch tokens');
      setTokens([]);
    }
    setLoading(false);
  };

  const fetchUsers = async (): Promise<void> => {
    try {
      const res = await adminApi.getUsers();
      const rawData = res.data?.data || res.data || [];
      if (Array.isArray(rawData)) {
        setUsers(rawData as User[]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleRevokeToken = async (tokenId: string): Promise<void> => {
    try {
      await adminApi.revokeToken(tokenId);
      message.success('Token revoked successfully');
      fetchTokens();
    } catch (error) {
      console.error('Failed to revoke token:', error);
      message.error('Failed to revoke token');
    }
  };

  const handleCreateToken = async (values: { userId: string }): Promise<void> => {
    try {
      await adminApi.grantToken(values.userId);
      message.success('Token created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchTokens();
    } catch (error) {
      console.error('Failed to create token:', error);
      message.error('Failed to create token');
    }
  };

  const truncateToken = (token: string, length: number = 20): string => {
    return token.length > length ? `${token.substring(0, length)}...` : token;
  };

  const isTokenExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };

  const copyToClipboard = async (text: string, type: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${type} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      message.error('Failed to copy to clipboard');
    }
  };

  const columns = [
    {
      title: 'Access Token',
      dataIndex: 'accessToken',
      key: 'accessToken',
      render: (token: string) => (
        <Tooltip title={token}>
          <code style={{ fontSize: '12px' }}>{truncateToken(token)}</code>
        </Tooltip>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: Token) => (
        <div>
          <div>{record.user?.email || record.userId}</div>
          {record.user?.nickname && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.user.nickname}
            </div>
          )}
          {record.user?.role && (
            <Tag color="blue">
              {record.user.role.name}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => (
        <span style={{ color: isTokenExpired(date) ? 'red' : 'inherit' }}>
          {new Date(date).toLocaleDateString()}
          {isTokenExpired(date) && <Tag color="red">Expired</Tag>}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Token) => (
        <Space>
          <Tooltip title="Copy access token">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyToClipboard(record.accessToken, 'Access token')}
            />
          </Tooltip>
          <Tooltip title="View full token">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: 'Token Details',
                  content: (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <p><strong>Access Token:</strong></p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ wordBreak: 'break-all', fontSize: '11px', flex: 1 }}>
                            {record.accessToken}
                          </code>
                          <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(record.accessToken, 'Access token')}
                          />
                        </div>
                      </div>
                      <div>
                        <p><strong>Refresh Token:</strong></p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ wordBreak: 'break-all', fontSize: '11px', flex: 1 }}>
                            {record.refreshToken}
                          </code>
                          <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(record.refreshToken, 'Refresh token')}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                  width: 600,
                });
              }}
            />
          </Tooltip>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Revoke Token',
                content: 'Are you sure you want to revoke this token?',
                onOk: () => handleRevokeToken(record.id),
              });
            }}
          >
            Revoke
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Token Management</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTokens}>
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Token
          </Button>
        </Space>
      </div>
      
      <Spin spinning={loading}>
        <Table
          dataSource={tokens}
          columns={columns}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tokens`
          }}
          scroll={{ x: 800 }}
        />
      </Spin>

      <Modal
        title="Create Token"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateToken}
        >
          <Form.Item
            name="userId"
            label="Select User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              placeholder="Select a user to grant token"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(user => ({
                value: user.id,
                label: `${user.email} ${user.nickname ? `(${user.nickname})` : ''}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
