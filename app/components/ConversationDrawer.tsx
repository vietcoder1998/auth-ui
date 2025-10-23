import React from 'react';
import { Avatar, Button, Card, Divider, Drawer, Empty, List, Spin, Typography } from 'antd';
import { Input } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';

interface Agent {
  id: string;
  name: string;
  description: string;
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

interface ConversationDrawerProps {
  open: boolean;
  selectedConversation: Conversation | null;
  messages: Message[];
  messagesLoading: boolean;
  newMessage: string;
  sending: boolean;
  getMessageTimeAgo: (dateString: string) => string;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  setDrawerVisible: (visible: boolean) => void;
  setSelectedConversation: (conv: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  setNewMessage: (msg: string) => void;
  sendMessage: () => void;
}

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  open,
  selectedConversation,
  messages,
  messagesLoading,
  newMessage,
  sending,
  getMessageTimeAgo,
  handleKeyPress,
  setDrawerVisible,
  setSelectedConversation,
  setMessages,
  setNewMessage,
  sendMessage,
}) => (
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
              style={{
                backgroundColor: selectedConversation.agent.isActive ? '#52c41a' : '#d9d9d9',
              }}
            />
            <Text type="secondary">{selectedConversation.agent.name}</Text>
            <Text type="secondary">•</Text>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text type="secondary">
              {selectedConversation.user.nickname || selectedConversation.user.email}
            </Text>
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
    open={open}
    width={600}
  >
    {selectedConversation && (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Conversation Summary */}
        {selectedConversation.summary && (
          <>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Summary:
              </Text>
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
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      <Avatar
                        size="small"
                        icon={message.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                        style={{
                          backgroundColor: message.sender === 'user' ? '#1890ff' : '#52c41a',
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          background: message.sender === 'user' ? '#1890ff' : '#f0f2f5',
                          color: message.sender === 'user' ? '#fff' : '#333',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          wordBreak: 'break-word',
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '4px',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: '11px',
                              opacity: 0.7,
                              color: message.sender === 'user' ? '#fff' : '#666',
                            }}
                          >
                            {getMessageTimeAgo(message.createdAt)}
                          </Text>
                          {message.tokens && (
                            <Text
                              style={{
                                fontSize: '11px',
                                opacity: 0.7,
                                color: message.sender === 'user' ? '#fff' : '#666',
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewMessage(e.target.value)
                }
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
);

export default ConversationDrawer;
