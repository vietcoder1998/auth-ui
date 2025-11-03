import { Form, Input, Modal, Select, Spin } from 'antd';
import { useEffect as useModalEffect, useState } from 'react';
import { AIKeyApiInstance } from '../apis/admin/AIKeyApi.ts';
import { AgentApi } from '../apis/admin/AgentApi.ts';

interface AddAIKeyModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  editingKey?: any;
  platforms?: any[];
}

export default function AddAIKeyModal({
  visible,
  onOk,
  onCancel,
  editingKey,
  platforms = [],
}: AddAIKeyModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [keyDetail, setKeyDetail] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);

  // Fetch agents
  useModalEffect(() => {
    const fetchAgents = async () => {
      if (visible) {
        try {
          const response = await AgentApi.getAgents();
          const agentsData = response.data?.data || [];
          debugger;
          setAgents(agentsData);
        } catch (error) {
          console.error('Failed to fetch agents:', error);
          setAgents([]);
        }
      }
    };

    fetchAgents();
  }, [visible]);

  useModalEffect(() => {
    const fetchKeyDetail = async () => {
      if (visible && editingKey?.id) {
        setLoading(true);
        try {
          // Fetch full AI key details including agents
          const response = await AIKeyApiInstance.getById(editingKey.id);
          const keyData = response.data?.data;
          setKeyDetail(keyData);

          // Extract agent IDs from the key's agents relation
          const agentIds = keyData?.agents?.map((a: any) => a.agentId || a.id) || [];

          form.setFieldsValue({
            key: keyData?.key || editingKey.key,
            name: keyData?.name || editingKey.name,
            description: keyData?.description || editingKey.description,
            platformId: keyData?.platformId || editingKey.platformId,
            agentIds: agentIds,
          });
        } catch (error) {
          console.error('Failed to fetch AI key details:', error);
          // Fallback to editingKey data
          form.setFieldsValue({
            ...editingKey,
            agentIds: editingKey.agentIds || [],
            platformId: editingKey.platformId || undefined,
          });
        } finally {
          setLoading(false);
        }
      } else if (visible && !editingKey) {
        form.resetFields();
        setKeyDetail(null);
      }
    };

    fetchKeyDetail();
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
      confirmLoading={loading}
    >
      <Spin spinning={loading} tip="Loading AI Key details...">
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
                  style={{
                    marginBottom: 12,
                    padding: 8,
                    border: '1px solid #eee',
                    borderRadius: 4,
                  }}
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
      </Spin>
    </Modal>
  );
}
