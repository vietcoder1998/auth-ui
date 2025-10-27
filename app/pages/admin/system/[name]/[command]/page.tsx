import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
  Button,
  Collapse,
  Divider,
  Form,
  Input,
  Select,
  Spin,
  Typography,
  Card,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { ToolApi, ToolCommandApi, AgentApi } from '../../../../../apis/admin.api.ts';

const { Text, Title } = Typography;

export default function ToolCommandEditPage() {
  const { name, command } = useParams<{ name: string; command: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [processResult, setProcessResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toolOptions, setToolOptions] = useState<{ label: string; value: string }[]>([]);
  const [agentOptions, setAgentOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [commandData, setCommandData] = useState<any>(null);

  // Fetch command data by id
  useEffect(() => {
    const fetchCommand = async () => {
      if (command) {
        setLoading(true);
        try {
          const res = await ToolCommandApi.getToolCommand(command);
          if (res?.data?.data) {
            const data = res.data.data.data || res.data.data;
            setCommandData(data);
            form.setFieldsValue(data);
          }
        } catch (e) {
          console.error('Error fetching command:', e);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchTools = async () => {
      try {
        const res = await ToolApi.getTools();
        if (Array.isArray(res?.data?.data?.data)) {
          setToolOptions(
            res.data.data.data.map((tool: any) => ({
              label: tool.name || tool.label || tool.id,
              value: tool.id,
            }))
          );
        }
      } catch (e) {
        console.error('Error fetching tools:', e);
      }
    };

    const fetchAgents = async () => {
      try {
        const res = await AgentApi.getAgents();
        if (Array.isArray(res?.data?.data)) {
          setAgentOptions(
            res.data.data.map((agent: any) => ({
              label: agent.name || agent.id,
              value: agent.id,
            }))
          );
        }
      } catch (e) {
        console.error('Error fetching agents:', e);
      }
    };

    fetchCommand();
    fetchTools();
    fetchAgents();
  }, [command, form]);

  const handleUpdate = async (values: any) => {
    if (!command) return;

    setSaving(true);
    try {
      await ToolCommandApi.updateToolCommand(command, values);
      navigate(`/admin/system/${name}`);
    } catch (error: any) {
      console.error('Error updating command:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleProcessCommand = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const values = form.getFieldsValue();
      const result = await ToolCommandApi.processCommand({
        ...values,
        agentId: selectedAgentId,
        type: selectedType,
      });
      setProcessResult(result);
    } catch (error: any) {
      setProcessResult({ success: false, error: error?.message || 'Error processing command' });
    } finally {
      setProcessing(false);
    }
  };

  const handleExecuteCommand = async () => {
    setExecuting(true);
    setProcessResult(null);
    try {
      const values = form.getFieldsValue();
      const result = await ToolCommandApi.executeToolCommand(command || '', {
        ...values,
        agentId: selectedAgentId,
        type: selectedType,
      });
      setProcessResult(result);
    } catch (error: any) {
      setProcessResult({ success: false, error: error?.message || 'Error executing command' });
    } finally {
      setExecuting(false);
    }
  };

  const handleBack = () => {
    navigate(`/admin/system/${name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading command..." />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Button size="small" icon={<ArrowLeftOutlined />} onClick={handleBack} className="mb-4">
          Back to {name}
        </Button>
        <Title level={2}>Edit Tool Command: {commandData?.name || command}</Title>
      </div>

      <Row gutter={24}>
        {/* Left Panel - Form (3/12 = 25%) */}
        <Col xs={24} lg={9}>
          <Card size="small" style={{ height: '100%' }}>
            <Title level={4}>Command Details</Title>
            <Form form={form} layout="vertical" onFinish={handleUpdate} size="small">
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input size="small" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea size="small" rows={2} />
              </Form.Item>

              <Form.Item name="params" label="Parameters (JSON)">
                <Input.TextArea
                  size="small"
                  rows={4}
                  placeholder='{"param1": "value1", "param2": "value2"}'
                />
              </Form.Item>

              <Form.Item name="exampleParams" label="Example Parameters (JSON)">
                <Input.TextArea
                  size="small"
                  rows={4}
                  placeholder='{"param1": "value1", "param2": "value2"}'
                />
              </Form.Item>

              <Form.Item name="toolId" label="Tool(s)" rules={[{ required: true }]}>
                <Select
                  size="small"
                  mode="multiple"
                  allowClear
                  placeholder="Select associated tool(s)"
                  options={toolOptions}
                  showSearch
                  optionFilterProp="label"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  size="small"
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  style={{ flex: 1 }}
                >
                  Save Changes
                </Button>
                <Button size="small" onClick={handleBack}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Right Panel - Process Command (9/12 = 75%) */}
        <Col xs={24} lg={15}>
          <Card size="small" style={{ height: '100%' }}>
            <Title level={4}>Process Command</Title>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Select Type:</Text>
              <Select
                size="small"
                placeholder="Select command type"
                options={[
                  { label: 'Execute', value: 'execute' },
                  { label: 'Query', value: 'query' },
                  { label: 'Update', value: 'update' },
                  { label: 'Create', value: 'create' },
                  { label: 'Delete', value: 'delete' },
                  { label: 'Transform', value: 'transform' },
                ]}
                value={selectedType}
                onChange={setSelectedType}
                allowClear
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Select Agent:</Text>
              <Select
                size="small"
                placeholder="Select an agent to process the command"
                options={agentOptions}
                value={selectedAgentId}
                onChange={setSelectedAgentId}
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <Button
                size="small"
                type="primary"
                icon={<BugOutlined />}
                onClick={handleProcessCommand}
                loading={processing}
                disabled={!selectedAgentId || !selectedType || executing}
                style={{ flex: 1 }}
              >
                Test
              </Button>
              <Button
                size="small"
                type="default"
                icon={<ThunderboltOutlined />}
                onClick={handleExecuteCommand}
                loading={executing}
                disabled={!selectedAgentId || !selectedType || processing}
                danger
                style={{ flex: 1 }}
              >
                Execute
              </Button>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Collapse
              size="small"
              style={{ marginBottom: 12 }}
              items={[
                {
                  key: 'header',
                  label: (
                    <Text strong style={{ fontSize: 12 }}>
                      Header Config
                    </Text>
                  ),
                  children: (
                    <pre
                      style={{
                        margin: 0,
                        background: '#f6f8fa',
                        borderRadius: 4,
                        padding: 8,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: 100,
                        overflow: 'auto',
                      }}
                    >
                      {(() => {
                        try {
                          const headerConfig = {
                            type: selectedType || 'not selected',
                            agentId: selectedAgentId || 'not selected',
                          };
                          return JSON.stringify(headerConfig, null, 2);
                        } catch {
                          return 'No header config.';
                        }
                      })()}
                    </pre>
                  ),
                },
              ]}
            />

            <Collapse
              size="small"
              style={{ marginBottom: 12 }}
              items={[
                {
                  key: 'payload',
                  label: (
                    <Text strong style={{ fontSize: 12 }}>
                      Payload Config
                    </Text>
                  ),
                  children: (
                    <pre
                      style={{
                        margin: 0,
                        background: '#f6f8fa',
                        borderRadius: 4,
                        padding: 8,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: 100,
                        overflow: 'auto',
                      }}
                    >
                      {(() => {
                        try {
                          const params = form.getFieldValue('params');
                          if (!params) return 'No parameters.';
                          if (typeof params === 'string') {
                            return JSON.stringify(JSON.parse(params), null, 2);
                          }
                          return JSON.stringify(params, null, 2);
                        } catch {
                          return String(form.getFieldValue('params'));
                        }
                      })()}
                    </pre>
                  ),
                },
              ]}
            />

            <Collapse
              defaultActiveKey={['1']}
              size="small"
              items={[
                {
                  key: '1',
                  label: (
                    <Text strong style={{ fontSize: 12 }}>
                      Debug Output
                    </Text>
                  ),
                  children: (
                    <div
                      style={{
                        minHeight: 120,
                        maxHeight: 400,
                        background: processResult?.success === false ? '#fff1f0' : '#fafafa',
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        border: processResult?.success === false ? '1px solid #ffccc7' : 'none',
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          color: processResult?.success === false ? '#cf1322' : 'inherit',
                        }}
                      >
                        {processResult ? JSON.stringify(processResult, null, 2) : 'No output yet.'}
                      </pre>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
