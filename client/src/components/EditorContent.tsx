import React, { forwardRef, useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { LinkedEntity } from "@/hooks/use-editor";

interface EditorContentProps {
  content: string;
  onChange: (value: string) => void;
  renderedContent?: string;
  isWysiwygMode?: boolean;
  linkedEntities?: LinkedEntity[];
  onCreateWikiLink?: () => void;
}

const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  ({ 
    content, 
    onChange, 
    renderedContent = '', 
    isWysiwygMode = true, 
    linkedEntities = [], 
    onCreateWikiLink 
  }, ref) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const placeholderShown = !content;
    
    // Update the ref to the DOM node when it's available
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          if (editorRef.current) ref(editorRef.current);
        } else {
          ref.current = editorRef.current;
        }
      }
    }, [ref]);

    // Keep the editor content synchronized with the content prop
    useEffect(() => {
      if (editorRef.current && !isWysiwygMode) {
        // Only update if the content has changed and doesn't match the editor
        const currentText = editorRef.current.innerText;
        if (currentText !== content) {
          // Preserve selection
          const selection = window.getSelection();
          const hadSelection = selection && selection.rangeCount > 0;
          let range = hadSelection ? selection.getRangeAt(0).cloneRange() : null;
          let startContainer = range?.startContainer;
          let startOffset = range?.startOffset || 0;
          let isSelectionInEditor = false;
          
          if (hadSelection && startContainer && editorRef.current.contains(startContainer)) {
            isSelectionInEditor = true;
          }
          
          // Update content
          editorRef.current.innerText = content;
          
          // Restore selection if it was within the editor
          if (isSelectionInEditor && selection && range) {
            try {
              // Try to find a text node to place the cursor
              const textNode = Array.from(editorRef.current.childNodes)
                .find(node => node.nodeType === Node.TEXT_NODE) || editorRef.current;
              
              // Create a new range and try to position it
              const newRange = document.createRange();
              const offset = Math.min(startOffset, textNode.textContent?.length || 0);
              
              newRange.setStart(textNode, offset);
              newRange.collapse(true);
              
              selection.removeAllRanges();
              selection.addRange(newRange);
            } catch (e) {
              console.error("Error restoring selection:", e);
            }
          }
        }
      }
    }, [content, isWysiwygMode]);

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
      // Prevent default Enter behavior if Shift key is not pressed
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Insert a single newline character
        document.execCommand('insertText', false, '\n');
        return;
      }
      
      // Add wiki link with Ctrl+K or Cmd+K 
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Let the parent component handle wiki link creation
        if (onCreateWikiLink && window.getSelection) {
          const selection = window.getSelection();
          if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
            onCreateWikiLink();
            return;
          }
        }
      }
      
      // Handle key combinations for keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault(); 
        // These will be handled by the Editor component through event listeners
      }
    };

    // Function to handle clicks on wiki links
    const handleWikiLinkClick = (e: React.MouseEvent) => {
      // Check if the clicked element is a wiki link
      const target = e.target as HTMLElement;
      if (target.classList.contains('wiki-link')) {
        e.preventDefault();
        
        // Get entity info from data attributes
        const entityId = target.getAttribute('data-entity-id');
        const entityType = target.getAttribute('data-entity-type');
        
        // You could dispatch an event or call a callback to open the entity details
        console.log(`Wiki link clicked: ${entityType} - ${entityId}`);
      }
    };
    
    // When in WYSIWYG mode, show the rendered preview
    if (isWysiwygMode) {
      // Create a class name that includes common styles plus mode-specific ones
      const wysiwygClassName = cn(
        "editor-wysiwyg p-6 whitespace-pre-wrap", 
        "min-h-[70vh] outline-none"
      );
      
      return (
        <div 
          className={wysiwygClassName}
          onClick={handleWikiLinkClick}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      );
    }
    
    // Raw markdown editor mode
    return (
      <div
        ref={editorRef}
        className={cn(
          "editor-content p-6 whitespace-pre-wrap font-mono text-sm",
          "min-h-[70vh] outline-none"
        )}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onPaste={handlePaste}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Start typing, or paste Markdown content..."
      >
        {content || (
          <div className="placeholder text-muted-foreground">Start typing, or paste Markdown content...</div>
        )}
      </div>
    );
  }
);

EditorContent.displayName = "EditorContent";

export default EditorContent;
