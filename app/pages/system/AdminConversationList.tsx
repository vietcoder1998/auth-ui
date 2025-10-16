import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Input,
  Select,
  message,
  Tooltip,
  Badge,
  Drawer,
  List,
  Avatar,
  Divider,
  Empty,
  Spin,
  Popconfirm
} from 'antd';
import {
  MessageOutlined,
  RobotOutlined,
  UserOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  SendOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { TableProps } from 'antd';

type ColumnsType<T> = TableProps<T>['columns'];
import { useAuth } from '../../hooks/useAuth.tsx';
import { adminApi } from '../../apis/admin.api.ts';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  tokens?: number;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  summary: string;
  isActive: boolean;
  agent: Agent;
  user: User;
  messages?: Message[];
  _count?: {
    messages: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminConversationList() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchConversations();
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [searchText, selectedAgent, statusFilter]);

  const fetchAgents = async () => {
    try {
      const response = await adminApi.getAgents();
      setAgents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (selectedAgent) params.agentId = selectedAgent;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.getConversations(params);
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      message.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await adminApi.getConversation(conversationId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      message.error('Failed to fetch messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await adminApi.sendMessage(selectedConversation.id, {
        content: newMessage.trim(),
        sender: 'user'
      });

      // Add both user message and AI response to the messages list
      if (response.data.userMessage && response.data.aiMessage) {
        setMessages(prev => [...prev, response.data.userMessage, response.data.aiMessage]);
      }
      setNewMessage('');
      message.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (conversation: Conversation) => {
    try {
      await adminApi.deleteConversation(conversation.id);
      message.success('Conversation deleted successfully');
      fetchConversations();
      if (selectedConversation?.id === conversation.id) {
        setDrawerVisible(false);
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      message.error('Failed to delete conversation');
    }
  };

  const viewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setDrawerVisible(true);
    fetchMessages(conversation.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageTimeAgo = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const columns: ColumnsType<Conversation> = [
    {
      title: 'Conversation',
      key: 'conversation',
      width: 250,
      render: (_: any, record: Conversation) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
            {record.title || 'Untitled Conversation'}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.summary || 'No summary available'}
          </Text>
        </div>
      )
    },
    {
      title: 'Agent',
      key: 'agent',
      width: 180,
      render: (_: any, record: Conversation) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            size="small"
            icon={<RobotOutlined />} 
            style={{ backgroundColor: record.agent.isActive ? '#52c41a' : '#d9d9d9' }} 
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{record.agent.name}</div>
            <Tag color="blue" style={{ fontSize: '11px' }}>{record.agent.model}</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'User',
      key: 'user',
      width: 180,
      render: (_: any, record: Conversation) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>
              {record.user.nickname || record.user.email}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {record.user.email}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Messages',
      key: 'messages',
      width: 100,
      render: (_: any, record: Conversation) => (
        <div style={{ textAlign: 'center' }}>
          <Badge count={record._count?.messages || 0} showZero />
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Badge 
          status={isActive ? "success" : "default"} 
          text={isActive ? "Active" : "Archived"} 
        />
      )
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      render: (text: string) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {new Date(text).toLocaleDateString()}
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {getMessageTimeAgo(text)}
          </Text>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Conversation) => (
        <Space>
          <Tooltip title="View Conversation">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => viewConversation(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Conversation"
            description="Are you sure you want to delete this conversation? This action cannot be undone."
            onConfirm={() => deleteConversation(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>💬 Conversations</Title>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap style={{ width: '100%' }}>
          <Search
            placeholder="Search conversations..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="Filter by Agent"
            style={{ width: 200 }}
            value={selectedAgent}
            onChange={setSelectedAgent}
            allowClear
          >
            {agents.map(agent => (
              <Option key={agent.id} value={agent.id}>
                <Space>
                  <Badge status={agent.isActive ? "success" : "default"} />
                  {agent.name}
                </Space>
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by Status"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Option value="active">Active</Option>
            <Option value="archived">Archived</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={conversations}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200, y: 600 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} conversations`
          }}
        />
      </Card>

      {/* Conversation Details Drawer */}
      <Drawer
        title={
          selectedConversation && (
            <div>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>
                {selectedConversation.title || 'Untitled Conversation'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  size="small"
                  icon={<RobotOutlined />} 
                  style={{ backgroundColor: selectedConversation.agent.isActive ? '#52c41a' : '#d9d9d9' }} 
                />
                <Text type="secondary">{selectedConversation.agent.name}</Text>
                <Text type="secondary">•</Text>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text type="secondary">{selectedConversation.user.nickname || selectedConversation.user.email}</Text>
              </div>
            </div>
          )
        }
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedConversation(null);
          setMessages([]);
        }}
        open={drawerVisible}
        width={600}
      >
        {selectedConversation && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Conversation Summary */}
            {selectedConversation.summary && (
              <>
                <Card size="small" style={{ marginBottom: '16px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Summary:</Text>
                  <Paragraph style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                    {selectedConversation.summary}
                  </Paragraph>
                </Card>
              </>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', marginBottom: '16px' }}>
              {messagesLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin />
                </div>
              ) : messages.length === 0 ? (
                <Empty description="No messages yet" />
              ) : (
                <List
                  dataSource={messages}
                  renderItem={(message) => (
                    <List.Item style={{ border: 'none', padding: '8px 0' }}>
                      <div style={{ 
                        width: '100%',
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                          flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                        }}>
                          <Avatar 
                            size="small"
                            icon={message.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                            style={{ 
                              backgroundColor: message.sender === 'user' ? '#1890ff' : '#52c41a',
                              flexShrink: 0
                            }}
                          />
                          <div style={{
                            background: message.sender === 'user' ? '#1890ff' : '#f0f2f5',
                            color: message.sender === 'user' ? '#fff' : '#333',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            wordBreak: 'break-word'
                          }}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                              {message.content}
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '4px'
                            }}>
                              <Text 
                                style={{ 
                                  fontSize: '11px', 
                                  opacity: 0.7,
                                  color: message.sender === 'user' ? '#fff' : '#666'
                                }}
                              >
                                {getMessageTimeAgo(message.createdAt)}
                              </Text>
                              {message.tokens && (
                                <Text 
                                  style={{ 
                                    fontSize: '11px', 
                                    opacity: 0.7,
                                    color: message.sender === 'user' ? '#fff' : '#666'
                                  }}
                                >
                                  {message.tokens} tokens
                                </Text>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>

            {/* Message Input */}
            {selectedConversation.isActive && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <TextArea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Message ${selectedConversation.agent.name}...`}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ flex: 1 }}
                    disabled={sending}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    loading={sending}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}