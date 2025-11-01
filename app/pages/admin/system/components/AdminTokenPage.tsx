import React, { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import {
  Table,
  Button,
  Spin,
  message,
  Modal,
  Form,
  Select,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import CommonSearch from '../../../../components/CommonSearch.tsx';

interface Token {
  id: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  refreshExpiresAt: string;
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
      render: (token: string, record: Token) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tooltip title={token}>
              <code style={{ fontSize: '12px' }}>{truncateToken(token)}</code>
            </Tooltip>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyToClipboard(token, 'Access token')}
              style={{ marginLeft: 2 }}
            />
          </div>
          <div style={{ fontSize: 11, marginTop: 2 }}>
            <span style={{ fontWeight: 500 }}>Expired At:</span>{' '}
            <span style={{ color: isTokenExpired(record.expiresAt) ? 'red' : 'inherit' }}>
              {new Date(record.expiresAt).toLocaleString()}
            </span>
            {isTokenExpired(record.expiresAt) && <Tag color="red">Expired</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Refresh Token',
      dataIndex: 'refreshToken',
      key: 'refreshToken',
      render: (token: string, record: Token) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tooltip title={token}>
              <code style={{ fontSize: '12px' }}>{truncateToken(token)}</code>
            </Tooltip>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyToClipboard(token, 'Refresh token')}
              style={{ marginLeft: 2 }}
            />
          </div>
          <div style={{ fontSize: 11, marginTop: 2 }}>
            <span style={{ fontWeight: 500 }}>Expired At:</span>{' '}
            <span>
              {record.refreshExpiresAt ? new Date(record.refreshExpiresAt).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: Token) => (
        <div>
          <div>{record.user?.email || record.userId}</div>
          {record.user?.nickname && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.user.nickname}</div>
          )}
          {record.user?.role && <Tag color="blue">{record.user.role.name}</Tag>}
        </div>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (_: unknown, record: Token) => (
        <div>
          <div>
            <span style={{ fontWeight: 500 }}>Created:</span>{' '}
            {new Date(record.createdAt).toLocaleString()}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Expires:</span>{' '}
            <span style={{ color: isTokenExpired(record.expiresAt) ? 'red' : 'inherit' }}>
              {new Date(record.expiresAt).toLocaleString()}
            </span>
            {isTokenExpired(record.expiresAt) && <Tag color="red">Expired</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_: unknown, record: Token) => (
        <Space>
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
                        <p>
                          <strong>Access Token:</strong>
                        </p>
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
                      <div style={{ marginBottom: '16px' }}>
                        <p>
                          <strong>Refresh Token:</strong>
                        </p>
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
                      <div>
                        <span style={{ fontWeight: 500 }}>Created:</span>{' '}
                        {new Date(record.createdAt).toLocaleString()}
                        <br />
                        <span style={{ fontWeight: 500 }}>Expires:</span>{' '}
                        <span
                          style={{ color: isTokenExpired(record.expiresAt) ? 'red' : 'inherit' }}
                        >
                          {new Date(record.expiresAt).toLocaleString()}
                        </span>
                        {isTokenExpired(record.expiresAt) && <Tag color="red">Expired</Tag>}
                      </div>
                    </div>
                  ),
                  width: 600,
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Revoke Access Token">
            <Popconfirm
              title="Are you sure you want to revoke this access token?"
              onConfirm={() => handleRevokeToken(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} size="small" />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Revoke Refresh Token">
            <Popconfirm
              title="Are you sure you want to revoke this refresh token?"
              onConfirm={async () => {
                try {
                  await adminApi.revokeRefreshToken(record.id);
                  message.success('Refresh token revoked successfully');
                  fetchTokens();
                } catch (error) {
                  console.error('Failed to revoke refresh token:', error);
                  message.error('Failed to revoke refresh token');
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined style={{ color: '#1890ff' }} />} size="small" />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Generate new access token from refresh token">
            <Button
              icon={<ReloadOutlined />}
              size="small"
              onClick={async () => {
                try {
                  await adminApi.generateAccessTokenFromRefresh(record.refreshToken);
                  message.success('New access token generated from refresh token');
                  fetchTokens();
                } catch (error) {
                  console.error('Failed to generate access token from refresh token:', error);
                  message.error('Failed to generate access token from refresh token');
                }
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{}}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, marginBottom: '16px' }}>Token Management</h2>

        <CommonSearch
          searchPlaceholder="Search tokens..."
          onSearch={() => {}} // No search functionality for tokens currently
          onRefresh={fetchTokens}
          loading={loading}
          showRefresh={true}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Token
            </Button>
          }
          style={{ marginBottom: '0px' }}
        />
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tokens`,
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
        <Form form={form} layout="vertical" onFinish={handleCreateToken}>
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
              options={users.map((user) => ({
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
