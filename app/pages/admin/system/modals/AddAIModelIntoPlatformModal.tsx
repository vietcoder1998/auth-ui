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
      setAgents(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      message.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
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
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'gpt',
          }}
        >
          <Form.Item
            name="name"
            label="Model Name"
            rules={[
              { required: true, message: 'Please enter a name for this model' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="e.g., GPT-4, Claude-3, Gemini Pro" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Model Type"
            rules={[{ required: true, message: 'Please select the model type' }]}
          >
            <Select
              placeholder="Select model type"
              options={modelTypes}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
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
                label: `${agent.name}${agent.description ? ` - ${agent.description}` : ''}`,
                value: agent.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
