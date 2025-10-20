import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIGenerateContextType {
  value: string;
  setValue: (val: string) => void;
}

const AIGenerateContext = createContext<AIGenerateContextType | undefined>(undefined);

export const useAIGenerateProvider = () => {
  const context = useContext(AIGenerateContext);
  if (!context) throw new Error('useAIGenerateProvider must be used within AIGenerateProvider');
  return context;
};

export const AIGenerateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('');
  return (
    <AIGenerateContext.Provider value={{ value, setValue }}>{children}</AIGenerateContext.Provider>
  );
};
