import type { FormInstance } from 'antd';
import {
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Tabs,
  Checkbox,
  Table,
  Tag,
  Button,
} from 'antd';
import React, { useEffect, useState } from 'react';

interface ToolCommand {
  id: string;
  name: string;
  description: string;
  action: string;
  repository: string;
  params: string;
  exampleParams: string;
  enabled: boolean;
  createdAt: string;
}

interface Tool {
  id: string;
  name: string;
  type: string;
  config: string;
  enabled: boolean;
  createdAt: string;
  commands?: ToolCommand[];
}

interface Agent {
  id: string;
  name: string;
  model?: {
    name?: string;
  };
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
          console.log(data);
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

  const commandColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action: string) => {
        const colorMap: Record<string, string> = {
          GET: 'blue',
          POST: 'green',
          PUT: 'orange',
          DELETE: 'red',
        };
        return <Tag color={colorMap[action] || 'default'}>{action}</Tag>;
      },
    },
    {
      title: 'Repository',
      dataIndex: 'repository',
      key: 'repository',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>{enabled ? 'Enabled' : 'Disabled'}</Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (_: any, record: ToolCommand) => (
        <Button color="blue" style={{ cursor: 'pointer' }} onClick={() => {}}>
          Exec
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={editingTool ? 'Edit Tool' : 'Add Tool'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={editingTool ? 'Update' : 'Create'}
      width={800}
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
                  {Array.isArray((toolData as any)?.agents) &&
                  (toolData as any)?.agents.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {(toolData as any).agents.map((agent: Agent) => (
                        <li key={agent.id} style={{ marginBottom: 8 }}>
                          <strong>{agent.name}</strong>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            {agent.model?.name ? agent.model?.name : 'Unknown Model'}
                          </div>
                        </li>
                      ))}
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

              {/* Tool Commands Section */}
              {toolData?.commands && toolData.commands.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ marginBottom: 12 }}>Tool Commands ({toolData.commands.length})</h3>
                  <Table
                    dataSource={toolData.commands}
                    columns={commandColumns}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ x: 800 }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <div style={{ padding: '8px 16px' }}>
                          <div style={{ marginBottom: 8 }}>
                            <strong>Params:</strong>
                            <pre
                              style={{
                                background: '#f5f5f5',
                                padding: 8,
                                borderRadius: 4,
                                marginTop: 4,
                                fontSize: 12,
                              }}
                            >
                              {typeof record.params === 'string'
                                ? JSON.stringify(JSON.parse(record.params), null, 2)
                                : JSON.stringify(record.params, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <strong>Example Params:</strong>
                            <pre
                              style={{
                                background: '#f5f5f5',
                                padding: 8,
                                borderRadius: 4,
                                marginTop: 4,
                                fontSize: 12,
                              }}
                            >
                              {typeof record.exampleParams === 'string'
                                ? JSON.stringify(JSON.parse(record.exampleParams), null, 2)
                                : JSON.stringify(record.exampleParams, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ),
                      rowExpandable: (record) => !!record.params || !!record.exampleParams,
                    }}
                  />
                </div>
              )}
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
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={2} placeholder="Brief description of the tool" />
              </Form.Item>
              {/* Related tools: multi-select with search */}
              <Form.Item name="relatedAgentIds" label="Related Agents">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Select related agents"
                  optionFilterProp="children"
                  value={form.getFieldValue('relatedAgentIds') || []}
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {availableAgents.map((agent) => (
                    <Select.Option key={agent.id} value={agent.id}>
                      <p>{agent.name}</p>
                      <small>{agent?.model?.name}</small>
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
              {/* ✅ Commands List */}
              <Form.Item label="Commands">
                {toolData?.commands && toolData.commands.length > 0 ? (
                  <div
                    style={{
                      background: '#fafafa',
                      border: '1px solid #f0f0f0',
                      borderRadius: 6,
                      padding: 8,
                      maxHeight: 200,
                      overflowY: 'auto',
                    }}
                  >
                    {toolData?.commands?.map((cmd: any, idx: number) => (
                      <div
                        key={cmd.id || idx}
                        style={{
                          padding: '6px 8px',
                          borderBottom:
                            idx < Number(toolData?.commands?.length) - 1
                              ? '1px solid #eee'
                              : 'none',
                        }}
                      >
                        <strong>{cmd.label || cmd.name}</strong>
                        {cmd.description && (
                          <p style={{ margin: '4px 0', fontSize: 12, color: '#555' }}>
                            {cmd.description}
                          </p>
                        )}
                        {cmd.model?.name && (
                          <small style={{ color: '#888' }}>Model: {cmd.model.name}</small>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888', fontStyle: 'italic' }}>
                    No commands linked to this tool.
                  </p>
                )}
              </Form.Item>

              <Form.Item name="enabled" label="Enabled" valuePropName="checked">
                <Checkbox>Enabled</Checkbox>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default ToolModal;
