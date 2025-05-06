import React from "react";
import { 
  Bold, 
  Italic, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Quote,
  List,
  ListOrdered,
  Underline,
  Strikethrough
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormatMenuProps {
  show: boolean;
  position: { top: number; left: number };
  onFormat: (format: string) => void;
}

interface FormatButtonProps {
  icon: React.ReactNode;
  label: string;
  format: string;
  onClick: (format: string) => void;
}

const FormatButton: React.FC<FormatButtonProps> = ({ icon, label, format, onClick }) => (
  <button
    type="button"
    className="format-button p-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-center"
    onClick={() => onClick(format)}
    title={label}
    aria-label={label}
  >
    {icon}
  </button>
);

const FormatMenu: React.FC<FormatMenuProps> = ({ show, position, onFormat }) => {
  if (!show) return null;
  
  const formatOptions = [
    { icon: <Bold className="h-4 w-4" />, label: "Grassetto", format: "bold" },
    { icon: <Italic className="h-4 w-4" />, label: "Corsivo", format: "italic" },
    { icon: <Underline className="h-4 w-4" />, label: "Sottolineato", format: "underline" },
    { icon: <Strikethrough className="h-4 w-4" />, label: "Barrato", format: "strikethrough" },
    { icon: <Code className="h-4 w-4" />, label: "Codice", format: "code" },
    { icon: <Heading1 className="h-4 w-4" />, label: "Titolo 1", format: "h1" },
    { icon: <Heading2 className="h-4 w-4" />, label: "Titolo 2", format: "h2" },
    { icon: <Heading3 className="h-4 w-4" />, label: "Titolo 3", format: "h3" },
    { icon: <Quote className="h-4 w-4" />, label: "Citazione", format: "quote" },
    { icon: <List className="h-4 w-4" />, label: "Elenco puntato", format: "unordered-list" },
    { icon: <ListOrdered className="h-4 w-4" />, label: "Elenco numerato", format: "ordered-list" }
  ];
  
  return (
    <div
      className={cn(
        "format-menu absolute z-50 bg-card border rounded-md shadow-lg flex p-1",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, 0)" // Centra il menu
      }}
    >
      <div className="format-buttons grid grid-cols-4 sm:grid-cols-11 gap-1">
        {formatOptions.map((option) => (
          <FormatButton
            key={option.format}
            icon={option.icon}
            label={option.label}
            format={option.format}
            onClick={onFormat}
          />
        ))}
      </div>
    </div>
  );
};

export default FormatMenu;