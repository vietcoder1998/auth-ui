import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Space, Divider, Select, Typography } from 'antd';
import { SettingOutlined, PlusOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { adminApi } from '../../apis/admin.api.ts';

const { Option } = Select;
const { Title, Text } = Typography;

interface Permission {
  name: string;
  description?: string;
  category?: string;
  route?: string;
  method?: string;
}

interface AddPermissionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddPermissionModal: React.FC<AddPermissionModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Common permission categories
  const permissionCategories = [
    { value: 'user', label: 'User Management' },
    { value: 'role', label: 'Role Management' },
    { value: 'permission', label: 'Permission Management' },
    { value: 'system', label: 'System Administration' },
    { value: 'content', label: 'Content Management' },
    { value: 'report', label: 'Reporting' },
    { value: 'api', label: 'API Access' },
    { value: 'other', label: 'Other' },
  ];

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async (values: Permission) => {
    setLoading(true);
    try {
      const permissionData = {
        name: values.name,
        description: values.description,
        category: values.category || 'other',
      };

      const response = await adminApi.createPermission(permissionData);

      if (response.data.success) {
        message.success('Permission created successfully!');
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        message.error(response.data.message || 'Failed to create permission');
      }
    } catch (error: any) {
      console.error('Error creating permission:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create permission';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Generate permission name suggestions based on category
  const getPermissionSuggestions = (category: string) => {
    const suggestions: { [key: string]: string[] } = {
      user: ['create_user', 'read_user', 'update_user', 'delete_user', 'manage_users'],
      role: ['create_role', 'read_role', 'update_role', 'delete_role', 'manage_roles'],
      permission: [
        'create_permission',
        'read_permission',
        'update_permission',
        'delete_permission',
        'manage_permissions',
      ],
      system: ['system_admin', 'system_config', 'system_logs', 'system_backup'],
      content: [
        'create_content',
        'read_content',
        'update_content',
        'delete_content',
        'publish_content',
      ],
      report: ['view_reports', 'create_reports', 'export_reports'],
      api: ['api_access', 'api_read', 'api_write', 'api_admin'],
    };
    return suggestions[category] || [];
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  return (
    <Modal
      title="Create New Permission"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Divider />

      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select
            placeholder="Select permission category"
            size="large"
            onChange={setSelectedCategory}
            suffixIcon={<SecurityScanOutlined />}
          >
            {permissionCategories.map((category) => (
              <Option key={category.value} value={category.value}>
                {category.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Permission Name"
          rules={[
            { required: true, message: 'Please enter permission name' },
            { min: 3, message: 'Permission name must be at least 3 characters' },
            {
              pattern: /^[a-z_]+$/,
              message: 'Permission name should contain only lowercase letters and underscores',
            },
          ]}
          extra="Use lowercase with underscores (e.g., create_user, manage_content)"
        >
          <Input
            prefix={<SettingOutlined />}
            placeholder="e.g., create_user, manage_content"
            size="large"
          />
        </Form.Item>

        {selectedCategory && getPermissionSuggestions(selectedCategory).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Suggested names for{' '}
              {permissionCategories.find((c) => c.value === selectedCategory)?.label}:
            </Text>
            <div style={{ marginTop: 4 }}>
              {getPermissionSuggestions(selectedCategory).map((suggestion) => (
                <Button
                  key={suggestion}
                  type="link"
                  size="small"
                  style={{ padding: '0 8px 0 0', height: 'auto', fontSize: '12px' }}
                  onClick={() => form.setFieldsValue({ name: suggestion })}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter permission description' }]}
        >
          <Input.TextArea
            placeholder="Describe what this permission allows users to do..."
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="route"
          label="Route (Optional)"
          extra="API route pattern (e.g., /admin/users, /api/reports)"
        >
          <Input placeholder="e.g., /admin/users, /api/reports" size="large" />
        </Form.Item>

        <Form.Item
          name="method"
          label="HTTP Method (Optional)"
          extra="HTTP method for route-based permissions"
        >
          <Select placeholder="Select HTTP method" size="large" allowClear>
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
            <Option value="PATCH">PATCH</Option>
          </Select>
        </Form.Item>

        <Divider />

        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Naming Convention:</strong>
            <br />
            • Use lowercase letters and underscores only
            <br />• Follow pattern: {`{action}_{resource}`} (e.g., create_user, view_reports)
            <br />
            • Be specific and descriptive
            <br />• Avoid spaces and special characters
          </Text>
        </div>

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
              Create Permission
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPermissionModal;
