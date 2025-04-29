import React, { useState, useEffect } from "react";
import Header from "./Header";
import EditorContent from "./EditorContent";
import FormatMenu from "./FormatMenu";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useEditor } from "@/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Link, Text, FileText, Eye, EyeOff, Link2 } from "lucide-react";

export default function Editor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
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
    processContent,
    createWikiLink
  } = useEditor();

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Handle window resize to adjust format menu position if needed
  useEffect(() => {
    const handleResize = () => {
      handleSelectionChange();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleSelectionChange]);

  // Handle clicks outside the editor to hide the format menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(e.target as Node) &&
        formatMenuProps.isVisible
      ) {
        formatMenuProps.setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editorRef, formatMenuProps]);

  // Save content when navigating away
  useEffect(() => {
    // Save content before user navigates away
    const handleBeforeNavigate = () => {
      saveTemporaryContent();
    };

    window.addEventListener('beforeunload', handleBeforeNavigate);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeNavigate);
    };
  }, [saveTemporaryContent]);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <Header 
        isFullscreen={isFullscreen} 
        toggleFullscreen={toggleFullscreen}
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
        isWysiwygMode={isWysiwygMode}
        toggleEditorMode={toggleEditorMode}
        onOpenSidebar={handleOpenSidebar}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="relative bg-card rounded-lg shadow-sm">
            {/* Wiki-style editor toolbar */}
            <div className="border-b border-border p-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                  onClick={() => formatSelectedText('bold')}
                >
                  <span className="font-bold">B</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                  onClick={() => formatSelectedText('italic')}
                >
                  <span className="italic">I</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                  onClick={() => formatSelectedText('code')}
                >
                  <span className="font-mono">`</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                  onClick={createWikiLink}
                  title="Create wiki link (Ctrl+K/Cmd+K)"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {isWysiwygMode ? "WYSIWYG Mode" : "Markdown Mode"}
              </div>
            </div>
            
            {/* Floating format menu for selections */}
            <FormatMenu 
              isVisible={formatMenuProps.isVisible}
              position={formatMenuProps.position}
              onFormat={formatSelectedText}
            />
            
            {/* Editor content */}
            <EditorContent 
              ref={editorRef}
              content={content}
              onChange={setContent}
              renderedContent={renderedContent}
              isWysiwygMode={isWysiwygMode}
              linkedEntities={linkedEntities}
              onCreateWikiLink={createWikiLink}
            />
          </div>
        </div>
      </main>
      
      <Footer wordCount={wordCount} charCount={charCount} />
    </div>
  );
}
