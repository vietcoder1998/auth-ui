import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, message, Space, Tag, Divider, Typography, Card } from 'antd';
import { PlayCircleOutlined, CodeOutlined, InfoCircleOutlined } from '@ant-design/icons';

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

  useEffect(() => {
    if (visible && command) {
      // Reset state when modal opens
      setExecutionResult(null);
      setExecutionError(null);

      // Pre-fill form with example parameters if available
      let defaultParams = '';
      if (command.parameters) {
        try {
          const parsedParams = JSON.parse(command.parameters);
          if (parsedParams.exampleParams) {
            defaultParams = JSON.stringify(JSON.parse(parsedParams.exampleParams), null, 2);
          }
        } catch (parseError) {
          console.warn('Failed to parse command parameters:', parseError);
        }
      }

      form.setFieldsValue({
        parameters: defaultParams,
      });
    }
  }, [visible, command, form]);

  const handleExecute = async () => {
    if (!command) return;

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
                  result: `Command "${command.name}" executed successfully`,
                  executionTime: Math.floor(Math.random() * 1000) + 100,
                  output: `Execution completed for command: ${command.name}\n\nParameters used:\n${JSON.stringify(executionParams, null, 2)}\n\nEntity Methods involved:\n${command.entityMethods?.map((em) => `- ${em.entityMethod.name} (${em.entityMethod.entity?.name})`).join('\n')}`,
                  params: executionParams,
                  timestamp: new Date().toISOString(),
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
    onCancel();
  };

  if (!command) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlayCircleOutlined />
          <span>Execute Command: {command.name}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
    >
      <div style={{ marginBottom: 20 }}>
        {/* Command Information */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong>Command Information</Text>
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Tool: </Text>
              <Tag color="cyan">{command.tool?.name || 'Unknown'}</Tag>
              <Tag color="purple">{command.tool?.type || 'Unknown'}</Tag>
            </div>

            <div>
              <Text type="secondary">Description: </Text>
              <Text>{command.description || 'No description'}</Text>
            </div>

            {command.entityMethods && command.entityMethods.length > 0 && (
              <div>
                <Text type="secondary">Entity Methods ({command.entityMethods.length}): </Text>
                <div style={{ marginTop: 4 }}>
                  {command.entityMethods.map((em) => (
                    <Tag
                      key={em.id}
                      color="blue"
                      style={{ marginBottom: 4 }}
                      title={em.entityMethod.description}
                    >
                      {em.entityMethod.name} ({em.entityMethod.entity?.name})
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Space>
        </Card>

        {/* Parameter Input Form */}
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
              disabled={!command.enabled}
            >
              {executing ? 'Executing...' : 'Execute Command'}
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
            {!command.enabled && <Tag color="red">Command is disabled</Tag>}
          </Space>
        </div>

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
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Execution Time: </Text>
                <Tag color="green">{executionResult.executionTime}ms</Tag>
              </div>

              <div>
                <Text strong>Timestamp: </Text>
                <Text code>{new Date(executionResult.timestamp).toLocaleString()}</Text>
              </div>

              <div>
                <Text strong>Output:</Text>
                <pre
                  style={{
                    background: '#fff',
                    padding: 12,
                    borderRadius: 4,
                    border: '1px solid #d9d9d9',
                    marginTop: 8,
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {executionResult.output}
                </pre>
              </div>
            </Space>
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
