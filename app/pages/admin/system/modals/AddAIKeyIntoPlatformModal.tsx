import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, message, Spin } from 'antd';
import { adminApi } from '~/apis/admin/index.ts';

interface AddAIKeyIntoPlatformModalProps {
  visible: boolean;
  platformId: string | null;
  platformName?: string;
  onOk: () => void;
  onCancel: () => void;
}

export default function AddAIKeyIntoPlatformModal({
  visible,
  platformId,
  platformName,
  onOk,
  onCancel,
}: AddAIKeyIntoPlatformModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (platformId) {
        form.setFieldsValue({ platformId });
      }
    }
  }, [visible, platformId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Create the AI Key with the platform association
      const payload = {
        ...values,
        platformId: platformId,
      };

      await adminApi.createAIKey(payload);
      message.success('API Key added to platform successfully');
      form.resetFields();
      onOk();
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation error
        return;
      }
      message.error(error?.response?.data?.message || 'Failed to add API Key');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Add API Key to Platform${platformName ? `: ${platformName}` : ''}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={600}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
          }}
        >
          <Form.Item
            name="name"
            label="Key Name"
            rules={[
              { required: true, message: 'Please enter a name for this API key' },
              { min: 3, message: 'Name must be at least 3 characters' },
            ]}
          >
            <Input placeholder="e.g., Production Key, Development Key" />
          </Form.Item>

          <Form.Item
            name="key"
            label="API Key"
            rules={[
              { required: true, message: 'Please enter the API key' },
              { min: 10, message: 'API key must be at least 10 characters' },
            ]}
          >
            <Input.Password placeholder="Enter the API key from the platform" autoComplete="off" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description for this API key" />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
