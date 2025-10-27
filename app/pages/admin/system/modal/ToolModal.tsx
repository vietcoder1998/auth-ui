import type { FormInstance } from 'antd';
import { Descriptions, Form, Input, Modal, Select, Tabs } from 'antd';
import React from 'react';

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
}

interface ToolModalProps {
  visible: boolean;
  editingTool: Tool | null;
  availableAgents: Agent[];
  form: FormInstance;
  onCancel: () => void;
  onCreate: (values: any) => Promise<void>;
  onEdit: (values: any) => Promise<void>;
}

const ToolModal: React.FC<ToolModalProps> = ({
  visible,
  editingTool,
  availableAgents,
  form,
  onCancel,
  onCreate,
  onEdit,
}) => {
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
      <Tabs defaultActiveKey={editingTool ? 'edit' : 'detail'}>
        {editingTool && (
          <Tabs.TabPane tab="Detail" key="detail">
            <Descriptions title="Tool Details" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ID">{editingTool.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{editingTool.name}</Descriptions.Item>
              <Descriptions.Item label="Type">{editingTool.type}</Descriptions.Item>
              <Descriptions.Item label="Enabled">
                {editingTool.enabled ? 'Yes' : 'No'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">{editingTool.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Related Agents" span={3}>
                {Array.isArray((editingTool as any).relatedAgentIds) &&
                (editingTool as any).relatedAgentIds.length > 0
                  ? (editingTool as any).relatedAgentIds
                      .map((id: string) => {
                        const agent = availableAgents.find((a) => a.id === id);
                        return agent ? agent.name : id;
                      })
                      .join(', ')
                  : 'None'}
              </Descriptions.Item>
              <Descriptions.Item label="Config" span={3}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {typeof editingTool.config === 'string'
                    ? editingTool.config
                    : JSON.stringify(editingTool.config, null, 2)}
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
                    {typeof editingTool.config === 'string'
                      ? editingTool.config
                      : JSON.stringify(editingTool.config, null, 2)}
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
    </Modal>
  );
};

export default ToolModal;
