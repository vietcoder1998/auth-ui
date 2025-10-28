import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface EntityUpdateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void> | void;
  initialValues?: any;
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

  // Set initial form values when modal visibles
  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Update Entity"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          Save
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="entityUpdateForm" initialValues={initialValues}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input entity name!' }]}
        >
          <Input placeholder="Enter entity name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Enter description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EntityUpdateModal;
