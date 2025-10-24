import { RobotOutlined } from '@ant-design/icons';
import { Card, Divider, message } from 'antd';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { LLMChatHeader } from './llmchat/LLMChatHeader.tsx';
import { LLMChatInput } from './llmchat/LLMChatInput.tsx';
import { LLMChatMessages } from './llmchat/LLMChatMessages.tsx';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  createdAt: string;
  tokens?: number;
}

export interface Agent {
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

export interface Conversation {
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
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

  useEffect(() => {
    // Read collapse state from cookie on mount
    const collapsed = Cookies.get('llm_chat_collapsed');
    setIsCollapsed(collapsed === 'true');
  }, []);

  const handleCollapseToggle = () => {
    setIsCollapsed((prev) => {
      Cookies.set('llm_chat_collapsed', (!prev).toString(), { expires: 365 });
      return !prev;
    });
  };

  // Refresh all data (agents, conversations, messages)
  const handleRefresh = async () => {
    await fetchAgents();
    if (selectedAgent) await fetchConversations();
    if (selectedConversation) await fetchMessages();
  };

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
      // Use the dedicated getMessages endpoint for better performance
      const response = await adminApi.getMessages(selectedConversation);
      const messages = response.data.data || [];
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to getConversation if getMessages fails
      try {
        const response = await adminApi.getConversation(selectedConversation);
        const messages = response.data.messages?.data || response.data.messages || [];
        setMessages(messages);
      } catch (fallbackError) {
        console.error('Error fetching messages (fallback):', fallbackError);
      }
    }
  };

  const createNewConversation = async () => {
    if (!selectedAgent) return;

    try {
      const response = await adminApi.createConversation({
        agentId: selectedAgent,
        title: `Chat ${new Date().toLocaleString()}`,
      });

      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
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
      const fileContext = uploadedFiles
        .map((file) => {
          let contextText = `\n\n--- File: ${file.name} (${file.type}) ---\n`;
          if (file.content) {
            contextText += file.content;
          } else {
            contextText += `[Binary file - ${(file.size / 1024).toFixed(2)} KB]`;
          }
          return contextText;
        })
        .join('\n');

      messageContent = `${userMessage}${fileContext}`;
    }

    // Create optimistic user message to show immediately
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender: 'user',
      createdAt: new Date().toISOString(),
    };

    // Add optimistic message immediately
    setMessages((prev) => {
      const newMessages = [...prev, optimisticUserMessage];
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      return newMessages;
    });

    // Clear input after optimistic UI update
    setInputValue('');

    try {
      setIsLoading(true);
      // Always send agentId and conversationId in the payload for backend memory creation
      const payload = {
        content: messageContent,
        sender: 'user',
        agentId: selectedAgent,
        conversationId: selectedConversation,
      };
      const response = await adminApi.sendMessage(selectedConversation, payload);

      // Handle response and add messages
      const messagesToAdd: Message[] = [];

      // Always add user message first if available (replace optimistic)
      if (response.data.userMessage) {
        messagesToAdd.push(response.data.userMessage);
      }

      // Add AI message if available
      if (response.data.aiMessage) {
        messagesToAdd.push(response.data.aiMessage);
      }

      // Fallback to messages array if direct messages not available
      if (messagesToAdd.length === 0 && response.data.messages) {
        messagesToAdd.push(...response.data.messages);
      }

      // Replace optimistic message with real messages
      if (messagesToAdd.length > 0) {
        setMessages((prev) => {
          // Remove the optimistic message and add real messages
          const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticUserMessage.id);
          const newMessages = [...withoutOptimistic, ...messagesToAdd];
          // Scroll to bottom after messages are added
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          return newMessages;
        });
      }

      // Show error if AI failed
      if (response.data.aiError) {
        console.warn('AI response failed:', response.data.aiError);
        // You could also show a toast notification here
        // message.warning('AI response failed, but your message was saved');
      }

      // Clear uploaded files after sending
      setUploadedFiles([]);

      // Always refresh messages after sending
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticUserMessage.id));

      // Show error message
      message.error('Failed to send message. Please try again.');
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
        content: null as string | null,
      };

      // Read file content based on type
      if (
        file.type.startsWith('text/') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.md')
      ) {
        const content = await file.text();
        fileData.content = content;
      }

      setUploadedFiles((prev) => [...prev, fileData]);
      message.success(`File "${file.name}" uploaded successfully`);
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
      return false;
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
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
    files.forEach((file) => handleFileUpload(file));
  };

  const selectedAgentData = agents.find((agent) => agent.id === selectedAgent);

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
      {/* Collapse Button */}
      {!isCollapsed ? (
        <Card
          style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
          styles={{
            body: {
              padding: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          {/* Header */}
          <LLMChatHeader
            agents={agents}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            isLoadingAgents={isLoadingAgents}
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            createNewConversation={createNewConversation}
            handleRefresh={handleRefresh}
          />
          {/* Messages */}
          <LLMChatMessages
            selectedAgent={selectedAgent}
            selectedConversation={selectedConversation}
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
          {/* Input */}
          {selectedConversation && (
            <>
              <Divider style={{ margin: 0 }} />
              <LLMChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleKeyPress={handleKeyPress}
                isLoading={isLoading}
                handleFileUpload={handleFileUpload}
                uploadedFiles={uploadedFiles}
                removeFile={removeFile}
                isDragOver={isDragOver}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                sendMessage={sendMessage}
                selectedAgentData={selectedAgentData}
              />
            </>
          )}
        </Card>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>
          <RobotOutlined style={{ fontSize: '32px' }} />
          <div>LLM Chat Collapsed</div>
        </div>
      )}
    </>
  );
}
