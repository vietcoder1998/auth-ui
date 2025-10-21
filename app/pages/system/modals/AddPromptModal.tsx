import { Form, Input, Modal, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';

export default function AddPromptModal({
  open,
  onCancel,
  onOk,
  loading,
  conversations,
  defaultConversationId,
  initialPrompt,
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
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>(
    defaultConversationId
  );
  const [agent, setAgent] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        conversationId: defaultConversationId || undefined,
        prompt: initialPrompt || '',
      });
      setSelectedConversation(defaultConversationId);
    }
  }, [open, defaultConversationId, initialPrompt]);

  useEffect(() => {
    if (!selectedConversation) {
      setAgent(null);
      return;
    }
    setAgentLoading(true);
    // Simulate fetch agent by conversationId (replace with actual API if available)
    const conv = conversations.find((c: any) => c.id === selectedConversation);
    setTimeout(() => {
      setAgent(conv?.agent || null);
      setAgentLoading(false);
    }, 300);
  }, [selectedConversation, conversations]);

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
      <div style={{ position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.6)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={onOk}>
          <Form.Item
            name="conversationId"
            label="Conversation"
            rules={[{ required: true, message: 'Please select a conversation' }]}
          >
            <Select
              showSearch
              placeholder="Select a conversation"
              optionFilterProp="children"
              value={selectedConversation}
              onChange={(val) => setSelectedConversation(val)}
              filterOption={(input, option) => {
                const children = option?.children;
                let text = '';
                if (typeof children === 'string') {
                  text = children;
                } else if (Array.isArray(children)) {
                  text = children.map((c) => (typeof c === 'string' ? c : String(c))).join('');
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
          <div style={{ marginBottom: 12 }}>
            {agentLoading ? (
              <Spin size="small" />
            ) : agent ? (
              <span style={{ fontSize: 13, color: '#555' }}>
                Agent: <b>{agent.name || agent.id}</b> ({agent.type || 'N/A'})
              </span>
            ) : (
              <span style={{ fontSize: 13, color: '#aaa' }}>No agent info</span>
            )}
          </div>
          <Form.Item
            name="prompt"
            label="Prompt"
            rules={[{ required: true, message: 'Prompt is required' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
