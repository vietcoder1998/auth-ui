import { Modal, Select, Form, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { AIKeyApi } from '~/apis/admin/AIKeyApi.ts';

const { Option } = Select;

interface UpdateModelKeyModalProps {
  visible: boolean;
  model: any;
  onOk: (keyId: string) => void;
  onCancel: () => void;
}

export default function UpdateModelKeyModal({
  visible,
  model,
  onOk,
  onCancel,
}: UpdateModelKeyModalProps) {
  const [form] = Form.useForm();
  const [aiKeys, setAIKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAIKeys();
      // Reset form when modal opens
      form.resetFields();
    }
  }, [visible, form]);

  const fetchAIKeys = async () => {
    setLoading(true);
    try {
      const response = await AIKeyApi.getAIKeys();
      const keys = response.data?.data || [];

      // Filter keys by platform if model has a platform
      const filteredKeys = model?.platformId
        ? keys.filter((key: any) => key.platformId === model.platformId)
        : keys;

      setAIKeys(filteredKeys);
    } catch (error) {
      message.error('Failed to fetch AI Keys');
      setAIKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values.aiKeyId);
      form.resetFields();
    } catch (error) {
      // Validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`Update AI Key for Model: ${model?.name || 'Unknown'}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
      width={600}
    >
      <Spin spinning={loading}>
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: '#fff7e6',
            borderRadius: 4,
            border: '1px solid #ffd591',
          }}
        >
          <div style={{ fontSize: 13, color: '#fa8c16' }}>
            ℹ️ <strong>Note:</strong> This will assign the AI Key to all agents using this model.
          </div>
          {model?.agents && model.agents.length > 0 && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Affected agents: {model.agents.length}
            </div>
          )}
        </div>
        <Form form={form} layout="vertical">
          <Form.Item
            name="aiKeyId"
            label="Select AI Key"
            rules={[{ required: true, message: 'Please select an AI Key' }]}
          >
            <Select placeholder="Select an AI Key" showSearch optionFilterProp="children">
              {aiKeys.map((key) => (
                <Option key={key.id} value={key.id}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{key.name}</div>
                    {key.description && (
                      <div style={{ fontSize: 12, color: '#888' }}>{key.description}</div>
                    )}
                    {key.platform && (
                      <div style={{ fontSize: 11, color: '#1890ff' }}>
                        Platform: {key.platform.name}
                      </div>
                    )}
                    {key.isActive ? (
                      <span style={{ fontSize: 11, color: '#52c41a' }}>● Active</span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#999' }}>● Inactive</span>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {model?.platform && (
            <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: '#666' }}>
                <strong>Model Platform:</strong> {model.platform.name}
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                {aiKeys.length > 0
                  ? `Showing ${aiKeys.length} AI Key(s) for this platform`
                  : 'No AI Keys available for this platform'}
              </div>
            </div>
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
