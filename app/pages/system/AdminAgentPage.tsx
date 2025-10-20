import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MessageOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  RobotOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Avatar,
  Badge,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { useAuth } from '../../hooks/useAuth.tsx';

type ColumnsType<T> = TableProps<T>['columns'];

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Agent {
  id: string;
  name: string;
  description?: string;
  model: string;
  personality?: string;
  systemPrompt?: string;
  config?: string;
  isActive: boolean;
  _count: {
    conversations: number;
    memories: number;
    tools: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AgentMemory {
  id: string;
  type: string;
  content: string;
  importance: number;
  metadata: string;
  createdAt: string;
}

interface AgentTool {
  id: string;
  name: string;
  type: string;
  config: string;
  enabled: boolean;
  createdAt: string;
}

interface AgentTask {
  id: string;
  name: string;
  status: string;
  input: string;
  output: string;
  startedAt: string;
  createdAt: string;
}

const modelOptions = [
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude-3 Opus', value: 'claude-3-opus' },
  { label: 'Claude-3 Sonnet', value: 'claude-3-sonnet' },
];

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

const memoryTypes = [
  { label: 'Short Term', value: 'short_term' },
  { label: 'Long Term', value: 'long_term' },
  { label: 'Knowledge Base', value: 'knowledge_base' },
];

export default function AdminAgentPage() {
  const { token } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [form] = Form.useForm();
  const [agentDetails, setAgentDetails] = useState<{
    memories: AgentMemory[];
    tools: AgentTool[];
    tasks: AgentTask[];
  }>({ memories: [], tools: [], tasks: [] });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAgents();
      setAgents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      message.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (values: any) => {
    try {
      const personality = {
        traits: values.traits || [],
        tone: values.tone || 'professional',
        style: values.style || 'helpful',
        expertise: values.expertise?.split(',').map((s: string) => s.trim()) || [],
      };

      const config = {
        temperature: values.temperature || 0.7,
        maxTokens: values.maxTokens || 1000,
        topP: values.topP || 1,
        frequencyPenalty: values.frequencyPenalty || 0,
        presencePenalty: values.presencePenalty || 0,
      };

      await adminApi.createAgent({
        ...values,
        personality: JSON.stringify(personality),
        config: JSON.stringify(config),
      });

      message.success('Agent created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      message.error('Failed to create agent');
    }
  };

  const handleUpdateAgent = async (agent: Agent, values: any) => {
    try {
      await adminApi.updateAgent(agent.id, values);
      message.success('Agent updated successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
      message.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    try {
      await adminApi.deleteAgent(agent.id);
      message.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      message.error('Failed to delete agent');
    }
  };

  const handleToggleAgent = async (agent: Agent) => {
    await handleUpdateAgent(agent, { isActive: !agent.isActive });
  };

  const fetchAgentDetails = async (agentId: string) => {
    try {
      // Fetch memories
      const response = await adminApi.getAgentMemories(agentId);
      const memories = response.data?.data || [];

      // For now, set empty arrays for tools and tasks
      // These would be fetched from respective endpoints when implemented
      setAgentDetails({
        memories,
        tools: [],
        tasks: [],
      });
    } catch (error) {
      console.error('Error fetching agent details:', error);
      message.error('Failed to fetch agent details');
    }
  };

  const showAgentDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setDrawerVisible(true);
    fetchAgentDetails(agent.id);
  };

  const editAgent = (agent: Agent) => {
    const personality = agent.personality ? JSON.parse(agent.personality) : {};
    const config = agent.config ? JSON.parse(agent.config) : {};

    form.setFieldsValue({
      name: agent.name,
      description: agent.description,
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      traits: personality.traits || [],
      tone: personality.tone || 'professional',
      style: personality.style || 'helpful',
      expertise: personality.expertise?.join(', ') || '',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      topP: config.topP || 1,
      frequencyPenalty: config.frequencyPenalty || 0,
      presencePenalty: config.presencePenalty || 0,
      isActive: agent.isActive,
    });
    setSelectedAgent(agent);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      inactive: 'red',
      pending: 'orange',
      running: 'blue',
      completed: 'green',
      failed: 'red',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<Agent> = [
    {
      title: 'Agent',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: Agent) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar
            icon={<RobotOutlined />}
            style={{ backgroundColor: record.isActive ? '#52c41a' : '#d9d9d9', width: 80 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description || 'No description'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Badge status={isActive ? 'success' : 'default'} text={isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      title: 'Usage Stats',
      key: 'stats',
      width: 180,
      render: (_: any, record: Agent) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: '12px' }}>
            <MessageOutlined /> {record._count.conversations} conversations
          </Text>
          <Text style={{ fontSize: '12px' }}>
            <MessageOutlined /> {record._count.memories} memories
          </Text>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Agent) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => showAgentDetails(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => editAgent(record)} />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
            <Button
              type="text"
              icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleAgent(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            description="This will delete all associated conversations, memories, and tasks."
            onConfirm={() => handleDeleteAgent(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Title level={2}>🤖 AI Agents</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedAgent(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Create Agent
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={agents}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200, y: 600 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} agents`,
        }}
      />

      {/* Create/Edit Agent Modal */}
      <Modal
        title={selectedAgent ? 'Edit Agent' : 'Create New Agent'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedAgent(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={
            selectedAgent ? (values) => handleUpdateAgent(selectedAgent, values) : handleCreateAgent
          }
        >
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
            name="model"
            label="AI Model"
            rules={[{ required: true, message: 'Please select an AI model' }]}
          >
            <Select placeholder="Select AI model">
              {modelOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
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
            <Select
              mode="multiple"
              placeholder="Select personality traits"
              style={{ width: '100%' }}
            >
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
              <Button type="primary" htmlType="submit">
                {selectedAgent ? 'Update Agent' : 'Create Agent'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Agent Details Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar
              icon={<RobotOutlined />}
              style={{ backgroundColor: selectedAgent?.isActive ? '#52c41a' : '#d9d9d9' }}
            />
            {selectedAgent?.name}
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedAgent && (
          <Tabs defaultActiveKey="overview">
            <TabPane tab="Overview" key="overview">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Name">{selectedAgent.name}</Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedAgent.description}
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  <Tag color="blue">{selectedAgent.model}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge
                    status={selectedAgent.isActive ? 'success' : 'default'}
                    text={selectedAgent.isActive ? 'Active' : 'Inactive'}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="System Prompt">
                  <Paragraph>{selectedAgent.systemPrompt}</Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Personality">
                  {selectedAgent.personality && (
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                      {JSON.stringify(JSON.parse(selectedAgent.personality), null, 2)}
                    </pre>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={`Memories (${agentDetails.memories.length})`} key="memories">
              <List
                dataSource={agentDetails.memories}
                renderItem={(memory) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Tag color={getStatusColor(memory.type)}>{memory.type}</Tag>
                          <Text style={{ fontSize: '12px' }}>
                            Importance: {memory.importance}/10
                          </Text>
                        </div>
                      }
                      description={memory.content}
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab={`Tools (${agentDetails.tools.length})`} key="tools">
              <List
                dataSource={agentDetails.tools}
                renderItem={(tool) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ToolOutlined />}
                      title={tool.name}
                      description={
                        <div>
                          <Tag color={tool.enabled ? 'green' : 'red'}>
                            {tool.enabled ? 'Enabled' : 'Disabled'}
                          </Tag>
                          <Tag>{tool.type}</Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab={`Tasks (${agentDetails.tasks.length})`} key="tasks">
              <List
                dataSource={agentDetails.tasks}
                renderItem={(task) => (
                  <List.Item>
                    <List.Item.Meta
                      title={task.name}
                      description={
                        <div>
                          <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                          <Text style={{ fontSize: '12px' }}>
                            {new Date(task.createdAt).toLocaleDateString()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
}
