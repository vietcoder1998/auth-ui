import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';

interface AIGenerateContextType {
  value: string;
  setValue: (val: string) => void;
  agents: any[];
  models: any[];
  selectedAgent: string;
  setSelectedAgent: (id: string) => void;
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  promptMemory: string;
  setPromptMemory: (val: string) => void;
  conversations: any[];
  selectedConversation: string;
  setSelectedConversation: (id: string) => void;
}

const AIGenerateContext = createContext<AIGenerateContextType | undefined>(undefined);

export const useAIGenerateProvider = () => {
  const context = useContext(AIGenerateContext);
  if (!context) throw new Error('useAIGenerateProvider must be used within AIGenerateProvider');
  return context;
};

export const AIGenerateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [promptMemory, setPromptMemory] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');

  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const agentsRes = await adminApi.getAgents?.();
        const agentsList = agentsRes?.data?.data || [];
        const agentOptions = agentsList.map((a: any) => ({
          label: a.name || a.agentName || a.title || a.id,
          value: a.id,
          ...a,
        }));
        setAgents(agentOptions);
        let agent = agentOptions.find((a: any) => a.value === selectedAgent) || agentOptions[0];
        setSelectedAgent(agent?.value || '');
        // Models from agent or global
        const modelsRaw = Array.isArray(agent?.models)
          ? agent.models
          : [agent?.model].filter(Boolean);
        const modelOptions = modelsRaw.map((m: any) => ({
          label: m.name || m.modelName || m.title || m.id || m,
          value: m.id || m,
          ...m,
        }));
        setModels(modelOptions);
        setSelectedModel(modelOptions[0]?.value || '');
        // Fetch agent memory
        const memoriesRes = await adminApi.getAgentMemories?.(agent?.id);
        setPromptMemory(memoriesRes?.data?.[0]?.memory || '');
      } catch (err) {
        setAgents([]);
        setModels([]);
        setPromptMemory('');
      }
    };
    fetchAgentInfo();
  }, [selectedAgent]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversationsRes = await adminApi.getConversations?.();
        const conversationsList = conversationsRes?.data?.data;
        const safeConversations = Array.isArray(conversationsList) ? conversationsList : [];

        setConversations(safeConversations);
        setSelectedConversation(safeConversations[0]?.id || '');
      } catch (err) {
        setConversations([]);
        setSelectedConversation('');
      }
    };
    fetchConversations();
  }, []);

  return (
    <AIGenerateContext.Provider
      value={{
        value,
        setValue,
        agents,
        models,
        selectedAgent,
        setSelectedAgent,
        selectedModel,
        setSelectedModel,
        promptMemory,
        setPromptMemory,
        conversations,
        selectedConversation,
        setSelectedConversation,
      }}
    >
      {children}
    </AIGenerateContext.Provider>
  );
};
