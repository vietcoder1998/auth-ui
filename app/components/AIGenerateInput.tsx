
import { ThunderboltOutlined } from '@ant-design/icons'; // Remove after replacement
import { RobotFilled } from '@ant-design/icons';
import { Input, message } from 'antd';
import React, { useState, useEffect } from 'react';
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

const AIGenerateInput: React.FC<AIGenerateInputProps> = ({ value, onChange, prompt, placeholder, apiPath, textarea, rows }) => {
	const { value: contextValue, setValue: setContextValue } = useAIGenerateProvider();
	const [inputValue, setInputValue] = useState(value || contextValue || '');
	const [loading, setLoading] = useState(false);

	// Sync context value to local input
	useEffect(() => {
		setInputValue(value ?? contextValue ?? '');
	}, [value, contextValue]);

		const handleGenerate = async () => {
			setLoading(true);
			try {
				const axios = getApiInstance();
				const res = await axios.post(apiPath || '/admin/prompts/generate', { prompt });
				if (res.data && res.data.data) {
					setInputValue(res.data.data);
					setContextValue(res.data.data);
					onChange?.(res.data.data);
				} else {
					message.error('No data returned from AI');
				}
			} catch (error) {
				message.error('Failed to generate context');
			}
			setLoading(false);
		};

		const commonProps = {
			value: inputValue,
			onChange: (e: any) => {
				setInputValue(e.target.value);
				setContextValue(e.target.value);
				onChange?.(e.target.value);
			},
			placeholder: placeholder || 'Enter or generate content...',
			disabled: loading,
			suffix: (
				<ThunderboltOutlined
					style={{ color: loading ? '#1890ff' : undefined, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 18 }}
					spin={loading}
					onClick={loading ? undefined : handleGenerate}
				/>
			),
		};

		if (textarea) {
			return (
				<div style={{ position: 'relative' }}>
					<Input.TextArea {...commonProps} autoSize={rows ? { minRows: rows, maxRows: rows } : undefined} />
					<div
						style={{
							position: 'absolute',
							right: 8,
							bottom: 8,
							zIndex: 2,
							cursor: loading ? 'not-allowed' : 'pointer',
							background: '#fff',
							borderRadius: '50%',
							boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
							padding: 2,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						onClick={loading ? undefined : handleGenerate}
					>
						<RobotFilled style={{ color: loading ? '#1890ff' : '#888', fontSize: 16 }} spin={loading} />
					</div>
				</div>
			);
		}
		return <Input {...commonProps} />;
};

export default AIGenerateInput;
