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

// Regular expressions for inline markdown patterns
const MARKDOWN_PATTERNS = [
  { pattern: /\*\*(.*?)\*\*/g, tag: 'strong' },         // Bold: **text**
  { pattern: /\*(.*?)\*/g, tag: 'em' },                 // Italic: *text*
  { pattern: /`(.*?)`/g, tag: 'code' },                 // Inline code: `code`
  { pattern: /~~(.*?)~~/g, tag: 'del' },                // Strikethrough: ~~text~~
  { pattern: /<u>(.*?)<\/u>/g, tag: 'u' },              // Underline: <u>text</u>
  { pattern: /^# (.*?)$/gm, tag: 'h1' },                // H1: # Heading
  { pattern: /^## (.*?)$/gm, tag: 'h2' },               // H2: ## Heading
  { pattern: /^### (.*?)$/gm, tag: 'h3' },              // H3: ### Heading
  { pattern: /^> (.*?)$/gm, tag: 'blockquote' },        // Quote: > text
  { pattern: /^- (.*?)$/gm, tag: 'li' }                 // List item: - item
];

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
    const [isComposing, setIsComposing] = useState(false);
    const lastCaretPosition = useRef<number | null>(null);
    
    // Update the ref to the DOM node when it's available
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          if (editorRef.current) ref(editorRef.current);
        } else {
          ref.current = editorRef.current;
        }
      }
    }, [ref, editorRef.current]);

    // Keep the editor content synchronized with the content prop
    useEffect(() => {
      if (editorRef.current && !placeholderShown) {
        const hasPlaceholder = editorRef.current.querySelector('.placeholder');
        if (hasPlaceholder) {
          editorRef.current.innerHTML = '';
        }
        if (editorRef.current.innerText !== content) {
          editorRef.current.innerText = content;
        }
      }
    }, [content, placeholderShown]);

    // Save caret position
    const saveCaretPosition = () => {
      if (!window.getSelection) return;
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      if (!editorRef.current || !editorRef.current.contains(range.commonAncestorContainer)) return;
      
      lastCaretPosition.current = range.startOffset;
    };

    // Restore caret position
    const restoreCaretPosition = () => {
      if (lastCaretPosition.current === null || !editorRef.current) return;
      
      try {
        const selection = window.getSelection();
        if (!selection) return;
        
        // Create a range and set it at the saved position
        const range = document.createRange();
        
        // Find text node to place caret in
        let textNode = editorRef.current;
        if (editorRef.current.childNodes.length > 0) {
          // Try to find the first text node
          for (let i = 0; i < editorRef.current.childNodes.length; i++) {
            if (editorRef.current.childNodes[i].nodeType === Node.TEXT_NODE) {
              textNode = editorRef.current.childNodes[i] as any;
              break;
            }
          }
        }
        
        const offset = Math.min(lastCaretPosition.current, textNode.textContent?.length || 0);
        range.setStart(textNode, offset);
        range.collapse(true);
        
        // Apply the range
        selection.removeAllRanges();
        selection.addRange(range);
        
        lastCaretPosition.current = null;
      } catch (e) {
        console.error('Failed to restore caret position:', e);
      }
    };

    // Apply Markdown formatting automatically
    const applyMarkdownFormatting = () => {
      if (!editorRef.current || isComposing) return;
      
      // Get current content and selection position
      const currentContent = editorRef.current.innerText;
      
      // Save caret position before manipulating DOM
      saveCaretPosition();
      
      // Track if formatting was applied
      let wasFormatApplied = false;
      
      // Apply HTML for markdown patterns
      for (const { pattern, tag } of MARKDOWN_PATTERNS) {
        // Reset pattern's lastIndex (needed for regex with global flag)
        pattern.lastIndex = 0;
        
        if (pattern.test(currentContent)) {
          // Reset for iteration
          pattern.lastIndex = 0;
          
          const elementContent = editorRef.current.innerHTML;
          
          // Create a temporary element to work with the HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = elementContent;
          
          // Apply formatting
          const updatedHTML = elementContent.replace(pattern, (match, content) => {
            wasFormatApplied = true;
            return `<${tag}>${content}</${tag}>`;
          });
          
          if (wasFormatApplied) {
            // Apply the formatted HTML
            editorRef.current.innerHTML = updatedHTML;
            
            // Update content state
            onChange(currentContent);
            
            // Restore caret position
            setTimeout(() => {
              restoreCaretPosition();
            }, 0);
            
            return;
          }
        }
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = (e.target as HTMLDivElement).innerText || "";
      onChange(newContent);
      
      // Apply Markdown formatting
      applyMarkdownFormatting();
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
      
      // Handle key combinations for formatting
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
      
      // Detect when special markdown characters are typed and apply formatting
      if (['*', '`', '#', '>', '-', '_', '~', '[', ']'].includes(e.key)) {
        // We'll delay the formatting check slightly to get the updated content
        setTimeout(applyMarkdownFormatting, 10);
      }
    };

    // IME Composition handling for languages like Chinese, Japanese, etc.
    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionEnd = () => {
      setIsComposing(false);
      // Apply formatting after IME composition ends
      setTimeout(applyMarkdownFormatting, 10);
    };

    // Auto-update formatting when a space is typed
    const handleKeyUp = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        applyMarkdownFormatting();
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
    
    // When in WYSIWYG mode and we have rendered content, show the preview
    if (isWysiwygMode && renderedContent) {
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
          "editor-content p-6 whitespace-pre-wrap",
          "min-h-[70vh] outline-none",
          isWysiwygMode ? "hidden" : "block"
        )}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onPaste={handlePaste}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        data-placeholder="Start typing, or paste Markdown content..."
      >
        {!isWysiwygMode && content ? content : null}
        {placeholderShown && content === "" && (
          <div className="placeholder">Start typing, or paste Markdown content...</div>
        )}
      </div>
    );
  }
);

EditorContent.displayName = "EditorContent";

export default EditorContent;
