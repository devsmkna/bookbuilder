import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  line: number;
  children: HeadingItem[];
}

interface TableOfContentsProps {
  content: string;
  isVisible: boolean;
  onToggle: () => void;
  onHeadingClick?: (line: number) => void;
}

export function TableOfContents({ content, isVisible, onToggle, onHeadingClick }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    parseHeadings(content);
  }, [content]);

  const parseHeadings = (text: string) => {
    const lines = text.split('\n');
    const headingRegex = /^(#{1,6})\s+(.+)$/;
    const parsedHeadings: HeadingItem[] = [];
    const stack: HeadingItem[] = [];

    lines.forEach((line, index) => {
      const match = line.match(headingRegex);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}`;

        const heading: HeadingItem = {
          id,
          level,
          text,
          line: index + 1,
          children: []
        };

        // Trova il padre appropriato basato sul livello
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          parsedHeadings.push(heading);
        } else {
          stack[stack.length - 1].children.push(heading);
        }

        stack.push(heading);
      }
    });

    setHeadings(parsedHeadings);
    // Espandi automaticamente i primi livelli
    const autoExpanded = new Set<string>();
    const addToExpanded = (items: HeadingItem[], maxLevel: number = 2) => {
      items.forEach(item => {
        if (item.level <= maxLevel) {
          autoExpanded.add(item.id);
          addToExpanded(item.children, maxLevel);
        }
      });
    };
    addToExpanded(parsedHeadings);
    setExpandedItems(autoExpanded);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderHeadingItem = (item: HeadingItem) => {
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const indentLevel = item.level - 1;

    return (
      <div key={item.id} className="mb-1">
        <div
          className={cn(
            "flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 cursor-pointer text-sm",
            "transition-colors duration-200"
          )}
          style={{ paddingLeft: `${12 + indentLevel * 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
            if (onHeadingClick) {
              onHeadingClick(item.line);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 h-4 mr-1 flex-shrink-0" />
          )}
          
          <span
            className={cn(
              "truncate font-medium",
              item.level === 1 && "text-base font-bold text-gray-900 dark:text-gray-100",
              item.level === 2 && "text-sm font-semibold text-gray-800 dark:text-gray-200",
              item.level === 3 && "text-sm font-medium text-gray-700 dark:text-gray-300",
              item.level >= 4 && "text-xs text-gray-600 dark:text-gray-400"
            )}
            title={item.text}
          >
            {item.text}
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children.map(renderHeadingItem)}
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="fixed left-4 top-20 z-10 bg-white dark:bg-gray-800 shadow-md border"
        title="Mostra indice"
      >
        <FileText className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed left-4 top-20 bottom-4 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="font-medium text-sm">Indice</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-2" style={{ height: 'calc(100vh - 200px)' }}>
        {headings.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-xs py-4">
            Nessun titolo trovato nel documento.
            <br />
            Usa # per creare titoli.
          </div>
        ) : (
          <div className="space-y-1">
            {headings.map(renderHeadingItem)}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}