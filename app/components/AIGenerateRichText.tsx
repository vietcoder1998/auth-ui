import React, { useState } from 'react';
import { RichText } from '../lib/RichText.tsx';

interface AIGenerateRichTextProps {
  value?: string;
  onChange?: (val: string) => void;
  prompt?: string;
  style?: React.CSSProperties;
}

const AIGenerateRichText: React.FC<AIGenerateRichTextProps> = ({
  value = '',
  onChange,
  prompt,
  style,
}) => {
  const [content, setContent] = useState(value);

  return (
    <RichText
      value={content}
      onChange={(val) => {
        setContent(val);
        onChange?.(val);
      }}
      style={style}
    />
  );
};

export default AIGenerateRichText;
