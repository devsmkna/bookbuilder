import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, Maximize, Minimize, Sun, Moon, Eye, EyeOff } from "lucide-react";

interface HeaderProps {
  onOpenSidebar: () => void;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
  isDarkTheme?: boolean;
  toggleTheme?: () => void;
  isWysiwygMode?: boolean;
  toggleEditorMode?: () => void;
}

export default function Header({ 
  onOpenSidebar,
  isFullscreen = false,
  toggleFullscreen = () => {},
  isDarkTheme = false,
  toggleTheme = () => {},
  isWysiwygMode = true,
  toggleEditorMode = () => {}
}: HeaderProps) {
  return (
    <header className="border-b border-border py-3">
      <div className="container mx-auto max-w-6xl px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={onOpenSidebar}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            <h1 className="font-medium text-primary text-xl">BookBuilder</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground mr-4">
            Your creative writing companion
          </div>
          
          {/* Editor mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleEditorMode}
            aria-label={isWysiwygMode ? "Switch to raw markdown mode" : "Switch to preview mode"}
            title={isWysiwygMode ? "Switch to raw markdown mode" : "Switch to preview mode"}
          >
            {isWysiwygMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
