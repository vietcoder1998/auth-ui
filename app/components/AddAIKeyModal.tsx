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

  // Filter agents by selected platform
  const selectedPlatformId = form.getFieldValue('platformId');
  const filteredAgents = selectedPlatformId
    ? agents.filter((a) => a.platformId === selectedPlatformId)
    : agents;

  return (
    <Modal
      open={visible}
      title={editingKey ? 'Edit AI Key' : 'Add AI Key'}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
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
          <Select
            placeholder="Select platform"
            onChange={() => {
              // Reset agent selection when platform changes
              form.setFieldsValue({ agentIds: [] });
            }}
          >
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
            {(filteredAgents as any[]).map((a) => (
              <Select.Option key={a.id} value={a.id}>
                <div>
                  <div style={{ fontWeight: 500 }}>{a.name}</div>
                  {a?.model?.name && (
                    <div style={{ fontSize: '12px', color: '#888' }}>Model: {a.model.name}</div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Description (optional)" />
        </Form.Item>
      </Form>

      {/* Display conversations for selected agents */}
      {form.getFieldValue('agentIds') && form.getFieldValue('agentIds').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>Conversations for selected AI Agents:</h4>
          {form.getFieldValue('agentIds').map((agentId: string) => {
            const agent = agents.find((a) => a.id === agentId);
            return (
              <div
                key={agentId}
                style={{ marginBottom: 12, padding: 8, border: '1px solid #eee', borderRadius: 4 }}
              >
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{agent?.name || agentId}</div>
                {agent?.conversations && agent.conversations.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {agent.conversations.map((conv: any) => (
                      <li key={conv.id}>
                        <span style={{ fontWeight: 500 }}>{conv.title || 'Untitled'}</span>
                        {conv.summary ? (
                          <span style={{ color: '#888', marginLeft: 8 }}>{conv.summary}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: '#888' }}>No conversations found.</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
