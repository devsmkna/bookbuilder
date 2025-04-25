import React from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Code, 
  Quote, 
  List, 
  Heading1, 
  Heading2, 
  Heading3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FormatButtonProps {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}

const FormatButton = ({ onClick, title, icon }: FormatButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    onClick={onClick}
    title={title}
  >
    {icon}
  </Button>
);

interface FormatMenuProps {
  isVisible: boolean;
  position: { top: number; left: number };
  onFormat: (format: string) => void;
}

export default function FormatMenu({ isVisible, position, onFormat }: FormatMenuProps) {
  if (!isVisible) return null;

  const formatOptions = [
    { format: 'bold', title: 'Bold', icon: <Bold className="h-4 w-4" /> },
    { format: 'italic', title: 'Italic', icon: <Italic className="h-4 w-4" /> },
    { format: 'underline', title: 'Underline', icon: <Underline className="h-4 w-4" /> },
    { format: 'h1', title: 'Heading 1', icon: <Heading1 className="h-4 w-4" /> },
    { format: 'h2', title: 'Heading 2', icon: <Heading2 className="h-4 w-4" /> },
    { format: 'h3', title: 'Heading 3', icon: <Heading3 className="h-4 w-4" /> },
    { format: 'code', title: 'Code', icon: <Code className="h-4 w-4" /> },
    { format: 'quote', title: 'Quote', icon: <Quote className="h-4 w-4" /> },
    { format: 'list', title: 'List', icon: <List className="h-4 w-4" /> },
  ];

  return (
    <div
      className={cn(
        "format-menu absolute z-10 flex items-center bg-card border border-border rounded-md shadow-md py-1 px-1",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      {formatOptions.slice(0, 3).map((option) => (
        <FormatButton
          key={option.format}
          onClick={() => onFormat(option.format)}
          title={option.title}
          icon={option.icon}
        />
      ))}
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {formatOptions.slice(3, 6).map((option) => (
        <FormatButton
          key={option.format}
          onClick={() => onFormat(option.format)}
          title={option.title}
          icon={option.icon}
        />
      ))}
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {formatOptions.slice(6).map((option) => (
        <FormatButton
          key={option.format}
          onClick={() => onFormat(option.format)}
          title={option.title}
          icon={option.icon}
        />
      ))}
    </div>
  );
}
