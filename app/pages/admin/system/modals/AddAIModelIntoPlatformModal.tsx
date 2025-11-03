import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message, Spin } from 'antd';
import { adminApi } from '~/apis/admin/index.ts';
import { AgentApi } from '~/apis/admin/AgentApi.ts';

interface AddAIModelIntoPlatformModalProps {
  visible: boolean;
  platformId: string | null;
  platformName?: string;
  onOk: () => void;
  onCancel: () => void;
}

export default function AddAIModelIntoPlatformModal({
  visible,
  platformId,
  platformName,
  onOk,
  onCancel,
}: AddAIModelIntoPlatformModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [existingModels, setExistingModels] = useState<any[]>([]);

  const getDefaultModelType = (name?: string): string => {
    if (!name) return 'gpt';

    const nameLower = name.toLowerCase();

    if (nameLower.includes('openai') || nameLower.includes('gpt')) return 'gpt';
    if (nameLower.includes('anthropic') || nameLower.includes('claude')) return 'claude';
    if (nameLower.includes('google') || nameLower.includes('gemini')) return 'gemini';
    if (nameLower.includes('llama') || nameLower.includes('meta')) return 'llama';
    if (nameLower.includes('mistral')) return 'mistral';

    return 'gpt'; // fallback default
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();

      const defaultType = getDefaultModelType(platformName);

      if (platformId) {
        form.setFieldsValue({
          platformId,
          type: defaultType,
        });
      } else {
        form.setFieldsValue({ type: defaultType });
      }

      fetchAgentsAndModels();
    }
  }, [visible, platformId, platformName, form]);

  const fetchAgentsAndModels = async () => {
    try {
      setLoading(true);

      // Fetch agents filtered by platform
      const agentsResponse = await AgentApi.getAgents();
      const allAgents = agentsResponse.data?.data || [];
      const platformAgents = allAgents.filter((agent: any) => agent.platformId === platformId);
      setAgents(platformAgents);

      // Fetch existing models for validation
      const modelsResponse = await adminApi.getAIModels();
      const allModels = modelsResponse.data?.data || [];
      setExistingModels(allModels);
    } catch (error) {
      console.error('Failed to fetch agents and models:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateModelName = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }

    const trimmedValue = value.trim().toLowerCase();
    const isDuplicate = existingModels.some(
      (model) => model.name.toLowerCase() === trimmedValue && model.platformId === platformId
    );

    if (isDuplicate) {
      return Promise.reject(new Error('A model with this name already exists in this platform'));
    }

    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Create the AI Model with the platform association
      const payload = {
        ...values,
        platformId: platformId,
      };

      await adminApi.createAIModel(payload);
      message.success('AI Model added to platform successfully');
      form.resetFields();
      onOk();
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation error
        return;
      }
      message.error(error?.response?.data?.message || 'Failed to add AI Model');
    } finally {
      setSubmitting(false);
    }
  };

  const modelTypes = [
    { label: 'GPT', value: 'gpt' },
    { label: 'Claude', value: 'claude' },
    { label: 'Gemini', value: 'gemini' },
    { label: 'LLaMA', value: 'llama' },
    { label: 'Mistral', value: 'mistral' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <Modal
      title={`Add AI Model to Platform${platformName ? `: ${platformName}` : ''}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={600}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Model Name"
            rules={[
              { required: true, message: 'Please enter a name for this model' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { validator: validateModelName },
            ]}
            validateTrigger={['onBlur', 'onChange']}
          >
            <Input placeholder="e.g., GPT-4, Claude-3, Gemini Pro" />
          </Form.Item>

          {/* Display Platform Name */}
          <Form.Item label="Platform">
            <Input
              value={platformName}
              disabled
              style={{
                backgroundColor: '#f5f5f5',
                color: '#000',
                fontWeight: 500,
                cursor: 'not-allowed',
              }}
            />
          </Form.Item>

          {/* Hidden field for type - auto-detected from platform */}
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={4}
              placeholder="Optional description for this AI model (e.g., capabilities, use cases, limitations)"
            />
          </Form.Item>

          <Form.Item name="agentIds" label="Assign to Agents (Optional)">
            <Select
              mode="multiple"
              placeholder="Select agents that will use this model"
              loading={loading}
              options={agents.map((agent) => ({
                label: agent.name,
                value: agent.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
              optionFilterProp="children"
            >
              {agents.map((agent) => (
                <Select.Option key={agent.id} value={agent.id} label={agent.name}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{agent.name}</div>
                    {agent?.description && (
                      <div style={{ fontSize: '12px', color: '#888' }}>{agent.description}</div>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>

        {/* Display selected agents with their details */}
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
