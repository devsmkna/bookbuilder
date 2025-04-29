import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen } from "lucide-react";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ 
  onOpenSidebar
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
        
        <div className="text-sm text-muted-foreground">
          Your creative writing companion
        </div>
      </div>
    </header>
  );
}
