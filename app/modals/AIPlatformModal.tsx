import { Modal, Form, Input } from 'antd';
import { useEffect } from 'react';

interface AIPlatformModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  editingPlatform?: any;
}

export default function AIPlatformModal({
  visible,
  onOk,
  onCancel,
  editingPlatform,
}: AIPlatformModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingPlatform) {
        form.setFieldsValue(editingPlatform);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingPlatform]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch {}
  };

  return (
    <Modal
      open={visible}
      title={editingPlatform ? 'Edit AI Platform' : 'Add AI Platform'}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Platform Name"
          rules={[{ required: true, message: 'Please input the platform name' }]}
        >
          <Input placeholder="Platform name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Description (optional)" />
        </Form.Item>
        <Form.Item name="endpoint" label="API Endpoint">
          <Input placeholder="API endpoint URL (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
