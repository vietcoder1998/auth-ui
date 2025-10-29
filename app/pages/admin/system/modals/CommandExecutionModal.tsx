import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  message,
  Space,
  Tag,
  Divider,
  Typography,
  Card,
  Spin,
  Descriptions,
} from 'antd';
import {
  PlayCircleOutlined,
  CodeOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { ToolCommandApi } from '../../../../apis/admin.api.ts';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface Entity {
  id: string;
  name: string;
  description?: string;
}

interface EntityMethod {
  id: string;
  name: string;
  code?: string;
  description?: string;
  entityId?: string;
  entity?: Entity;
  createdAt: string;
  updatedAt: string;
}

interface CommandEntityMethod {
  id: string;
  commandId: string;
  entityMethodId: string;
  createdAt: string;
  entityMethod: EntityMethod;
}

interface Tool {
  id: string;
  name: string;
  type: string;
  description?: string;
  enabled: boolean;
}

interface ToolCommand {
  id: string;
  toolId: string;
  name: string;
  description: string;
  command: string;
  parameters: string;
  enabled: boolean;
  createdAt: string;
  tool?: Tool;
  entityMethods?: CommandEntityMethod[];
}

interface CommandExecutionModalProps {
  visible: boolean;
  onCancel: () => void;
  command: ToolCommand | null;
}

const CommandExecutionModal: React.FC<CommandExecutionModalProps> = ({
  visible,
  onCancel,
  command,
}) => {
  const [form] = Form.useForm();
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commandDetails, setCommandDetails] = useState<ToolCommand | null>(null);
  const [parsedParams, setParsedParams] = useState<any>(null);

  const fetchCommandDetails = async (commandId: string) => {
    setLoading(true);
    try {
      const response = await ToolCommandApi.getToolCommand(commandId);
      const fullCommand = response.data.data;
      setCommandDetails(fullCommand);

      // Parse command parameters
      let parsedCommandParams = null;
      let defaultParams = '';

      if (fullCommand.parameters) {
        try {
          parsedCommandParams = JSON.parse(fullCommand.parameters);
          setParsedParams(parsedCommandParams);

          if (parsedCommandParams.exampleParams) {
            defaultParams = JSON.stringify(JSON.parse(parsedCommandParams.exampleParams), null, 2);
          }
        } catch (parseError) {
          console.warn('Failed to parse command parameters:', parseError);
          setParsedParams({ error: 'Invalid JSON format' });
        }
      }

      form.setFieldsValue({
        parameters: defaultParams,
      });
    } catch (error) {
      message.error('Failed to fetch command details');
      console.error('Error fetching command:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && command?.id) {
      // Reset state when modal opens
      setExecutionResult(null);
      setExecutionError(null);
      setCommandDetails(null);
      setParsedParams(null);

      // Fetch full command details
      fetchCommandDetails(command.id);
    }
  }, [visible, command?.id, form]);

  const handleExecute = async () => {
    if (!commandDetails) return;

    try {
      const values = await form.validateFields();
      setExecuting(true);
      setExecutionResult(null);
      setExecutionError(null);

      // Parse parameters
      let executionParams = {};
      if (values.parameters) {
        try {
          executionParams = JSON.parse(values.parameters);
        } catch (parseError) {
          message.error('Invalid JSON parameters');
          return;
        }
      }

      // Simulate API call (replace with actual implementation)
      const response = await new Promise<any>((resolve, reject) => {
        setTimeout(
          () => {
            // Simulate success/failure randomly for demo
            if (Math.random() > 0.2) {
              resolve({
                success: true,
                data: {
                  result: `Command "${commandDetails.name}" executed successfully`,
                  executionTime: Math.floor(Math.random() * 1000) + 100,
                  output: `Execution completed for command: ${commandDetails.name}\n\nTool: ${commandDetails.tool?.name} (${commandDetails.tool?.type})\nAction: ${commandDetails.command}\n\nParameters used:\n${JSON.stringify(executionParams, null, 2)}\n\nEntity Methods involved:\n${commandDetails.entityMethods?.map((em) => `- ${em.entityMethod.name} (${em.entityMethod.entity?.name})`).join('\n') || 'None'}`,
                  params: executionParams,
                  timestamp: new Date().toISOString(),
                  commandInfo: {
                    id: commandDetails.id,
                    name: commandDetails.name,
                    tool: commandDetails.tool?.name,
                    action: commandDetails.command,
                    entityMethodCount: commandDetails.entityMethods?.length || 0,
                  },
                },
              });
            } else {
              reject(new Error('Command execution failed: Network timeout or invalid parameters'));
            }
          },
          1000 + Math.random() * 2000
        ); // Random delay 1-3 seconds
      });

      setExecutionResult(response.data);
      message.success('Command executed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';
      setExecutionError(errorMessage);
      message.error(`Execution failed: ${errorMessage}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setExecutionResult(null);
    setExecutionError(null);
    setCommandDetails(null);
    setParsedParams(null);
    onCancel();
  };

  if (!command) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlayCircleOutlined />
          <span>Execute Command: {commandDetails?.name || command?.name || 'Loading...'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
    >
      <div style={{ marginBottom: 20 }}>
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              tip="Loading command details..."
            />
          </div>
        )}

        {/* Command Information */}
        {!loading && commandDetails && (
          <>
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <Text strong>Command Information</Text>
              </div>

              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Command Name">
                  <Text strong>{commandDetails.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tool">
                  <Space>
                    <Tag color="cyan">{commandDetails.tool?.name || 'Unknown'}</Tag>
                    <Tag color="purple">{commandDetails.tool?.type || 'Unknown'}</Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {commandDetails.description || 'No description'}
                </Descriptions.Item>
                <Descriptions.Item label="Action">
                  <Tag color="blue">{commandDetails.command || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={commandDetails.enabled ? 'green' : 'red'}>
                    {commandDetails.enabled ? 'Enabled' : 'Disabled'}
                  </Tag>
                </Descriptions.Item>
                {commandDetails.entityMethods && commandDetails.entityMethods.length > 0 && (
                  <Descriptions.Item
                    label={`Entity Methods (${commandDetails.entityMethods.length})`}
                  >
                    <Space wrap>
                      {commandDetails.entityMethods.map((em) => (
                        <Tag key={em.id} color="blue" title={em.entityMethod.description}>
                          {em.entityMethod.name} ({em.entityMethod.entity?.name})
                        </Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Command Parameters Display */}
            {parsedParams && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <CodeOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Command Parameters</Text>
                </div>

                <Descriptions size="small" column={1} bordered>
                  {parsedParams.error ? (
                    <Descriptions.Item label="Error">
                      <Text type="danger">{parsedParams.error}</Text>
                    </Descriptions.Item>
                  ) : (
                    <>
                      {parsedParams.name && (
                        <Descriptions.Item label="Name">{parsedParams.name}</Descriptions.Item>
                      )}
                      {parsedParams.route && (
                        <Descriptions.Item label="Route">
                          <Text code>{parsedParams.route}</Text>
                        </Descriptions.Item>
                      )}
                      {parsedParams.method && (
                        <Descriptions.Item label="HTTP Method">
                          <Tag color="orange">{parsedParams.method}</Tag>
                        </Descriptions.Item>
                      )}
                      {parsedParams.exampleParams && (
                        <Descriptions.Item label="Example Parameters">
                          <pre
                            style={{
                              background: '#f5f5f5',
                              padding: 8,
                              borderRadius: 4,
                              fontSize: '12px',
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {JSON.stringify(JSON.parse(parsedParams.exampleParams), null, 2)}
                          </pre>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Full Parameters">
                        <pre
                          style={{
                            background: '#f5f5f5',
                            padding: 8,
                            borderRadius: 4,
                            fontSize: '12px',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {JSON.stringify(parsedParams, null, 2)}
                        </pre>
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>
            )}
          </>
        )}

        {/* Parameter Input Form */}
        {!loading && commandDetails && (
          <>
            <Form form={form} layout="vertical">
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CodeOutlined />
                    <span>Execution Parameters (JSON)</span>
                  </div>
                }
                name="parameters"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      try {
                        JSON.parse(value);
                        return Promise.resolve();
                      } catch {
                        return Promise.reject(new Error('Invalid JSON format'));
                      }
                    },
                  },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Enter execution parameters in JSON format (optional)"
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            </Form>

            {/* Execution Controls */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleExecute}
                  loading={executing}
                  disabled={!commandDetails.enabled}
                >
                  {executing ? 'Executing...' : 'Execute Command'}
                </Button>
                <Button onClick={handleCancel}>Cancel</Button>
                {!commandDetails.enabled && <Tag color="red">Command is disabled</Tag>}
              </Space>
            </div>
          </>
        )}

        <Divider />

        {/* Execution Results */}
        {executing && (
          <Card size="small" style={{ backgroundColor: '#f0f8ff', border: '1px solid #1890ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlayCircleOutlined spin style={{ color: '#1890ff' }} />
              <Text>Executing command... Please wait.</Text>
            </div>
          </Card>
        )}

        {executionResult && (
          <Card
            size="small"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#52c41a' }}>✅</span>
                <span>Execution Result</span>
              </div>
            }
            style={{ backgroundColor: '#f6ffed', border: '1px solid #52c41a' }}
          >
            <Descriptions size="small" column={2} bordered style={{ marginBottom: 12 }}>
              <Descriptions.Item label="Execution Time">
                <Tag color="green">{executionResult.executionTime}ms</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                <Text code>{new Date(executionResult.timestamp).toLocaleString()}</Text>
              </Descriptions.Item>
              {executionResult.commandInfo && (
                <>
                  <Descriptions.Item label="Command ID">
                    <Text code>{executionResult.commandInfo.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tool Used">
                    <Tag color="cyan">{executionResult.commandInfo.tool}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Action">
                    <Tag color="blue">{executionResult.commandInfo.action}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Entity Methods">
                    <Tag color="purple">
                      {executionResult.commandInfo.entityMethodCount} method(s)
                    </Tag>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <div>
              <Text strong>Execution Output:</Text>
              <pre
                style={{
                  background: '#fff',
                  padding: 12,
                  borderRadius: 4,
                  border: '1px solid #d9d9d9',
                  marginTop: 8,
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {executionResult.output}
              </pre>
            </div>
          </Card>
        )}

        {executionError && (
          <Card
            size="small"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#ff4d4f' }}>❌</span>
                <span>Execution Error</span>
              </div>
            }
            style={{ backgroundColor: '#fff2f0', border: '1px solid #ff4d4f' }}
          >
            <Text style={{ color: '#ff4d4f' }}>{executionError}</Text>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default CommandExecutionModal;
