import { useState, useRef, useCallback, useEffect } from "react";
import { applyMarkdownFormat, countWordsAndChars, processWikiLinks } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

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
    
    // Auto-save content whenever it changes
    if (content) {
      localStorage.setItem('editor-content', content);
    }
  }, [content]);
  
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
        
        // Force trigger an update event
        const inputEvent = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(inputEvent);
      }
      
      // Hide the format menu
      setIsFormatMenuVisible(false);
    },
    [selection, editorRef, setContent]
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
  
  // Process content with wiki links
  const processContent = useCallback(() => {
    if (!content) {
      setRenderedContent("");
      return;
    }
    
    // Process the content with markdown and wiki links
    const processed = processWikiLinks(content, linkedEntities);
    setRenderedContent(processed);
  }, [content, linkedEntities]);
  
  // Toggle between raw markdown and WYSIWYG mode
  const toggleEditorMode = useCallback(() => {
    // Save current content before toggling mode to ensure it persists
    if (content) {
      localStorage.setItem('editor-content', content);
    }
    
    // Toggle the mode
    setIsWysiwygMode(prev => !prev);
    
    // Force re-process content for wiki links
    processContent();
  }, [content, processContent]);
  
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
      
      // Trigger an input event to update the editor
      const inputEvent = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(inputEvent);
    }
    
    // Process the content to show the updated links
    processContent();
    
  }, [selection, editorRef, processContent, setContent]);

  // Process content when it changes or when linkedEntities change
  useEffect(() => {
    processContent();
  }, [content, linkedEntities, processContent]);

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
    createWikiLink
  };
}
