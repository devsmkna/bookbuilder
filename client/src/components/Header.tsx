import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Maximize2, Minimize2, Save, Menu } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  onOpenSidebar: () => void;
}

export default function Header({ 
  isFullscreen, 
  toggleFullscreen, 
  isDarkTheme, 
  toggleTheme,
  onOpenSidebar
}: HeaderProps) {
  const { toast } = useToast();
  
  const handleSave = async () => {
    try {
      // This is a placeholder for saving functionality
      // It would normally save to a backend via an API call
      await apiRequest("POST", "/api/save-document", {
        content: document.querySelector('.editor-content')?.textContent || '',
      });
      
      toast({
        title: "Document saved",
        description: "Your document has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving document",
        description: "There was an error saving your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-border py-3">
      <div className="container mx-auto max-w-4xl px-4 flex justify-between items-center">
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
          <h1 className="font-medium text-primary">WYSIWYG Markdown Editor</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm px-3 py-1.5 rounded flex items-center"
            onClick={toggleTheme}
          >
            {isDarkTheme ? (
              <Sun className="h-4 w-4 mr-1.5" />
            ) : (
              <Moon className="h-4 w-4 mr-1.5" />
            )}
            Theme
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm px-3 py-1.5 rounded flex items-center"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 mr-1.5" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-1.5" />
            )}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            className="text-sm bg-accent hover:bg-accent/90 text-white px-3 py-1.5 rounded flex items-center"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save
          </Button>
        </div>
      </div>
    </header>
  );
}
