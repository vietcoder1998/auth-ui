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
  Drawer,
  Form,
  Input,
  List,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { AIKeyApi, AIKeyApiInstance } from '~/apis/admin/AIKeyApi.ts';
import AIKeyDetailModal from '../modals/AIKeyDetailModal.tsx';
import { adminApi } from '~/apis/admin/index.ts';
import { useAuth } from '../../../../hooks/useAuth.tsx';
import AgentModal from '../modals/AgentModal.tsx';
import CommonSearch from '../../../../components/CommonSearch.tsx';

type ColumnsType<T> = TableProps<T>['columns'];

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Agent {
  id: string;
  name: string;
  description?: string;
  model:
    | string
    | {
        id: string;
        name: string;
        description?: string;
        type?: string;
        platformId?: string;
        createdAt?: string;
        updatedAt?: string;
      };
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
  const [search, setSearch] = useState('');
  const [aiKeys, setAIKeys] = useState<any[]>([]);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any | null>(null);
  // Fetch all AI Keys for modal
  const fetchAIKeys = async () => {
    try {
      const res = await AIKeyApi.getAIKeys();
      setAIKeys(res.data?.data || []);
    } catch (e) {
      setAIKeys([]);
    }
  };
  // Handler to open key modal
  const handleOpenKeyModal = () => {
    fetchAIKeys();
    setKeyModalVisible(true);
  };

  // Handler to change key for agent's model
  const handleChangeKey = async (key: any) => {
    if (!selectedAgent || !selectedAgent.model || !key) return;
    try {
      // Assume backend supports updating model's key by agent/model id
      await adminApi.updateAgent(selectedAgent.id, { aiKeyId: key.id });
      message.success('AI Key updated for model');
      setKeyModalVisible(false);
      setSelectedKey(null);
      fetchAgents();
    } catch (e) {
      message.error('Failed to update AI Key');
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      fetchAgents();
      return;
    }
    setLoading(true);
    adminApi
      .getAgents(search)
      .then((response: any) => {
        setAgents(response.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setAgents([]);
        setLoading(false);
      });
  }, [search]);

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
      setSearch(''); // Reset search to show all after create
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
      setModalVisible(false);
      setSelectedAgent(null);
      form.resetFields();
      setSearch(''); // Reset search to show all after update
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
      setSearch(''); // Reset search to show all after delete
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
      const response = await adminApi.getAgentMemories({ agentId });
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
    let personality: any = {};
    let config: any = {};
    try {
      if (agent.personality) {
        personality =
          typeof agent.personality === 'string' ? JSON.parse(agent.personality) : agent.personality;
      }
    } catch (e) {
      personality = {};
    }
    try {
      if (agent.config) {
        config = typeof agent.config === 'string' ? JSON.parse(agent.config) : agent.config;
      }
    } catch (e) {
      config = {};
    }

    form.setFieldsValue({
      name: agent.name,
      description: agent.description,
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      traits: personality.traits || [],
      tone: personality.tone || 'professional',
      style: personality.style || 'helpful',
      expertise: Array.isArray(personality.expertise) ? personality.expertise.join(', ') : '',
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
      width: 350,
      render: (_: string, record: Agent) => {
        const modelName = typeof record.model === 'string' ? record.model : record.model?.name;
        // Fallback for key name
        const keyName = typeof record.model !== 'string' && (record.model as any).aiKeyName;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar
              icon={<RobotOutlined />}
              style={{ backgroundColor: record.isActive ? '#52c41a' : '#d9d9d9', width: 60 }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{record.name}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description || 'No description'}
              </Text>
              <div style={{ marginTop: 4 }}>
                <Tag color="blue">{modelName || 'N/A'}</Tag>
                <Tag color={record.isActive ? 'green' : 'default'}>
                  {record.isActive ? 'Active' : 'Inactive'}
                </Tag>
                <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>Key:</span>
                <Tag color="purple">{keyName || 'N/A'}</Tag>
              </div>
            </div>
          </div>
        );
      },
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
      <div style={{ marginBottom: '24px' }}>
        <CommonSearch
          searchPlaceholder="Search agent name..."
          searchValue={search}
          onSearch={setSearch}
          onRefresh={fetchAgents}
          loading={loading}
          showRefresh={true}
          style={{ marginBottom: 12, border: 'none', boxShadow: 'none', padding: 0 }}
          extra={
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
          }
        />
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
      <AgentModal
        visible={modalVisible}
        onOk={
          selectedAgent
            ? (values: any) => handleUpdateAgent(selectedAgent, values)
            : (values: any) => handleCreateAgent(values)
        }
        onCancel={() => {
          setModalVisible(false);
          setSelectedAgent(null);
          form.resetFields();
        }}
        initialValues={selectedAgent}
        isEdit={!!selectedAgent}
      />

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color="blue">
                      {typeof selectedAgent.model === 'string'
                        ? selectedAgent.model
                        : selectedAgent.model?.name || 'N/A'}
                    </Tag>
                    {/* Display used AI Key if available */}
                    {/* TODO: Update backend to include used key with model. Fallback: show N/A */}
                    <span style={{ fontSize: 12, color: '#888' }}>Key:</span>
                    <Tag color="purple">
                      {(typeof selectedAgent.model !== 'string' &&
                        (selectedAgent.model as any).aiKeyName) ||
                        'N/A'}
                    </Tag>
                    <Button size="small" onClick={handleOpenKeyModal}>
                      Change Key
                    </Button>
                  </div>
                </Descriptions.Item>
                {/* AI Key Selection Modal */}
                <AIKeyDetailModal
                  visible={keyModalVisible}
                  aiKey={selectedKey}
                  onCancel={() => {
                    setKeyModalVisible(false);
                    setSelectedKey(null);
                  }}
                />
                {/* List of keys for selection */}
                {keyModalVisible && (
                  <Drawer
                    title="Select AI Key for Model"
                    open={keyModalVisible}
                    onClose={() => setKeyModalVisible(false)}
                    width={480}
                  >
                    <List
                      dataSource={aiKeys}
                      renderItem={(key) => (
                        <List.Item
                          actions={[
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleChangeKey(key)}
                            >
                              Use This Key
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={key.name}
                            description={
                              <>
                                <div>ID: {key.id}</div>
                                <div>
                                  Key: <span style={{ fontFamily: 'monospace' }}>{key.key}</span>
                                </div>
                                <div>Platform: {key.platformName || key.platformId || 'N/A'}</div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Drawer>
                )}
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
                      {JSON.stringify(
                        typeof selectedAgent.personality === 'string'
                          ? JSON.parse(selectedAgent.personality)
                          : selectedAgent.personality,
                        null,
                        2
                      )}
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
