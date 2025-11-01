import type { TableProps } from 'antd';
import { Card, Input, message, Select, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import ConversationDrawer from '../../../../components/ConversationDrawer.tsx';
import ConversationTable from '../../../../components/ConversationTable.tsx';
import { useAuth } from '../../../../hooks/useAuth.tsx';

type ColumnsType<T> = TableProps<T>['columns'];

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

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

const AdminConversationList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { token } = useAuth();
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
      console.log(response);
      if (response.data.data.data && Array.isArray(response.data.data.data)) {
        setAgents(response.data.data.data || []);
      }
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

      if (response.data.data.data && Array.isArray(response.data.data.data)) {
        setConversations(response.data.data.data || []);
      }
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
        sender: 'user',
      });

      // Add both user message and AI response to the messages list
      if (response.data.userMessage && response.data.aiMessage) {
        setMessages((prev) => [...prev, response.data.userMessage, response.data.aiMessage]);
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

  const deleteConversation = (conversation: Conversation) => {
    adminApi
      .deleteConversation(conversation.id)
      .then(() => {
        message.success('Conversation deleted successfully');
        fetchConversations();
        if (selectedConversation?.id === conversation.id) {
          setDrawerVisible(false);
          setSelectedConversation(null);
        }
      })
      .catch((error) => {
        console.error('Error deleting conversation:', error);
        message.error('Failed to delete conversation');
      });
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

  // Prepare filters for CommonSearch
  const filters = [
    {
      key: 'agent',
      label: 'Agent',
      options: agents.map((agent) => ({
        value: agent.id,
        label: agent.name,
      })),
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ];

  const filterValues = {
    agent: selectedAgent,
    status: statusFilter,
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'agent') setSelectedAgent(value);
    if (key === 'status') setStatusFilter(value);
  };

  return (
    <div>
      <Title level={2}>💬 Conversations</Title>
      <CommonSearch
        searchPlaceholder="Search conversations..."
        searchValue={searchText}
        onSearch={setSearchText}
        onRefresh={fetchConversations}
        loading={loading}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showRefresh
        style={{ marginBottom: 24, border: 'none', padding: 0 }}
      />

      <Card styles={{ body: { padding: 0 } }}>
        <ConversationTable
          conversations={conversations}
          loading={loading}
          onView={viewConversation}
          onDelete={deleteConversation}
          getMessageTimeAgo={getMessageTimeAgo}
        />
      </Card>

      {/* Conversation Details Drawer */}
      <ConversationDrawer
        open={drawerVisible}
        selectedConversation={selectedConversation}
        messages={messages}
        messagesLoading={messagesLoading}
        newMessage={newMessage}
        sending={sending}
        getMessageTimeAgo={getMessageTimeAgo}
        handleKeyPress={handleKeyPress}
        setDrawerVisible={setDrawerVisible}
        setSelectedConversation={setSelectedConversation}
        setMessages={setMessages}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default AdminConversationList;
