import { ArrowLeftOutlined, BugOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Editor } from '@monaco-editor/react';
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AgentApi, ToolApi, ToolCommandApi } from '../../../../../apis/admin.api.ts';
import { EntityMethodApiInstance } from '../../../../../apis/adminApi/EntityMethodApi.ts';

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
  const [entityMethodOptions, setEntityMethodOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [commandData, setCommandData] = useState<any>(null);
  const [paramsValue, setParamsValue] = useState<string>('{}');
  const [exampleParamsValue, setExampleParamsValue] = useState<string>('{}');

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

            // Format JSON for Monaco Editor
            const params = data.params;
            const exampleParams = data.exampleParams;

            if (params) {
              const formattedParams =
                typeof params === 'string' ? params : JSON.stringify(params, null, 2);
              setParamsValue(formattedParams);
            }

            if (exampleParams) {
              const formattedExampleParams =
                typeof exampleParams === 'string'
                  ? exampleParams
                  : JSON.stringify(exampleParams, null, 2);
              setExampleParamsValue(formattedExampleParams);
            }

            // Set form values without params and exampleParams (handled by Monaco)
            const { params: _, exampleParams: __, ...formData } = data;
            form.setFieldsValue(formData);
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

    const fetchEntityMethods = async () => {
      try {
        const res = await EntityMethodApiInstance.getAll();
        if (Array.isArray(res?.data?.data)) {
          setEntityMethodOptions(
            res.data.data.map((method: any) => ({
              label: `${method.name} - ${method.description || 'No description'}`,
              value: method.id,
            }))
          );
        }
      } catch (e) {
        console.error('Error fetching entity methods:', e);
      }
    };

    fetchCommand();
    fetchTools();
    fetchAgents();
    fetchEntityMethods();
  }, [command, form]);

  const handleUpdate = async (values: any) => {
    if (!command) return;

    setSaving(true);
    try {
      // Merge form values with Monaco editor values
      const updateData = {
        ...values,
        params: paramsValue,
        exampleParams: exampleParamsValue,
      };

      await ToolCommandApi.updateToolCommand(command, updateData);
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
        params: paramsValue,
        exampleParams: exampleParamsValue,
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
        params: paramsValue,
        exampleParams: exampleParamsValue,
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

              <Form.Item label="Parameters (JSON)">
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 2 }}>
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    value={paramsValue}
                    onChange={(value: string | undefined) => setParamsValue(value || '{}')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                    theme="vs-light"
                  />
                </div>
              </Form.Item>

              <Form.Item label="Example Parameters (JSON)">
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 2 }}>
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    value={exampleParamsValue}
                    onChange={(value: string | undefined) => setExampleParamsValue(value || '{}')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                    theme="vs-light"
                  />
                </div>
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

              <Form.Item name="entityMethodIds" label="Entity Methods">
                <Select
                  size="small"
                  mode="multiple"
                  allowClear
                  placeholder="Select entity methods"
                  options={entityMethodOptions}
                  showSearch
                  optionFilterProp="label"
                  style={{ width: '100%' }}
                />
              </Form.Item>

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
                          if (!paramsValue || paramsValue === '{}') return 'No parameters.';
                          return JSON.stringify(JSON.parse(paramsValue), null, 2);
                        } catch {
                          return paramsValue || 'No parameters.';
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
