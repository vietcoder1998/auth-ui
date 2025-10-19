import React from 'react';
import { Modal, Form, Input, Select } from 'antd';

interface EditPermissionModalProps {
  visible: boolean;
  permission: any;
  roles: Array<{ id: string; name: string }>;
  form: any;
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const EditPermissionModal: React.FC<EditPermissionModalProps> = ({ visible, permission, roles, form, loading, onCancel, onSave }) => {
  React.useEffect(() => {
    if (permission) {
      form.setFieldsValue({
        ...permission,
        roles: permission.roles ? permission.roles.map((r: any) => r.id) : [],
      });
    } else {
      form.resetFields();
    }
  }, [permission, form]);

  return (
    <Modal
      title="Edit Permission"
      open={visible}
      onCancel={onCancel}
      onOk={onSave}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Permission Name"
          rules={[{ required: true, message: 'Please input permission name!' }]}
        >
          <Input placeholder="Enter permission name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="Enter permission description" />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
        >
          <Select placeholder="Select category">
            <Select.Option value="user">User</Select.Option>
            <Select.Option value="role">Role</Select.Option>
            <Select.Option value="permission">Permission</Select.Option>
            <Select.Option value="system">System</Select.Option>
            <Select.Option value="content">Content</Select.Option>
            <Select.Option value="report">Report</Select.Option>
            <Select.Option value="api">API</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="route"
          label="Route (Optional)"
        >
          <Input placeholder="e.g., /admin/users, /api/reports" />
        </Form.Item>
        <Form.Item
          name="method"
          label="HTTP Method (Optional)"
        >
          <Select placeholder="Select HTTP method" allowClear>
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
            <Select.Option value="PATCH">PATCH</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="roles"
          label="Roles"
        >
          <Select mode="multiple" placeholder="Select roles">
            {roles.map(role => (
              <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPermissionModal;
