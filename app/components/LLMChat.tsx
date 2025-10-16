import {
  MessageOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  SettingOutlined,
  UserOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  List,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
  Upload,
  message
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { useAuth } from '../hooks/useAuth.tsx';



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
  lastMessage?: Message;
  user?: {
    id: string;
    email: string;
    nickname: string;
    status: string;
  };
  agent?: {
    id: string;
    name: string;
    model: string;
    isActive: boolean;
  };
  _count?: {
    messages: number;
  };
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
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
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
      // Clear uploaded files when switching conversations
      setUploadedFiles([]);
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
      // Handle both direct messages array and paginated messages structure
      console.log(response.data.data.messages.data)
      const messages = response.data.data.messages.data || response.data.messages || [];
      setMessages(messages);
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
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation || isLoading) return;

    const userMessage = inputValue.trim();
    let messageContent = userMessage;

    // Include file context if files are uploaded
    if (uploadedFiles.length > 0) {
      const fileContext = uploadedFiles.map(file => {
        let contextText = `\n\n--- File: ${file.name} (${file.type}) ---\n`;
        if (file.content) {
          contextText += file.content;
        } else {
          contextText += `[Binary file - ${(file.size / 1024).toFixed(2)} KB]`;
        }
        return contextText;
      }).join('\n');

      messageContent = `${userMessage}${fileContext}`;
    }

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await adminApi.sendMessage(selectedConversation, {
        content: messageContent,
        sender: 'user'
      });

      // Add both user message and AI response
      if (response.data.userMessage && response.data.aiMessage) {
        setMessages(prev => {
          const newMessages = [...prev, response.data.userMessage, response.data.aiMessage];
          // Scroll to bottom after messages are added
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          return newMessages;
        });
      }

      // Clear uploaded files after sending
      setUploadedFiles([]);
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

  const handleFileUpload = async (file: File) => {
    try {
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        content: null as string | null
      };

      // Read file content based on type
      if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
        const content = await file.text();
        fileData.content = content;
      }

      setUploadedFiles(prev => [...prev, fileData]);
      message.success(`File "${file.name}" uploaded successfully`);
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
      return false;
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFileUpload(file));
  };

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent);

  return (
    <>
      <style>{`
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }
        .messages-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .messages-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .message-content::-webkit-scrollbar {
          width: 4px;
        }
        .message-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .message-content::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 2px;
        }
        .message-content::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
      `}</style>
      <Card 
        style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflowY: 'auto'
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
      {/* Header */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap', overflow: 'hidden' }}>
          <Select
            style={{ width: '160px', flexShrink: 0 }}
            size="small"
            placeholder="Agent"
            value={selectedAgent}
            onChange={setSelectedAgent}
            loading={isLoadingAgents}
            suffixIcon={<RobotOutlined />}
          >
            {agents.map(agent => (
              <Option key={agent.id} value={agent.id}>
                <Badge status={agent.isActive ? "success" : "default"} style={{ marginRight: '4px' }} />
                {agent.name}
              </Option>
            ))}
          </Select>

          {selectedAgent && (
            <>
              <Select
                style={{ flex: 1, minWidth: '80px' }}
                size="small"
                placeholder="Chat"
                value={selectedConversation}
                onChange={setSelectedConversation}
                allowClear
                optionLabelProp="label"
              >
                {conversations.map(conv => (
                  <Option key={conv.id} value={conv.id} label={conv.title}>
                    <Text strong style={{ fontSize: '12px' }}>{conv.title}</Text>
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={createNewConversation}
                size="small" 
                style={{ flexShrink: 0 }}
              />
            </>
          )}
          
          <Button type="text" icon={<SettingOutlined />} size="small" style={{ flexShrink: 0 }} />
        </div>
      </div>

      {/* Messages */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: selectedConversation ? '0 6px' : '0',
          background: selectedConversation ? '#fafafa' : 'transparent',
          minHeight: 0,
          maxHeight: 300,
          scrollBehavior: 'smooth'
        }}
        className="messages-container"
      >
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
          <div style={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <List
              dataSource={messages}
              style={{ 
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingBottom: '8px'
              }}
              renderItem={(message) => (
                <List.Item style={{ 
                  border: 'none', 
                  padding: '8px 0',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  <div style={{ 
                    width: '100%',
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      minWidth: '100px',
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
                      <div 
                        className="message-content"
                        style={{
                          background: message.sender === 'user' ? '#1890ff' : '#fff',
                          color: message.sender === 'user' ? '#fff' : '#333',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          border: message.sender === 'agent' ? '1px solid #d9d9d9' : 'none',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '100%',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          overflowX: 'hidden'
                        }}
                      >
                        <Paragraph 
                          style={{ 
                            margin: 0, 
                            color: message.sender === 'user' ? '#fff' : '#333',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: '1.5'
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
          </div>
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
          <div 
            style={{ 
              padding: '16px',
              position: 'relative'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag and Drop Overlay */}
            {isDragOver && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(24, 144, 255, 0.1)',
                border: '2px dashed #1890ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                color: '#1890ff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <UploadOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>Drop files here to upload context</div>
                </div>
              </div>
            )}

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                  Context Files ({uploadedFiles.length}):
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {uploadedFiles.map(file => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f5f5f5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <FileOutlined />
                      <span>{file.name}</span>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeFile(file.id)}
                        style={{ minWidth: 'auto', padding: '0 4px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              
              {/* Upload Button */}
              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                multiple
                accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.css,.html,.xml,.csv,.py,.java,.cpp,.c,.h,.sql"
              >
                <Tooltip title="Upload context files">
                  <Button
                    icon={<UploadOutlined />}
                    disabled={isLoading}
                  />
                </Tooltip>
              </Upload>

              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading}
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
    </>
  );
}