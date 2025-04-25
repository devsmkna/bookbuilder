import React from 'react';
import { Link } from 'wouter';
import { Menu, X, UserPlus, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-medium">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/">
                <div onClick={onClose} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                  <Edit className="h-4 w-4" />
                  <span>Editor</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/character-creation">
                <div onClick={onClose} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                  <UserPlus className="h-4 w-4" />
                  <span>Character Creation</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
        
        <Separator className="my-4" />
        
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            WYSIWYG Markdown Editor
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </>
  );
}