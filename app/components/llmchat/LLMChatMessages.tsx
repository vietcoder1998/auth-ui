import { MessageOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Empty, List, Spin, Typography } from 'antd';
import React from 'react';
import { Message } from '../LLMChat.tsx';

const { Text, Paragraph } = Typography;

interface LLMChatMessagesProps {
  selectedAgent: string;
  selectedConversation: string;
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function LLMChatMessages({
  selectedAgent,
  selectedConversation,
  messages,
  isLoading,
  messagesEndRef,
}: LLMChatMessagesProps) {
  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, messagesEndRef]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: selectedConversation ? '0 6px' : '0',
        background: selectedConversation ? '#fafafa' : 'transparent',
        minHeight: 0,
        maxHeight: 400,
        scrollBehavior: 'smooth',
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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <List
            dataSource={messages}
            style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '8px' }}
            renderItem={(message, index) => (
              <List.Item
                ref={index === messages.length - 1 ? messagesEndRef : null}
                style={{
                  border: 'none',
                  padding: '8px 0',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
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
                      minWidth: '100px',
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
                        overflowY: 'auto',
                        overflowX: 'hidden',
                      }}
                    >
                      <Paragraph
                        style={{
                          margin: 0,
                          color: message.sender === 'user' ? '#fff' : '#333',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: '1.5',
                        }}
                      >
                        {message.content}
                      </Paragraph>
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
              </List.Item>
            )}
          />
          {isLoading && (
            <List.Item style={{ border: 'none', padding: '8px 0' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '80%',
                    minWidth: '100px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start',
                  }}
                >
                  <Avatar
                    size="small"
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: '#52c41a', flexShrink: 0 }}
                  />
                  <div
                    style={{
                      background: '#fff',
                      color: '#333',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid #d9d9d9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Spin size="small" />
                    <Text style={{ color: '#666' }}>AI is thinking...</Text>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        </div>
      )}
    </div>
  );
}
