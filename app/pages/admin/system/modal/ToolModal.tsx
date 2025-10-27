import type { FormInstance } from 'antd';
import { Descriptions, Form, Input, Modal, Select, Tabs } from 'antd';
import React from 'react';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';

interface Tool {
  id: string;
  name: string;
  type: string;
  config: string;
  enabled: boolean;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  model?: string;
}

interface ToolModalProps {
  visible: boolean;
  editingTool: Tool | null;
  availableAgents: Agent[];
  form: FormInstance;
  onCancel: () => void;
  onCreate: (values: any) => Promise<void>;
  onEdit: (values: any) => Promise<void>;
  fetchTool?: (id: string) => Promise<Tool | null>;
}

const ToolModal: React.FC<ToolModalProps> = ({
  visible,
  editingTool,
  availableAgents,
  form,
  onCancel,
  onCreate,
  onEdit,
  fetchTool,
}) => {
  const [loading, setLoading] = useState(false);
  const [toolData, setToolData] = useState<Tool | null>(editingTool);

  useEffect(() => {
    if (visible && editingTool && editingTool.id && fetchTool) {
      setLoading(true);
      fetchTool(editingTool.id)
        .then((data) => {
          setToolData(data);
          if (data) {
            form.setFieldsValue({
              ...data,
              config:
                typeof data.config === 'string'
                  ? data.config
                  : JSON.stringify(data.config, null, 2),
            });
          }
        })
        .finally(() => setLoading(false));
    } else if (!visible) {
      setToolData(editingTool);
      setLoading(false);
    }
  }, [visible, editingTool, fetchTool, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values: any) => {
        if (editingTool) {
          onEdit(values);
        } else {
          onCreate(values);
        }
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={editingTool ? 'Edit Tool' : 'Add Tool'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={editingTool ? 'Update' : 'Create'}
    >
      <Spin spinning={loading} tip="Loading tool data...">
        <Tabs defaultActiveKey={editingTool ? 'edit' : 'detail'}>
          {editingTool && (
            <Tabs.TabPane tab="Detail" key="detail">
              <Descriptions title="Tool Details" bordered size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="ID">{toolData?.id}</Descriptions.Item>
                <Descriptions.Item label="Name">{toolData?.name}</Descriptions.Item>
                <Descriptions.Item label="Type">{toolData?.type}</Descriptions.Item>
                <Descriptions.Item label="Enabled">
                  {toolData?.enabled ? 'Yes' : 'No'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">{toolData?.createdAt}</Descriptions.Item>
                <Descriptions.Item label="Related Agents" span={3}>
                  {Array.isArray((toolData as any)?.relatedAgentIds) &&
                  (toolData as any)?.relatedAgentIds.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {(toolData as any).relatedAgentIds.map((id: string) => {
                        const agent = availableAgents.find((a) => a.id === id);
                        return (
                          <li key={id} style={{ marginBottom: 8 }}>
                            <strong>{agent ? agent.name : id}</strong>
                            <div style={{ fontSize: 12, color: '#888' }}>
                              {agent && agent.model ? agent.model : 'Unknown Model'}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    'None'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Config" span={3}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {typeof toolData?.config === 'string'
                      ? toolData?.config
                      : JSON.stringify(toolData?.config, null, 2)}
                  </pre>
                </Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>
          )}
          <Tabs.TabPane tab="Edit" key="edit">
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              {/* Related tools: multi-select with search */}
              <Form.Item name="relatedAgentIds" label="Related Agents">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Select related agents"
                  optionFilterProp="children"
                  value={form.getFieldValue('agentId') || []}
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {availableAgents.map((agent) => (
                    <Select.Option key={agent.id} value={agent.id}>
                      {agent.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="config" label="Config">
                <Form.Item name="config" noStyle>
                  {editingTool ? (
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: 8,
                        borderRadius: 4,
                        minHeight: 120,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: 12,
                      }}
                    >
                      {typeof toolData?.config === 'string'
                        ? toolData?.config
                        : JSON.stringify(toolData?.config, null, 2)}
                    </pre>
                  ) : (
                    <Input.TextArea
                      rows={10}
                      value={JSON.stringify(form.getFieldValue('config') || '{}')}
                      onChange={(e) => form.setFieldValue('config', e.target.value)}
                    />
                  )}
                </Form.Item>
              </Form.Item>
              <Form.Item name="enabled" label="Enabled" valuePropName="checked">
                <Input type="checkbox" />
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default ToolModal;
