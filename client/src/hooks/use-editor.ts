import { useState, useRef, useCallback, useEffect } from "react";
import { applyMarkdownFormat, countWordsAndChars, processWikiLinks } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRealtimeGamification } from "@/hooks/use-realtime-gamification";

// Entity types that can be linked in the editor
export interface LinkedEntity {
  id: string;
  name: string;
  type: "character" | "place" | "race" | "event";
}

interface FormatMenuProps {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  position: { top: number; left: number };
  setPosition: (position: { top: number; left: number }) => void;
}

export function useEditor() {
  // Initialize content from localStorage or empty string
  const [content, setContent] = useState<string>(() => {
    // Try to load saved content first
    const savedContent = localStorage.getItem('editor-content');
    return savedContent || "";
  });
  
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isFormatMenuVisible, setIsFormatMenuVisible] = useState(false);
  const [formatMenuPosition, setFormatMenuPosition] = useState({ top: 0, left: 0 });
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [linkedEntities, setLinkedEntities] = useState<LinkedEntity[]>([]);
  const [isWysiwygMode, setIsWysiwygMode] = useState<boolean>(true);
  
  // Get system preference for dark mode
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const previousWordCountRef = useRef(0);
  
  // Hook per la gamificazione in tempo reale
  const { addWordsToSession } = useRealtimeGamification();

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

  // Update word and character count when content changes and auto-save
  useEffect(() => {
    const { words, chars } = countWordsAndChars(content);
    setWordCount(words);
    setCharCount(chars);
    
    // Tracking gamificazione: conta le nuove parole scritte
    const previousWords = previousWordCountRef.current;
    if (words > previousWords) {
      const newWordsWritten = words - previousWords;
      addWordsToSession(newWordsWritten);
      console.log(`📝 Scritte ${newWordsWritten} nuove parole - Totale: ${words}`);
    }
    previousWordCountRef.current = words;
    
    // Auto-save content whenever it changes
    if (content) {
      localStorage.setItem('editor-content', content);
    }
    
    // Process wiki links and render content
    if (content) {
      const processed = processWikiLinks(content, linkedEntities);
      setRenderedContent(processed);
    } else {
      setRenderedContent("");
    }
  }, [content, linkedEntities, addWordsToSession]);
  
  // Load linked entities (characters and places)
  useEffect(() => {
    // Load characters
    const savedCharacters = localStorage.getItem('characters');
    const savedPlaces = localStorage.getItem('world-builder-places');
    const savedRaces = localStorage.getItem('book-builder-races');
    const savedEvents = localStorage.getItem('book-builder-storyboard');
    
    let entities: LinkedEntity[] = [];
    
    // Parse and add characters
    if (savedCharacters) {
      try {
        const characters = JSON.parse(savedCharacters);
        entities = entities.concat(
          characters.map((char: any) => ({
            id: char.id,
            name: char.name,
            type: 'character'
          }))
        );
      } catch (e) {
        console.error('Failed to parse saved characters:', e);
      }
    }
    
    // Parse and add places
    if (savedPlaces) {
      try {
        const places = JSON.parse(savedPlaces);
        entities = entities.concat(
          places.map((place: any) => ({
            id: place.id,
            name: place.name,
            type: 'place'
          }))
        );
      } catch (e) {
        console.error('Failed to parse saved places:', e);
      }
    }
    
    // Parse and add races
    if (savedRaces) {
      try {
        const races = JSON.parse(savedRaces);
        entities = entities.concat(
          races.map((race: any) => ({
            id: race.id,
            name: race.name,
            type: 'race'
          }))
        );
      } catch (e) {
        console.error('Failed to parse saved races:', e);
      }
    }
    
    // Parse and add story events
    if (savedEvents) {
      try {
        const events = JSON.parse(savedEvents);
        entities = entities.concat(
          events.map((event: any) => ({
            id: event.id,
            name: event.title || 'Untitled Event',
            type: 'event'
          }))
        );
      } catch (e) {
        console.error('Failed to parse saved events:', e);
      }
    }
    
    setLinkedEntities(entities);
  }, []);

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

  const processContent = useCallback(() => {
    if (!content) {
      setRenderedContent("");
      return;
    }
    
    // Process the content with markdown and wiki links
    const processed = processWikiLinks(content, linkedEntities);
    setRenderedContent(processed);
  }, [content, linkedEntities]);

  const formatSelectedText = useCallback(
    (format: string) => {
      if (!editorRef.current) return;
      
      // Get the current selection
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      
      const range = sel.getRangeAt(0);
      const selectedText = sel.toString();
      
      // Check we have text selected and that the selection is within our editor
      if (!selectedText.trim() || !editorRef.current.contains(range.commonAncestorContainer)) return;
      
      // Apply formatting to the selected text
      const formattedText = applyMarkdownFormat(selectedText, format);
      
      // Replace the selected text with the formatted text
      range.deleteContents();
      
      // Insert the formatted text
      const textNode = document.createTextNode(formattedText);
      range.insertNode(textNode);
      
      // Create a new range after the inserted text
      const newRange = document.createRange();
      newRange.setStartAfter(textNode);
      newRange.collapse(true);
      
      // Update selection
      sel.removeAllRanges();
      sel.addRange(newRange);
      
      // Update the content state
      if (editorRef.current) {
        const newContent = editorRef.current.innerText;
        setContent(newContent);
      }
      
      // Hide the format menu
      setIsFormatMenuVisible(false);
    },
    [editorRef, setContent]
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
  
  // Toggle between raw markdown and WYSIWYG mode
  const toggleEditorMode = useCallback(() => {
    // Save current content before toggling mode to ensure it persists
    if (content) {
      localStorage.setItem('editor-content', content);
    }
    
    // Toggle the mode
    setIsWysiwygMode(prev => !prev);
  }, [content]);
  
  // Handle adding a wiki link by selecting text and converting to [[text]]
  const createWikiLink = useCallback(() => {
    if (!selection || !editorRef.current) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (!selectedText) return;
    
    // Add the wiki link syntax
    const wikiLinkText = `[[${selectedText}]]`;
    
    // Replace the selected text with the wiki link
    range.deleteContents();
    const textNode = document.createTextNode(wikiLinkText);
    range.insertNode(textNode);
    
    // Create a new range after the inserted text
    const newRange = document.createRange();
    newRange.setStartAfter(textNode);
    newRange.collapse(true);
    
    // Clear existing selections and set the new one
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    // Update the content state
    if (editorRef.current) {
      setContent(editorRef.current.innerText);
    }
    
  }, [selection, editorRef, setContent]);

  // Function to scroll to a specific line in the editor
  const scrollToLine = useCallback((lineNumber: number) => {
    if (!editorRef.current) return;
    
    const lines = content.split('\n');
    if (lineNumber > lines.length) return;
    
    // Find the character position for the line
    let charPosition = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      charPosition += lines[i].length + 1; // +1 for newline
    }
    
    // Try to find and scroll to the position
    const textNodes = editorRef.current.childNodes;
    let currentPos = 0;
    
    for (const node of textNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (currentPos + textLength >= charPosition) {
          // Found the target node, scroll it into view
          const range = document.createRange();
          range.setStart(node, Math.max(0, charPosition - currentPos));
          range.collapse(true);
          
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          
          // Scroll into view
          const rect = range.getBoundingClientRect();
          if (rect.top < 100 || rect.top > window.innerHeight - 100) {
            editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          break;
        }
        currentPos += textLength;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        currentPos += node.textContent?.length || 0;
      }
    }
  }, [content, editorRef]);

  // Toggle Table of Contents visibility
  const toggleTableOfContents = useCallback(() => {
    setShowTableOfContents(prev => !prev);
  }, []);

  return {
    editorRef,
    content,
    setContent,
    renderedContent,
    selection,
    formatMenuProps,
    wordCount,
    charCount,
    isFullscreen,
    toggleFullscreen,
    isDarkTheme,
    toggleTheme,
    isWysiwygMode,
    toggleEditorMode,
    linkedEntities,
    formatSelectedText,
    handleSelectionChange,
    saveTemporaryContent,
    restoreTemporaryContent,
    processContent,
    createWikiLink,
    showTableOfContents,
    toggleTableOfContents,
    scrollToLine
  };
}
