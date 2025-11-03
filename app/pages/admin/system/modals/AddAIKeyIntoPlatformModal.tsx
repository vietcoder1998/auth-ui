import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, message, Spin, Select } from 'antd';
import { adminApi } from '~/apis/admin/index.ts';
import { AgentApi } from '~/apis/admin/AgentApi.ts';

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
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (platformId) {
        form.setFieldsValue({ platformId });
      }
      fetchAgents();
    }
  }, [visible, platformId, form]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await AgentApi.getAgents();
      const agentsData = response.data?.data || [];
      // Filter agents by the selected platform
      const platformAgents = agentsData.filter((agent: any) => agent.platformId === platformId);
      setAgents(platformAgents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      message.error('Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

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
            <Input.TextArea
              rows={2}
              placeholder="Enter the API key from the platform"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item name="agentIds" label="Assign to Agents (Optional)">
            <Select
              mode="multiple"
              placeholder="Select agents that will use this API key"
              loading={loading}
              allowClear
              optionFilterProp="children"
              showSearch
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === 'string') {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {agents.map((agent) => (
                <Select.Option key={agent.id} value={agent.id} label={agent.name}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{agent.name}</div>
                    {agent?.model?.name && (
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Model: {agent.model.name}
                      </div>
                    )}
                    {agent?.description && (
                      <div style={{ fontSize: '12px', color: '#999' }}>{agent.description}</div>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description for this API key" />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>

        {/* Display selected agents with their conversations */}
        {form.getFieldValue('agentIds') && form.getFieldValue('agentIds').length > 0 && (
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Selected Agents ({form.getFieldValue('agentIds').length}):
            </h4>
            {form.getFieldValue('agentIds').map((agentId: string) => {
              const agent = agents.find((a) => a.id === agentId);
              if (!agent) return null;

              return (
                <div
                  key={agentId}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    border: '1px solid #e8e8e8',
                    borderRadius: 6,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 13 }}>{agent.name}</div>
                  {agent?.model?.name && (
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      Model: <strong>{agent.model.name}</strong> ({agent.model.type})
                    </div>
                  )}
                  {agent?.description && (
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                      {agent.description}
                    </div>
                  )}
                  {agent?.conversations && agent.conversations.length > 0 ? (
                    <div style={{ fontSize: 12 }}>
                      <div style={{ color: '#666', marginBottom: 4 }}>
                        Conversations ({agent.conversations.length}):
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                        {agent.conversations.slice(0, 3).map((conv: any) => (
                          <li key={conv.id} style={{ marginBottom: 2 }}>
                            <span style={{ fontWeight: 500 }}>{conv.title || 'Untitled'}</span>
                            {conv.summary && (
                              <span style={{ color: '#888', marginLeft: 8 }}>- {conv.summary}</span>
                            )}
                          </li>
                        ))}
                        {agent.conversations.length > 3 && (
                          <li style={{ color: '#888' }}>
                            ... and {agent.conversations.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontSize: 12 }}>No conversations yet.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Spin>
    </Modal>
  );
}
