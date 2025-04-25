import { useState, useRef, useCallback, useEffect } from "react";
import { applyMarkdownFormat, countWordsAndChars } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface FormatMenuProps {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  position: { top: number; left: number };
  setPosition: (position: { top: number; left: number }) => void;
}

export function useEditor() {
  const [content, setContent] = useState<string>("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isFormatMenuVisible, setIsFormatMenuVisible] = useState(false);
  const [formatMenuPosition, setFormatMenuPosition] = useState({ top: 0, left: 0 });
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Get system preference for dark mode
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Set initial theme based on system preference
  useEffect(() => {
    // Check for user preference in localStorage first
    const savedTheme = localStorage.getItem("markdown-editor-theme");
    if (savedTheme) {
      setIsDarkTheme(savedTheme === "dark");
    } else {
      setIsDarkTheme(prefersDark);
    }
  }, [prefersDark]);

  // Update word and character count when content changes
  useEffect(() => {
    const { words, chars } = countWordsAndChars(content);
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => {
      const newTheme = !prev;
      localStorage.setItem("markdown-editor-theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  }, []);

  const handleSelectionChange = useCallback(() => {
    if (!window.getSelection) return;
    
    const selection = window.getSelection();
    setSelection(selection);
    
    if (!selection || !editorRef.current) {
      setIsFormatMenuVisible(false);
      return;
    }
    
    if (selection.rangeCount === 0) {
      setIsFormatMenuVisible(false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    const isInEditor = editorRef.current.contains(range.commonAncestorContainer);
    
    if (!isInEditor || selection.isCollapsed || selection.toString().trim() === '') {
      setIsFormatMenuVisible(false);
      return;
    }
    
    // Show format menu above the selection
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    
    setFormatMenuPosition({
      top: rect.top - editorRect.top - 10,
      left: (rect.left + rect.right) / 2,
    });
    
    setIsFormatMenuVisible(true);
  }, [editorRef]);

  const formatSelectedText = useCallback(
    (format: string) => {
      if (!selection || !editorRef.current) return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      if (!selectedText.trim()) return;
      
      // Apply formatting to the selected text
      const formattedText = applyMarkdownFormat(selectedText, format);
      
      // Replace the selected text with the formatted text
      range.deleteContents();
      
      // Insert the formatted text at the current selection
      const textNode = document.createTextNode(formattedText);
      range.insertNode(textNode);
      
      // Create a new range after the inserted text to avoid immediate
      // overwriting of formatting when continuing to type
      const newRange = document.createRange();
      newRange.setStartAfter(textNode);
      newRange.collapse(true);
      
      // Clear existing selections and set the new one
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      // Update the content state with the newly formatted text
      if (editorRef.current) {
        setContent(editorRef.current.innerText);
      }
      
      // Hide the format menu
      setIsFormatMenuVisible(false);
    },
    [selection, editorRef]
  );

  const formatMenuProps: FormatMenuProps = {
    isVisible: isFormatMenuVisible,
    setIsVisible: setIsFormatMenuVisible,
    position: formatMenuPosition,
    setPosition: setFormatMenuPosition,
  };

  // Save or restore document content
  const saveTemporaryContent = useCallback(() => {
    if (content) {
      localStorage.setItem('temp-document-content', content);
    }
  }, [content]);

  const restoreTemporaryContent = useCallback(() => {
    const savedContent = localStorage.getItem('temp-document-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  return {
    editorRef,
    content,
    setContent,
    selection,
    formatMenuProps,
    wordCount,
    charCount,
    isFullscreen,
    toggleFullscreen,
    isDarkTheme,
    toggleTheme,
    formatSelectedText,
    handleSelectionChange,
    saveTemporaryContent,
    restoreTemporaryContent
  };
}
