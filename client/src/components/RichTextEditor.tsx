import React, { useEffect, useRef, useState } from 'react';
import { Bold, Heading1, Heading2, AlignLeft, Indent, Type } from 'lucide-react';

interface RichTextEditorProps {
    value: string; // JSON string
    onChange: (jsonValue: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Parse initial value
    useEffect(() => {
        if (editorRef.current) {
            try {
                const parsed = JSON.parse(value);
                if (editorRef.current.innerHTML !== parsed.html) {
                    editorRef.current.innerHTML = parsed.html || '';
                }
            } catch (e) {
                // Handle parsing error or plain text fallback
                if (editorRef.current.innerHTML !== value) {
                    editorRef.current.innerHTML = value || '';
                }
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            const text = editorRef.current.innerText;
            // Store as JSON
            const jsonValue = JSON.stringify({ html, text });
            onChange(jsonValue);
        }
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
        updateToolbarState();
    };

    const updateToolbarState = () => {
        // Implementation for active state of buttons if needed
    };

    return (
        <div className={`border rounded-lg overflow-hidden transition-all ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                <ToolbarButton onClick={() => execCmd('bold')} icon={<Bold size={16} />} title="Bold" />
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => execCmd('formatBlock', 'H3')} icon={<Heading1 size={16} />} title="Heading 1" />
                <ToolbarButton onClick={() => execCmd('formatBlock', 'H4')} icon={<Heading2 size={16} />} title="Heading 2" />
                <ToolbarButton onClick={() => execCmd('formatBlock', 'P')} icon={<Type size={16} />} title="Paragraph" />
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => execCmd('indent')} icon={<Indent size={16} />} title="Indent" />
                <ToolbarButton onClick={() => execCmd('outdent')} icon={<AlignLeft size={16} />} title="Outdent" />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                className="p-4 min-h-[150px] outline-none text-sm prose prose-sm max-w-none"
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                data-placeholder={placeholder}
                style={{ whiteSpace: 'pre-wrap' }}
            />
            {/* Placeholder styling via CSS usually, doing simple inline check here? No, CSS is better */}
            <style>{`
                [contentEditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
};

const ToolbarButton = ({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title={title}
    >
        {icon}
    </button>
);

export default RichTextEditor;
