import { ThunderboltOutlined } from '@ant-design/icons';
import { Input, message, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getApiInstance } from '../apis/index.ts';
import { useAIGenerateProvider } from '../providers/AIGenerateProvider.tsx';

interface AIGenerateInputProps {
  value?: string;
  onChange?: (val: string) => void;
  prompt: string; // prompt to send to backend
  placeholder?: string;
  apiPath?: string; // optional override for API endpoint
  textarea?: boolean;
  rows?: number;
}

const AIGenerateInput: React.FC<AIGenerateInputProps> = ({
  value,
  onChange,
  prompt,
  placeholder,
  apiPath,
  textarea,
  rows,
}) => {
  const { value: contextValue, setValue: setContextValue } = useAIGenerateProvider();
  const [inputValue, setInputValue] = useState(value || contextValue || '');
  const [primaryValue] = useState(value || contextValue || '');
  const [showPrimary, setShowPrimary] = useState(false);
  const [showRevert, setShowRevert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const inputRef = React.useRef<any>(null);

  // Sync context value to local input and move cursor to end
  useEffect(() => {
    const newValue = value ?? contextValue ?? '';
    setInputValue(newValue);
    setShowRevert(false);
    // Move cursor to end if inputRef is available
    if (inputRef.current) {
      const el = inputRef.current.resizableTextArea
        ? inputRef.current.resizableTextArea.textArea
        : inputRef.current.input;
      if (el && typeof el.setSelectionRange === 'function') {
        setTimeout(() => {
          el.setSelectionRange(newValue.length, newValue.length);
        }, 0);
      }
    }
  }, [value, contextValue]);

  const {
    agents,
    models,
    selectedAgent,
    setSelectedAgent,
    selectedModel,
    setSelectedModel,
    promptMemory,
  } = useAIGenerateProvider();

  const handleGenerate = async () => {
    if (loading && abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
      message.info('AI generation stopped');
      return;
    }
    setShowPrimary(true);
    setLoading(true);
    const controller = new AbortController();
    setAbortController(controller);
    try {
      const agent = agents.find((a: any) => a.id === selectedAgent) || agents[0];
      const model = models.find((m: any) => m.id === selectedModel) || models[0];
      const axios = getApiInstance();
      const res = await axios.post(
        apiPath || '/admin/prompts/generate',
        { prompt, agentId: agent?.id, modelId: model?.id },
        { signal: controller.signal }
      );
      if (res.data && res.data.data.data) {
        setInputValue(res.data.data.data);
        setContextValue(res.data.data.data);
        onChange?.(res.data.data.data);
      } else {
        message.error('No data returned from AI');
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        message.info('AI generation cancelled');
      } else {
        message.error('Failed to generate context');
      }
    }
    setLoading(false);
    setAbortController(null);
  };

  const commonProps = {
    value: inputValue,
    onChange: (e: any) => {
      setInputValue(e.target.value);
      setContextValue(e.target.value);
      onChange?.(e.target.value);
      setShowRevert(e.target.value !== primaryValue);
    },
    placeholder: placeholder || 'Enter or generate content...',
    disabled: loading,
    ref: inputRef,
    style: { fontSize: 13 },
  };

  if (textarea) {
    return (
      <div style={{ position: 'relative' }}>
        <Input.TextArea
          {...commonProps}
          autoSize={rows ? { minRows: rows, maxRows: rows } : undefined}
          style={{
            ...commonProps.style,
            paddingBottom: showPrimary && primaryValue ? 32 : 8,
          }}
        />
        {/* Left: Tooltip with prompt memory, agent name, and model */}
        <div
          style={{
            position: 'absolute',
            left: 8,
            bottom: 8,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: '#888',
              background: '#fafafa',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'default',
              border: '1px solid #eee',
            }}
            title={promptMemory}
          >
            {loading ? 'Fetching memory...' : promptMemory || 'Memory: ...'}
          </span>
          <Select
            size="small"
            style={{ minWidth: 90, marginLeft: 2 }}
            value={selectedAgent}
            onChange={(val) => setSelectedAgent(val)}
            placeholder="Select agent"
            disabled={loading}
            options={agents}
          />
          <Select
            size="small"
            style={{ minWidth: 90, marginLeft: 2 }}
            value={selectedModel}
            onChange={(val) => setSelectedModel(val)}
            placeholder="Select model"
            disabled={loading || !models.length}
            options={models}
          />
        </div>
        {/* Generate icon (thunderbolt) */}
        <div
          style={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            zIndex: 2,
            cursor: 'pointer',
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleGenerate}
          title={loading ? 'Click to stop' : 'Generate with AI'}
        >
          {loading ? (
            <span className="anticon-spin" style={{ color: '#1890ff', fontSize: 16 }}>
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 1024 1024"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M988 548H836c-19.9 0-36-16.1-36-36V360c0-19.9 16.1-36 36-36h152c19.9 0 36 16.1 36 36v152c0 19.9-16.1 36-36 36z" />
              </svg>
            </span>
          ) : (
            <ThunderboltOutlined style={{ color: '#888', fontSize: 16 }} />
          )}
        </div>
        {showRevert && (
          <button
            type="button"
            style={{
              position: 'absolute',
              left: 8,
              bottom: 32,
              zIndex: 2,
              fontSize: 11,
              padding: '2px 8px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: 4,
              color: '#666',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            onClick={() => {
              setInputValue(primaryValue);
              setContextValue(primaryValue);
              onChange?.(primaryValue);
              setShowRevert(false);
            }}
          >
            Revert
          </button>
        )}
        {showPrimary && primaryValue && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: -22,
              width: '100%',
              fontSize: 12,
              color: '#888',
              background: 'transparent',
              textAlign: 'left',
              paddingLeft: 4,
              pointerEvents: 'none',
            }}
          >
            <span>Primary value: {primaryValue}</span>
          </div>
        )}
      </div>
    );
  }
  return <Input {...commonProps} />;
};

export default AIGenerateInput;
