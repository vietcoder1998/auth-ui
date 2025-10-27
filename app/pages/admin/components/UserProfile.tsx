import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Tag, Divider, Row, Col, Typography, Space } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth.tsx';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user, logout, refreshUser, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleRefreshUser = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error('Failed to refresh user data');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      nickname: user?.nickname,
      email: user?.email,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    try {
      // Here you would typically call an API to update the user profile
      console.log('Saving profile:', values);
      setIsEditing(false);
      // You might want to call refreshUser() after successful update
    } catch (error) {
      console.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          My Profile
        </Title>
        <Button onClick={handleRefreshUser} loading={loading}>
          Refresh Data
        </Button>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          {/* Profile Card */}
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#1890ff',
                marginBottom: 16,
              }}
            />
            <Title level={4} style={{ margin: '8px 0' }}>
              {user?.nickname || user?.email}
            </Title>
            <Text type="secondary">{user?.email}</Text>
            <br />
            <Tag color={user?.status === 'active' ? 'green' : 'red'} style={{ marginTop: 8 }}>
              {user?.status?.toUpperCase()}
            </Tag>
          </Card>

          {/* Role & Permissions Card */}
          <Card title="Role & Access" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong>Role: </Text>
              <Tag color="blue">{user?.role?.name || 'No Role'}</Tag>
            </div>
            <div>
              <Text strong>User ID: </Text>
              <Text code>{user?.id}</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* Profile Information Card */}
          <Card
            title="Profile Information"
            extra={
              !isEditing ? (
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  Edit Profile
                </Button>
              ) : (
                <Space>
                  <Button icon={<CloseOutlined />} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
                    Save
                  </Button>
                </Space>
              )
            }
            style={{ marginBottom: 24 }}
          >
            {!isEditing ? (
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div>
                      <Text strong>Display Name</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text>{user?.nickname || 'Not set'}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Email Address</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text>{user?.email}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Account Status</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color={user?.status === 'active' ? 'green' : 'red'}>
                          {user?.status}
                        </Tag>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Role</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text>{user?.role?.name || 'No role assigned'}</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleSave}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Display Name"
                      name="nickname"
                      rules={[{ required: true, message: 'Please enter your display name' }]}
                    >
                      <Input placeholder="Enter your display name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email Address" name="email">
                      <Input disabled placeholder="Email cannot be changed" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>

          {/* Session Information Card */}
          <Card title="Session Information">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div>
                  <Text strong>Authentication</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="green">✓ Authenticated</Tag>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>Storage Method</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text>Cookies + localStorage</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>Auto-refresh</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue">Enabled</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Debug Information (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card title="Debug Information" style={{ marginTop: 24 }}>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 4,
              overflow: 'auto',
              fontSize: 12,
            }}
          >
            {JSON.stringify(user, null, 2)}
          </pre>
        </Card>
      )}
    </>
  );
};

export default Profile;
