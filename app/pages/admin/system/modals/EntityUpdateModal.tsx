import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface EntityUpdateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void> | void;
  initialValues?: Record<string, any>;
  loading?: boolean;
}

const EntityUpdateModal: React.FC<EntityUpdateModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [initialValues, form]);

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
      title="Update Entity"
      visible={visible}
      onCancel={onCancel}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="entityUpdateForm" initialValues={initialValues}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter entity name' }]}
        >
          <Input placeholder="Entity name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Description (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EntityUpdateModal;
