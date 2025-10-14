import React, { useEffect, useRef } from 'react';

export interface RichTextProps {
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
}

export const RichText: React.FC<RichTextProps> = ({ value, onChange, style }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [htmlMode, setHtmlMode] = React.useState(false);
    const [htmlValue, setHtmlValue] = React.useState(value);
    const [focusedEl, setFocusedEl] = React.useState<HTMLElement | null>(null);
    const [margin, setMargin] = React.useState('');
    const [padding, setPadding] = React.useState('');

    useEffect(() => {
        if (!htmlMode && editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
        if (!htmlMode) {
            setHtmlValue(value);
        }
    }, [value, htmlMode]);

    // Listen for selection change to detect focus on styled span
    useEffect(() => {
        if (htmlMode) return;
        const handler = () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                setFocusedEl(null);
                return;
            }
            const node = sel.anchorNode;
            if (node && node.parentElement && node.parentElement !== editorRef.current) {
                const el = node.parentElement;
                const style = el.style;
                if ((style.margin || style.padding) && el.tagName === 'SPAN') {
                    setFocusedEl(el);
                    setMargin(style.margin || '');
                    setPadding(style.padding || '');
                    return;
                }
            }
            setFocusedEl(null);
        };
        document.addEventListener('selectionchange', handler);
        return () => document.removeEventListener('selectionchange', handler);
    }, [htmlMode]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            setHtmlValue(editorRef.current.innerHTML);
        }
        // Update margin/padding if focusedEl changed
        if (focusedEl) {
            setMargin(focusedEl.style.margin || '');
            setPadding(focusedEl.style.padding || '');
        }
    };

    // Toolbar actions
    const format = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        // Update htmlValue after formatting
        if (editorRef.current) {
            setHtmlValue(editorRef.current.innerHTML);
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleColor = () => {
        const color = window.prompt('Enter text color (e.g. red, #ff0000)');
        if (color) {
            format('foreColor', color);
        }
    };

    const handleBgColor = () => {
        const color = window.prompt('Enter background color (e.g. yellow, #ffff00)');
        if (color) {
            format('hiliteColor', color);
        }
    };

    const handleLink = () => {
        const url = window.prompt('Enter the link URL');
        if (url) {
            format('createLink', url);
        }
    };

    // Padding option
    const handlePadding = () => {
        const padding = window.prompt('Enter padding in px (e.g. 8)');
        if (padding) {
            format('insertHTML', `<span style='padding:${padding}px;'>${window.getSelection()?.toString()}</span>`);
        }
    };

    // Margin option
    const handleMargin = () => {
        const margin = window.prompt('Enter margin in px (e.g. 8)');
        if (margin) {
            format('insertHTML', `<span style='margin:${margin}px;'>${window.getSelection()?.toString()}</span>`);
        }
    };

    const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setHtmlValue(e.target.value);
        onChange(e.target.value);
    };

    const buttonStyle: React.CSSProperties = {
        padding: '6px 12px',
        marginRight: 8,
        border: '1px solid #bbb',
        borderRadius: 4,
        background: '#f7f7f7',
        cursor: 'pointer',
        fontSize: 16,
        marginBottom: 4,
    };

    return (
        <div>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <button type="button" style={buttonStyle} onClick={() => format('bold')} title="Bold"><b>B</b></button>
                <button type="button" style={buttonStyle} onClick={() => format('italic')} title="Italic"><i>I</i></button>
                <button type="button" style={buttonStyle} onClick={() => format('underline')} title="Underline"><u>U</u></button>
                <button type="button" style={buttonStyle} onClick={handleLink} title="Link">🔗</button>
                <button type="button" style={buttonStyle} onClick={() => format('insertUnorderedList')} title="Bullet List">• List</button>
                <button type="button" style={buttonStyle} onClick={handleColor} title="Text Color">A<span style={{ color: 'red' }}>●</span></button>
                <button type="button" style={buttonStyle} onClick={handleBgColor} title="Background Color">A<span style={{ background: 'yellow', padding: '0 2px', borderRadius: 2 }}>■</span></button>
                <button type="button" style={buttonStyle} onClick={handlePadding} title="Padding">⧈</button>
                <button type="button" style={buttonStyle} onClick={handleMargin} title="Margin">▤</button>
                <div style={{ flex: 1 }} />
                <button
                    type="button"
                    style={{ ...buttonStyle, marginLeft: 12 }}
                    onClick={() => setHtmlMode(m => !m)}
                >
                    {htmlMode ? 'Rich Text' : 'HTML'}
                </button>
            </div>
            {htmlMode ? (
                <textarea
                    value={htmlValue}
                    onChange={handleHtmlChange}
                    style={{
                        width: '100%',
                        minHeight: 120,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        padding: 8,
                        fontFamily: 'monospace',
                        ...style,
                    }}
                />
            ) : (
                <div style={{ position: 'relative' }}>
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            minHeight: 120,
                            padding: 8,
                            ...style,
                        }}
                    />
                    {focusedEl && (
                        <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#fff',
                            border: '1px solid #bbb',
                            borderRadius: 4,
                            padding: '8px 12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            zIndex: 10,
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                        }}>
                            <label style={{ fontSize: 13 }}>Margin:
                                <input
                                    type="text"
                                    value={margin}
                                    style={{ width: 40, marginLeft: 4 }}
                                    onChange={e => {
                                        setMargin(e.target.value);
                                        focusedEl.style.margin = e.target.value;
                                        onChange(editorRef.current?.innerHTML || '');
                                    }}
                                />
                            </label>
                            <label style={{ fontSize: 13 }}>Padding:
                                <input
                                    type="text"
                                    value={padding}
                                    style={{ width: 40, marginLeft: 4 }}
                                    onChange={e => {
                                        setPadding(e.target.value);
                                        focusedEl.style.padding = e.target.value;
                                        onChange(editorRef.current?.innerHTML || '');
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
