import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';

interface OptionType {
  label: string;
  value: string;
  [key: string]: any;
}

interface AIGenerateContextType {
  value: string;
  setValue: (val: string) => void;
  agents: OptionType[];
  models: OptionType[];
  selectedAgent: OptionType | null;
  setSelectedAgent: (id: string) => void;
  setSelectedModel: (id: string) => void;
  promptMemory: string;
  setPromptMemory: (val: string) => void;
  conversations: OptionType[];
  selectedConversation: OptionType | null;
  setSelectedConversation: (id: string) => void;
  prompts: string[];
  selectedPrompt: string;
  setSelectedPrompt: (val: string) => void;
  handleCreatePrompt: (prompt: string) => void;
  selectedModel: OptionType | null;
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
  const [selectedAgent, setSelectedAgent] = useState<{ label: string; value: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ label: string; value: string } | null>(null);
  const [promptMemory, setPromptMemory] = useState('');
  const [conversations, setConversations] = useState<{ label: string; value: string }[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  // Prompt logic
  useEffect(() => {
    const fetchPrompts = async () => {
      const res = await adminApi.getPrompts?.();
      const items = res?.data?.data || [];
      setPrompts(items.map((p: any) => p.prompt || p.name || p.title || ''));
      setSelectedPrompt(items[0]?.prompt || items[0]?.name || items[0]?.title || '');
    };
    fetchPrompts();
  }, []);

  const handleCreatePrompt = (newPrompt: string) => {
    if (!newPrompt.trim()) return;
    setPrompts([newPrompt, ...prompts]);
    setSelectedPrompt(newPrompt);
  };

  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const agentsRes = await adminApi.getAgents?.();
        const agentsList = agentsRes?.data?.data || [];
        const agentOptions = agentsList.map((a: any) => ({
          label: a.name || a.agentName || a.title || String(a.id),
          value: String(a.id),
          model:
            a.model || (Array.isArray(a.models) && a.models.length > 0 ? a.models[0] : undefined),
          models: a.models || [],
        }));
        setAgents(agentOptions);
        let agent =
          agentOptions.find((a: any) => (selectedAgent ? a.value === selectedAgent.value : true)) ||
          agentOptions[0];
        setSelectedAgent(agent ? { label: agent.label, value: agent.value } : null);
        // Each agent only uses one model
        let model = null;
        if (agent?.model) {
          model = agent.model;
        } else if (Array.isArray(agent?.models) && agent.models.length > 0) {
          model = agent.models[0];
        }
        const modelOption = model
          ? [
              {
                label:
                  model.name || model.modelName || model.title || String(model.id) || String(model),
                value: String(model.id) || String(model),
              },
            ]
          : [];
        setModels(modelOption);
        setSelectedModel(modelOption[0] || null);
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
  }, [agents.length, selectedAgent?.value]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversationsRes = await adminApi.getConversations?.();
        const conversationsList = conversationsRes?.data?.data;
        const safeConversations = Array.isArray(conversationsList) ? conversationsList : [];

        const conversationOptions = safeConversations.map((c: any) => ({
          label: c.name || c.title || String(c.id),
          value: String(c.id),
        }));
        setConversations(conversationOptions);
        setSelectedConversation(
          conversationOptions[0]
            ? { label: conversationOptions[0].label, value: conversationOptions[0].value }
            : null
        );
      } catch (err) {
        setConversations([]);
        setSelectedConversation(null);
      }
    };
    fetchConversations();
  }, []);

  // Move conversation selection logic from AdminAITestPage here
  useEffect(() => {
    // Auto switch prompt when agent or conversation changes
    if (selectedAgent && selectedConversation && prompts.length > 0) {
      setSelectedPrompt(prompts[0] || '');
    }
  }, [selectedAgent, selectedConversation, prompts]);

  useEffect(() => {
    // Auto switch agent/conversation when prompt changes
    if (!selectedPrompt) return;
    // Find agent and conversation that match the prompt (simple contains logic)
    let foundAgent = agents.find((a) => {
      const name = a.label || a.name || a.agentName || a.title || '';
      return selectedPrompt.toLowerCase().includes(name.toLowerCase());
    });
    let foundConversation = conversations.find((c) => {
      const name = c.label || '';
      return selectedPrompt.toLowerCase().includes(name.toLowerCase());
    });
    if (foundAgent) setSelectedAgent(foundAgent.value);
    if (foundConversation) setSelectedConversation(foundConversation);
  }, [selectedPrompt, agents, conversations]);

  return (
    <AIGenerateContext.Provider
      value={{
        value,
        setValue,
        agents,
        models,
        selectedAgent,
        setSelectedAgent: (id: string) => {
          const found = agents.find((a) => a.value === id) || null;
          setSelectedAgent(found);
          // Also select model for this agent
          let model = null;
          if (found?.model) {
            model = found.model;
          } else if (Array.isArray(found?.models) && found.models.length > 0) {
            model = found.models[0];
          }

          console.log('Selected agent changed, setting model:', model, found);
          const modelOption = model
            ? {
                label:
                  model.name || model.modelName || model.title || String(model.id) || String(model),
                value: String(model.id) || String(model),
              }
            : null;
          setModels(modelOption ? [modelOption] : []);
          setSelectedModel(modelOption);
        },
        setSelectedModel: (id: string) => {
          const found = models.find((m) => m.value === id) || null;
          setSelectedModel(found);
        },
        promptMemory,
        setPromptMemory,
        conversations,
        selectedConversation,
        setSelectedConversation: (id: string) => {
          const found = conversations.find((c) => c.value === id) || null;
          setSelectedConversation(found);
        },
        prompts,
        selectedPrompt,
        setSelectedPrompt,
        handleCreatePrompt,
        selectedModel,
      }}
    >
      {children}
    </AIGenerateContext.Provider>
  );
};
