import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  message,
  Space,
  Divider,
  Typography,
} from 'antd';
import {
  UserOutlined,
  LinkOutlined,
  KeyOutlined,
  GlobalOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../../../apis/admin.api.ts';

interface CreateSSOModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface UserOption {
  id: string;
  email: string;
  nickname?: string;
}

const { Text } = Typography;

const CreateSSOModal: React.FC<CreateSSOModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users when modal opens
  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminApi.getUsers({ limit: 100 });

      if (response.data) {
        setUsers(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const submitData = {
        url: values.url,
        userId: values.userId,
        deviceIP: values.deviceIP || null,
        ssoKey: values.ssoKey || undefined,
        isActive: values.isActive !== false, // Default to true
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      };

      await adminApi.createSSO(submitData);

      message.success('SSO entry created successfully');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating SSO entry:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create SSO entry';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const generateSSOKey = () => {
    // Generate a simple SSO key based on URL
    const url = form.getFieldValue('url');
    if (url) {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace(/\./g, '_');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const generatedKey = `${domain}_${randomSuffix}`;
        form.setFieldValue('ssoKey', generatedKey);
        message.success('SSO key generated');
      } catch {
        const randomKey = `sso_${Math.random().toString(36).substring(2, 16)}`;
        form.setFieldValue('ssoKey', randomKey);
        message.success('Random SSO key generated');
      }
    } else {
      message.warning('Please enter URL first');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined />
          Create SSO Entry
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Create SSO Entry
        </Button>,
      ]}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
        }}
      >
        <Divider orientation="left">Basic Information</Divider>

        <Form.Item
          name="url"
          label={
            <Space>
              <LinkOutlined />
              Application URL
            </Space>
          }
          rules={[
            { required: true, message: 'Please enter the application URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
        >
          <Input placeholder="https://your-app.example.com" prefix={<GlobalOutlined />} />
        </Form.Item>

        <Form.Item
          name="userId"
          label={
            <Space>
              <UserOutlined />
              User
            </Space>
          }
          rules={[{ required: true, message: 'Please select a user' }]}
        >
          <Select
            placeholder="Select a user"
            loading={loadingUsers}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toLowerCase() || '').includes(input.toLowerCase())
            }
            options={users.map((user) => ({
              value: user.id,
              label: `${user.email}${user.nickname ? ` (${user.nickname})` : ''}`,
            }))}
          />
        </Form.Item>

        <Form.Item name="deviceIP" label="Device IP (Optional)">
          <Input placeholder="192.168.1.100" prefix={<GlobalOutlined />} />
        </Form.Item>

        <Divider orientation="left">SSO Configuration</Divider>

        <Form.Item
          name="ssoKey"
          label={
            <Space>
              <KeyOutlined />
              SSO Key (Optional)
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Leave empty for auto-generation
              </Text>
            </Space>
          }
        >
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 120px)' }}
              placeholder="custom_sso_key or leave empty"
            />
            <Button type="default" style={{ width: '120px' }} onClick={generateSSOKey}>
              Generate
            </Button>
          </Input.Group>
        </Form.Item>

        <Form.Item name="isActive" label="Status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item
          name="expiresAt"
          label={
            <Space>
              <CalendarOutlined />
              Expiration Date (Optional)
            </Space>
          }
        >
          <DatePicker
            style={{ width: '100%' }}
            showTime
            placeholder="Select expiration date"
            disabledDate={(current) => current && current.valueOf() < Date.now()}
          />
        </Form.Item>

        <div
          style={{
            background: '#f0f2f5',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '16px',
          }}
        >
          <Text type="secondary" style={{ fontSize: '13px' }}>
            <strong>Note:</strong> The SSO entry will generate both a primary key (for internal use)
            and an optional SSO key (for external identification). If no SSO key is provided, you
            can use the primary key for authentication.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateSSOModal;
