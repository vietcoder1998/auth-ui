import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
  Space,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../apis/admin.api.ts';

const { Option } = Select;

interface User {
  email: string;
  nickname: string;
  password: string;
  roleId?: number;
  status?: 'active' | 'inactive' | 'pending';
}

interface Role {
  id: number;
  name: string;
}

interface AddUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Fetch roles when modal opens
  React.useEffect(() => {
    if (visible) {
      fetchRoles();
      form.resetFields();
    }
  }, [visible, form]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await adminApi.getRoles();
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error('Failed to load roles');
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSubmit = async (values: User) => {
    setLoading(true);
    try {
      const userData = {
        email: values.email,
        nickname: values.nickname,
        password: values.password,
        roleId: values.roleId,
        status: values.status || 'active',
      };

      const response = await adminApi.createUser(userData);
      
      if (response.data.success) {
        message.success('User created successfully!');
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        message.error(response.data.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Add New User"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="user@example.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="nickname"
          label="Display Name"
          rules={[
            { required: true, message: 'Please enter display name' },
            { min: 2, message: 'Display name must be at least 2 characters' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="John Doe"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="roleId"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select
            placeholder="Select user role"
            size="large"
            loading={rolesLoading}
            suffixIcon={<SafetyOutlined />}
          >
            {roles.map((role) => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select user status" size="large">
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="pending">Pending</Option>
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Create User
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
