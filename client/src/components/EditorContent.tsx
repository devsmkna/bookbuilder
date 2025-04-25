import React, { forwardRef, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface EditorContentProps {
  content: string;
  onChange: (value: string) => void;
}

const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  ({ content, onChange }, ref) => {
    const placeholderShown = !content;

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = (e.target as HTMLDivElement).innerText || "";
      onChange(newContent);
    };

    // Prevent default behavior for certain keys to maintain control of the editor
    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Allow common keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        let format = '';
        switch (e.key.toLowerCase()) {
          case 'b': format = 'bold'; break;
          case 'i': format = 'italic'; break;
          case 'u': format = 'underline'; break;
        }
        
        // Apply formatting to the selected text
        if (format && window.getSelection) {
          const selection = window.getSelection();
          if (selection && !selection.isCollapsed) {
            // Let the parent component handle the formatting
            // This will be handled via the selectionchange event
          }
        }
      }
    };

    return (
      <div
        ref={ref}
        className="editor-content p-6"
        contentEditable={true}
        suppressContentEditableWarning={true}
        onPaste={handlePaste}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Start typing, or paste Markdown content..."
      >
        {placeholderShown ? (
          <div className="placeholder">Start typing, or paste Markdown content...</div>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    );
  }
);

EditorContent.displayName = "EditorContent";

export default EditorContent;
