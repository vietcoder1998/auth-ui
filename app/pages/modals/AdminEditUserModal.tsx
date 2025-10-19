import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

interface AdminEditUserModalProps {
  visible: boolean;
  user: any;
  roles?: Array<{ name: string; id: string }>;
  onCancel: () => void;
  onSave: (values: any) => void;
}

const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ visible, user, roles = [], onCancel, onSave }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  }, [user]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch {}
  };

  return (
    <Modal
      title="Edit User"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      footer={null}
    >
      <Form form={form} layout="vertical" initialValues={user || {}}>
        <Form.Item name="id" style={{ display: 'none' }}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="nickname" label="Display Name">
          <Input placeholder="Enter display name" />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input disabled />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name={["role", "id"]} label="Role">
          <Select placeholder="Select role">
            {roles.map(r => (
              <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="password" label="Password" extra="Leave blank to keep unchanged">
          <Input.Password placeholder="Change password" autoComplete="new-password" />
        </Form.Item>
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={handleOk} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AdminEditUserModal;
