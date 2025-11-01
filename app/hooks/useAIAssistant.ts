import Cookies from 'js-cookie';
import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../apis/admin/index.ts';

// Types
type Message = {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  createdAt: string;
  tokens?: number;
};
type Agent = {
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
};
type Conversation = {
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
};
type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string | null;
};
export function useAIAssistant() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchConversations();
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      setUploadedFiles([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    const collapsed = Cookies.get('llm_chat_collapsed');
    setIsCollapsed(collapsed === 'true');
  }, []);

  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed((prev) => {
      Cookies.set('llm_chat_collapsed', (!prev).toString(), { expires: 365 });
      return !prev;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchAgents();
    if (selectedAgent) await fetchConversations();
    if (selectedConversation) await fetchMessages();
  }, [selectedAgent, selectedConversation]);

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoadingAgents(true);
      const response = await adminApi.getAgents();
      const agents = response.data.data || [];
      setAgents(agents);
      const activeAgent = agents.find((agent: Agent) => agent.isActive);
      if (activeAgent && !selectedAgent) {
        setSelectedAgent(activeAgent.id);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [selectedAgent]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await adminApi.getConversations({ agentId: selectedAgent });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [selectedAgent]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await adminApi.getMessages(selectedConversation);
      const messages = response.data.data || [];
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      try {
        const response = await adminApi.getConversation(selectedConversation);
        const messages = response.data.messages?.data || response.data.messages || [];
        setMessages(messages);
      } catch (fallbackError) {
        console.error('Error fetching messages (fallback):', fallbackError);
      }
    }
  }, [selectedConversation]);

  const createNewConversation = useCallback(async () => {
    if (!selectedAgent) return;
    try {
      const response = await adminApi.createConversation({
        agentId: selectedAgent,
        title: `Chat ${new Date().toLocaleString()}`,
      });
      const newConversation = response.data;
      setConversations((prev: Conversation[]) => [newConversation, ...prev]);
      setSelectedConversation(newConversation.id);
      setMessages([]);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }, [selectedAgent]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !selectedConversation || isLoading) return;
    const userMessage = inputValue.trim();
    let messageContent = userMessage;
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
    setInputValue('');
    setIsLoading(true);
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev: Message[]) => {
      const newMessages: Message[] = [...prev, optimisticUserMessage];
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      return newMessages;
    });
    try {
      const payload = {
        content: messageContent,
        sender: 'user',
        agentId: selectedAgent,
        conversationId: selectedConversation,
      };
      const response = await adminApi.sendMessage(selectedConversation, payload);
      const messagesToAdd: Message[] = [];
      if (response.data.userMessage) {
        messagesToAdd.push(response.data.userMessage);
      }
      if (response.data.aiMessage) {
        messagesToAdd.push(response.data.aiMessage);
      }
      if (messagesToAdd.length === 0 && response.data.messages) {
        messagesToAdd.push(...response.data.messages);
      }
      if (messagesToAdd.length > 0) {
        setMessages((prev: Message[]) => {
          const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticUserMessage.id);
          const newMessages = [...withoutOptimistic, ...messagesToAdd];
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          return newMessages;
        });
      }
      if (response.data.aiError) {
        console.warn('AI response failed:', response.data.aiError);
      }
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev: Message[]) => prev.filter((msg) => msg.id !== optimisticUserMessage.id));
      // message.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, selectedConversation, isLoading, uploadedFiles, selectedAgent, scrollToBottom]);

  interface TextAreaKeyboardEvent extends React.KeyboardEvent<HTMLTextAreaElement> {}

  const handleKeyPress = useCallback(
    (e: TextAreaKeyboardEvent): void => {
      const event = e as TextAreaKeyboardEvent;
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const fileObj = file as File;
      const fileData: UploadedFile = {
        id: Date.now().toString(),
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type,
        content: null,
      };
      if (
        fileObj.type.startsWith('text/') ||
        fileObj.name.endsWith('.json') ||
        fileObj.name.endsWith('.md')
      ) {
        const content = await fileObj.text();
        fileData.content = content;
      }
      setUploadedFiles((prev: UploadedFile[]) => [...prev, fileData]);
      return false;
    } catch (error) {
      console.error('Error uploading file:', error);
      return false;
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev: UploadedFile[]) =>
      prev.filter((file) => file.id !== (fileId as string))
    );
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const event = e as React.DragEvent<HTMLDivElement>;
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const event = e as React.DragEvent<HTMLDivElement>;
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const event = e as React.DragEvent<HTMLDivElement>;
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      const files = Array.from(event.dataTransfer.files);
      files.forEach((file) => handleFileUpload(file));
    },
    [handleFileUpload]
  );

  const selectedAgentData = agents.find((agent) => agent.id === selectedAgent);

  return {
    agents,
    conversations,
    selectedAgent,
    setSelectedAgent,
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isLoading,
    isLoadingAgents,
    uploadedFiles,
    setUploadedFiles,
    isDragOver,
    setIsDragOver,
    isCollapsed,
    setIsCollapsed,
    messagesEndRef,
    scrollToBottom,
    handleCollapseToggle,
    handleRefresh,
    fetchAgents,
    fetchConversations,
    fetchMessages,
    createNewConversation,
    sendMessage,
    handleKeyPress,
    handleFileUpload,
    removeFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    selectedAgentData,
  };
}
