import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface EntityCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void> | void;
  initialValues?: Record<string, any>;
  loading?: boolean;
}

const EntityCreateModal: React.FC<EntityCreateModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
}) => {
  const [form] = Form.useForm();

  // Set initial values when modal visibles
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  return (
    <Modal
      title="Create Entity"
      visible={visible}
      onCancel={onCancel}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="create" type="primary" onClick={handleSubmit} loading={loading}>
          Create
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="entityCreateForm" initialValues={initialValues}>
        <Form.Item
          label="Entity Name"
          name="name"
          rules={[{ required: true, message: 'Please enter entity name' }]}
        >
          <Input placeholder="Enter entity name" />
        </Form.Item>

        <Form.Item label="Label" name="label">
          <Input placeholder="Enter entity label" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Enter description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EntityCreateModal;
