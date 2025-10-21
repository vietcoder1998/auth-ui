import { Modal, Form, Input, Select } from 'antd';
import { useEffect as useModalEffect } from 'react';

interface AddAIKeyModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  editingKey?: any;
  platforms?: any[];
  agents?: any[];
}

export default function AddAIKeyModal({
  visible,
  onOk,
  onCancel,
  editingKey,
  platforms = [],
  agents = [],
}: AddAIKeyModalProps) {
  const [form] = Form.useForm();
  useModalEffect(() => {
    if (visible) {
      if (editingKey) {
        form.setFieldsValue({
          ...editingKey,
          agentIds: editingKey.agentIds || [],
          platformId: editingKey.platformId || undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingKey]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch {}
  };

  return (
    <Modal
      open={visible}
      title={editingKey ? 'Edit AI Key' : 'Add AI Key'}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="key"
          label="Key"
          rules={[{ required: true, message: 'Please input the AI Key value' }]}
        >
          <Input.TextArea rows={2} placeholder="Enter AI Key value" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input a name for the key' }]}
        >
          <Input placeholder="Key name" />
        </Form.Item>
        <Form.Item
          name="platformId"
          label="Platform"
          rules={[{ required: true, message: 'Please select a platform' }]}
        >
          <Select placeholder="Select platform">
            {(platforms as any[]).map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="agentIds" label="AI Agents">
          <Select
            mode="multiple"
            placeholder="Select AI agents (optional)"
            allowClear
            optionFilterProp="children"
          >
            {(agents as any[]).map((a) => (
              <Select.Option key={a.id} value={a.id}>
                {a.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Description (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
