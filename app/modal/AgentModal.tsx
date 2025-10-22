import { Modal, Form, Input, Select, Divider, Switch, Button, Space } from 'antd';
import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin.api.ts';

const { TextArea } = Input;
const { Option } = Select;

const personalityTraits = [
  'helpful',
  'friendly',
  'professional',
  'analytical',
  'creative',
  'patient',
  'encouraging',
  'technical',
  'strategic',
  'empathetic',
];

export default function AgentModal({
  visible,
  onOk,
  onCancel,
  initialValues,
  isEdit,
}: {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
  isEdit?: boolean;
}) {
  const [form] = Form.useForm();
  const [aiModels, setAIModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setModelsLoading(true);
      adminApi
        .getAIModels()
        .then((res: any) => {
          setAIModels(res.data?.data || []);
        })
        .catch(() => setAIModels([]))
        .finally(() => setModelsLoading(false));
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch {}
  };

  return (
    <Modal
      title={isEdit ? 'Edit Agent' : 'Create New Agent'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label="Agent Name"
          rules={[{ required: true, message: 'Please enter agent name' }]}
        >
          <Input placeholder="e.g., Customer Support Assistant" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={2}
            placeholder="Brief description of the agent's purpose and capabilities"
          />
        </Form.Item>

        <Form.Item
          name="aiModelId"
          label="AI Model"
          rules={[{ required: true, message: 'Please select an AI model' }]}
        >
          <Select placeholder="Select AI model" loading={modelsLoading} showSearch allowClear>
            {aiModels.map((model) => (
              <Option key={model.id} value={model.id}>
                {model.name || model.id}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="systemPrompt" label="System Prompt">
          <TextArea
            rows={4}
            placeholder="System instructions that define the agent's behavior and role"
          />
        </Form.Item>

        <Divider>Personality Configuration</Divider>

        <Form.Item name="traits" label="Personality Traits">
          <Select mode="multiple" placeholder="Select personality traits" style={{ width: '100%' }}>
            {personalityTraits.map((trait) => (
              <Option key={trait} value={trait}>
                {trait}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="tone" label="Communication Tone">
          <Select placeholder="Select communication tone">
            <Option value="professional">Professional</Option>
            <Option value="friendly">Friendly</Option>
            <Option value="casual">Casual</Option>
            <Option value="formal">Formal</Option>
            <Option value="technical">Technical</Option>
          </Select>
        </Form.Item>

        <Form.Item name="style" label="Response Style">
          <Select placeholder="Select response style">
            <Option value="concise">Concise</Option>
            <Option value="detailed">Detailed</Option>
            <Option value="conversational">Conversational</Option>
            <Option value="structured">Structured</Option>
          </Select>
        </Form.Item>

        <Form.Item name="expertise" label="Areas of Expertise">
          <Input placeholder="e.g., customer service, technical support, sales (comma-separated)" />
        </Form.Item>

        <Divider>Model Configuration</Divider>

        <Form.Item name="temperature" label="Temperature">
          <Input
            type="number"
            min={0}
            max={2}
            step={0.1}
            placeholder="0.7"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="maxTokens" label="Max Tokens">
          <Input type="number" min={1} max={4000} placeholder="1000" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="isActive" label="Status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleOk} htmlType="submit">
              {isEdit ? 'Update Agent' : 'Create Agent'}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
