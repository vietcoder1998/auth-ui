import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
  Space,
  Divider,
  Checkbox,
  Row,
  Col,
  Card,
  Typography,
} from 'antd';
import { SafetyOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { adminApi } from '../../apis/admin.api.ts';

const { Option } = Select;
const { Title, Text } = Typography;
const CheckboxGroup = Checkbox.Group;

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface Role {
  name: string;
  description?: string;
  permissions: number[];
}

interface AddRoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Fetch permissions when modal opens
  useEffect(() => {
    if (visible) {
      fetchPermissions();
      form.resetFields();
      setSelectedPermissions([]);
    }
  }, [visible, form]);

  const fetchPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const response = await adminApi.getPermissions();
      if (response.data.success) {
        setPermissions(response.data.data || []);
      } else {
        message.error('Failed to load permissions');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      message.error('Failed to load permissions');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleSubmit = async (values: Role) => {
    if (selectedPermissions.length === 0) {
      message.warning('Please select at least one permission for this role');
      return;
    }

    setLoading(true);
    try {
      const roleData = {
        name: values.name,
        description: values.description,
        permissions: selectedPermissions,
      };

      const response = await adminApi.createRole(roleData);

      if (response.data.success) {
        message.success('Role created successfully!');
        form.resetFields();
        setSelectedPermissions([]);
        onSuccess();
        onCancel();
      } else {
        message.error(response.data.message || 'Failed to create role');
      }
    } catch (error: any) {
      console.error('Error creating role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create role';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPermissions([]);
    onCancel();
  };

  const handlePermissionChange = (checkedValues: number[]) => {
    setSelectedPermissions(checkedValues);
  };

  const selectAllPermissions = () => {
    const allPermissionIds = permissions.map((p) => p.id);
    setSelectedPermissions(allPermissionIds);
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  return (
    <Modal
      title="Create New Role"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <Divider />

      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Role Name"
              rules={[
                { required: true, message: 'Please enter role name' },
                { min: 2, message: 'Role name must be at least 2 characters' },
              ]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="e.g., Admin, Moderator, Editor"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="description" label="Description (Optional)">
              <Input.TextArea
                placeholder="Describe the role's purpose and responsibilities..."
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">
          <Space>
            <SettingOutlined />
            <Text strong>Permissions</Text>
          </Space>
        </Divider>

        <Card size="small" style={{ marginBottom: 16 }} loading={permissionsLoading}>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button
                size="small"
                type="link"
                onClick={selectAllPermissions}
                disabled={permissions.length === 0}
              >
                Select All
              </Button>
              <Button
                size="small"
                type="link"
                onClick={clearAllPermissions}
                disabled={selectedPermissions.length === 0}
              >
                Clear All
              </Button>
              <Text type="secondary">
                ({selectedPermissions.length} of {permissions.length} selected)
              </Text>
            </Space>
          </div>

          {permissions.length > 0 ? (
            <CheckboxGroup
              value={selectedPermissions}
              onChange={handlePermissionChange}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 8]}>
                {permissions.map((permission) => (
                  <Col span={12} key={permission.id}>
                    <Checkbox value={permission.id}>
                      <div>
                        <Text strong>{permission.name}</Text>
                        {permission.description && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {permission.description}
                            </Text>
                          </div>
                        )}
                      </div>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </CheckboxGroup>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">
                {permissionsLoading ? 'Loading permissions...' : 'No permissions available'}
              </Text>
            </div>
          )}
        </Card>

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
              icon={<PlusOutlined />}
            >
              Create Role
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRoleModal;
