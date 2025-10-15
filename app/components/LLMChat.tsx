import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Spin,
  Select,
  Tooltip,
  Divider,
  Badge,
  Empty
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { adminApi } from '../apis/admin.api';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const { Option } = Select;

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  createdAt: string;
  tokens?: number;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  isActive: boolean;
}

interface Conversation {
  id: string;
  title: string;
  agentId: string;
  messages?: Message[];
}

export default function LLMChat() {
  const { token } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load agents
  useEffect(() => {
    fetchAgents();
  }, []);

  // Load conversations when agent changes
  useEffect(() => {
    if (selectedAgent) {
      fetchConversations();
    }
  }, [selectedAgent]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  const fetchAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const response = await adminApi.getAgents();
      const agents = response.data.data || [];
      setAgents(agents);
      
      // Auto-select first active agent
      const activeAgent = agents.find((agent: Agent) => agent.isActive);
      if (activeAgent && !selectedAgent) {
        setSelectedAgent(activeAgent.id);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await adminApi.getConversations({ agentId: selectedAgent });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await adminApi.getConversation(selectedConversation);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createNewConversation = async () => {
    if (!selectedAgent) return;

    try {
      const response = await adminApi.createConversation({
        agentId: selectedAgent,
        title: `Chat ${new Date().toLocaleString()}`
      });

      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await adminApi.sendMessage(selectedConversation, {
        content: userMessage,
        sender: 'user'
      });

      // Add both user message and AI response
      if (response.data.userMessage && response.data.aiMessage) {
        setMessages(prev => [...prev, response.data.userMessage, response.data.aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent);

  return (
    <Card 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: '16px' }}>
              <MessageOutlined /> AI Chat
            </Text>
            <Tooltip title="Settings">
              <Button type="text" icon={<SettingOutlined />} size="small" />
            </Tooltip>
          </div>
          
          {/* Agent Selection */}
          <Select
            style={{ width: '100%' }}
            placeholder="Select an AI Agent"
            value={selectedAgent}
            onChange={setSelectedAgent}
            loading={isLoadingAgents}
            suffixIcon={<RobotOutlined />}
          >
            {agents.map(agent => (
              <Option key={agent.id} value={agent.id}>
                <Space>
                  <Badge status={agent.isActive ? "success" : "default"} />
                  {agent.name}
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ({agent.model})
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>

          {/* Conversation Selection */}
          {selectedAgent && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Select
                style={{ flex: 1 }}
                placeholder="Select conversation"
                value={selectedConversation}
                onChange={setSelectedConversation}
                allowClear
              >
                {conversations.map(conv => (
                  <Option key={conv.id} value={conv.id}>
                    {conv.title}
                  </Option>
                ))}
              </Select>
              <Tooltip title="New conversation">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={createNewConversation}
                  size="small"
                />
              </Tooltip>
            </div>
          )}
        </Space>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: selectedConversation ? '16px' : '0',
        background: selectedConversation ? '#fafafa' : 'transparent'
      }}>
        {!selectedAgent ? (
          <Empty 
            description="Select an AI Agent to start chatting"
            image={<RobotOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          />
        ) : !selectedConversation ? (
          <Empty 
            description="Create a new conversation to start chatting"
            image={<MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          />
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
                      background: message.sender === 'user' ? '#1890ff' : '#fff',
                      color: message.sender === 'user' ? '#fff' : '#333',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: message.sender === 'agent' ? '1px solid #d9d9d9' : 'none',
                      wordBreak: 'break-word'
                    }}>
                      <Paragraph 
                        style={{ 
                          margin: 0, 
                          color: message.sender === 'user' ? '#fff' : '#333',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {message.content}
                      </Paragraph>
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
              </List.Item>
            )}
          />
        )}
        
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Spin size="small" />
            <Text style={{ marginLeft: '8px', color: '#666' }}>AI is thinking...</Text>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {selectedConversation && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message ${selectedAgentData?.name || 'AI Agent'}...`}
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ flex: 1 }}
                disabled={isLoading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                loading={isLoading}
              />
            </div>
            {selectedAgentData && (
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Model: {selectedAgentData.model} • {selectedAgentData.description}
              </Text>
            )}
          </div>
        </>
      )}
    </Card>
  );
}