import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, FileUp } from "lucide-react";

interface HeaderProps {
  onOpenSidebar: () => void;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
  isDarkTheme?: boolean;
  toggleTheme?: () => void;
  isWysiwygMode?: boolean;
  toggleEditorMode?: () => void;
  onOpenExportImport?: () => void;
}

export default function Header({ 
  onOpenSidebar,
  isFullscreen = false,
  toggleFullscreen = () => {},
  isDarkTheme = false,
  toggleTheme = () => {},
  isWysiwygMode = true,
  toggleEditorMode = () => {},
  onOpenExportImport = () => {}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Do you want to export the current project before creating a new one?")) {
                // Prima esporta il progetto attuale
                onOpenExportImport();
              }
              // Poi resetta tutto (localStorage)
              if (confirm("Create a new project? This will clear all current data.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="ml-4"
          >
            Create New Project
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Export/Import toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenExportImport}
            aria-label="Esporta/Importa Progetto"
            title="Esporta/Importa Progetto"
          >
            <FileUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
