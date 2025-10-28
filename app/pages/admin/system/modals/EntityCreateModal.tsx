import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { EntityApiInstance } from '../../../../apis/adminApi/EntityApi.ts';

interface EntityCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: (entity: any) => void;
  initialValues?: Record<string, any>;
}

const EntityCreateModal: React.FC<EntityCreateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Set initial values when modal visibles
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Create entity using EntityApiInstance
      const response = await EntityApiInstance.create(values);

      message.success('Entity created successfully');
      form.resetFields();
      onCancel(); // Close modal

      if (onSuccess && response.data) {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error('Failed to create entity:', err);
      message.error('Failed to create entity');
    } finally {
      setLoading(false);
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
