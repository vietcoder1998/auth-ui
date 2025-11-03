import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, message, Spin, Select } from 'antd';
import { adminApi } from '~/apis/admin/index.ts';
import { AgentApi } from '~/apis/admin/AgentApi.ts';

interface AddAgentIntoPlatformModalProps {
  visible: boolean;
  platformId: string | null;
  platformName?: string;
  onOk: () => void;
  onCancel: () => void;
}

export default function AddAgentIntoPlatformModal({
  visible,
  platformId,
  platformName,
  onOk,
  onCancel,
}: AddAgentIntoPlatformModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [aiKeys, setAIKeys] = useState<any[]>([]);
  const [existingAgents, setExistingAgents] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (platformId) {
        form.setFieldsValue({ platformId });
      }
      fetchModelsAndAgents();
    }
  }, [visible, platformId, form]);

  const fetchModelsAndAgents = async () => {
    try {
      setLoading(true);

      // Fetch AI Models for the platform
      const modelsResponse = await adminApi.getAIModels();
      const allModels = modelsResponse.data?.data || [];
      const platformModels = allModels.filter((model: any) => model.platformId === platformId);
      setModels(platformModels);

      // Fetch existing agents to validate uniqueness
      const agentsResponse = await AgentApi.getAgents();
      const allAgents = agentsResponse.data?.data || [];
      setExistingAgents(allAgents);
    } catch (error) {
      console.error('Failed to fetch models and agents:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateAgentName = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }

    const trimmedValue = value.trim().toLowerCase();
    const isDuplicate = existingAgents.some((agent) => agent.name.toLowerCase() === trimmedValue);

    if (isDuplicate) {
      return Promise.reject(new Error('An agent with this name already exists'));
    }

    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Create the Agent with the platform association
      const payload = {
        ...values,
        platformId: platformId,
      };

      await AgentApi.createAgent(payload);
      message.success('Agent added to platform successfully');
      form.resetFields();
      onOk();
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation error
        return;
      }
      message.error(error?.response?.data?.message || 'Failed to add Agent');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Add Agent to Platform${platformName ? `: ${platformName}` : ''}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={700}
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
            label="Agent Name"
            rules={[
              { required: true, message: 'Please enter a name for this agent' },
              { min: 3, message: 'Name must be at least 3 characters' },
              { validator: validateAgentName },
            ]}
            validateTrigger={['onBlur', 'onChange']}
          >
            <Input placeholder="e.g., Customer Support Agent, Code Assistant" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of the agent's purpose" />
          </Form.Item>

          <Form.Item
            name="aIModelId"
            label="AI Model"
            rules={[{ required: true, message: 'Please select an AI model' }]}
          >
            <Select
              placeholder="Select AI model for this agent"
              loading={loading}
              options={models.map((model) => ({
                label: `${model.name} (${model.type})`,
                value: model.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={loading ? 'Loading models...' : 'No models found for this platform'}
            />
          </Form.Item>

          <Form.Item name="personality" label="Personality (Optional)">
            <Input.TextArea
              rows={3}
              placeholder="Define the agent's personality traits (e.g., professional, friendly, concise)"
            />
          </Form.Item>

          <Form.Item name="systemPrompt" label="System Prompt (Optional)">
            <Input.TextArea rows={3} placeholder="System-level instructions for the agent" />
          </Form.Item>

          <Form.Item name="config" label="Configuration (Optional)">
            <Input.TextArea
              rows={2}
              placeholder='JSON configuration (e.g., {"temperature": 0.7, "max_tokens": 2000})'
            />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
