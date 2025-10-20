import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';

export default function AddPromptModal({
  open,
  onCancel,
  onOk,
  loading,
  conversations,
  defaultConversationId,
  initialPrompt
}: {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  loading?: boolean;
  conversations: any[];
  defaultConversationId?: string;
  initialPrompt?: string;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        conversationId: defaultConversationId || undefined,
        prompt: initialPrompt || ''
      });
    }
  }, [open, defaultConversationId, initialPrompt]);

  return (
    <Modal
      title={initialPrompt ? 'Edit Prompt' : 'Add Prompt'}
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      onOk={() => form.submit()}
      okText={initialPrompt ? 'Update' : 'Create'}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onOk}
      >
        <Form.Item
          name="conversationId"
          label="Conversation"
          rules={[{ required: true, message: 'Please select a conversation' }]}
        >
          <Select
            showSearch
            placeholder="Select a conversation"
            optionFilterProp="children"
            filterOption={(input, option) => {
              const children = option?.children;
              let text = '';
              if (typeof children === 'string') {
                text = children;
              } else if (Array.isArray(children)) {
                text = children.map(c => (typeof c === 'string' ? c : String(c))).join('');
              } else if (children != null) {
                text = String(children);
              }
              return text.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {conversations.map((conv: any) => (
              <Select.Option key={conv.id} value={conv.id}>
                {conv.title || conv.id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="prompt" label="Prompt" rules={[{ required: true, message: 'Prompt is required' }]}> 
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
