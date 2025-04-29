import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert plain text to Markdown format
export function applyMarkdownFormat(text: string, format: string): string {
  // Remove any existing Markdown formatting of the same type
  let cleanText = text;
  
  switch (format) {
    case 'bold':
      // Remove existing bold formatting if it's already there
      if (cleanText.startsWith('**') && cleanText.endsWith('**')) {
        return cleanText.slice(2, -2);
      }
      return `**${cleanText}**`;
      
    case 'italic':
      // Remove existing italic formatting if it's already there
      if (cleanText.startsWith('*') && cleanText.endsWith('*') && 
          !(cleanText.startsWith('**') && cleanText.endsWith('**'))) {
        return cleanText.slice(1, -1);
      }
      return `*${cleanText}*`;
      
    case 'code':
      // Remove existing code formatting if it's already there
      if (cleanText.startsWith('`') && cleanText.endsWith('`')) {
        return cleanText.slice(1, -1);
      }
      return `\`${cleanText}\``;
      
    case 'h1':
      // Remove existing h1 formatting if it's already there
      if (cleanText.startsWith('# ')) {
        return cleanText.slice(2);
      }
      return `# ${cleanText}`;
      
    case 'h2':
      // Remove existing h2 formatting if it's already there
      if (cleanText.startsWith('## ')) {
        return cleanText.slice(3);
      }
      return `## ${cleanText}`;
      
    case 'h3':
      // Remove existing h3 formatting if it's already there
      if (cleanText.startsWith('### ')) {
        return cleanText.slice(4);
      }
      return `### ${cleanText}`;
      
    case 'quote':
      // Handle multi-line quotes
      const lines = cleanText.split('\n');
      // Check if all lines are already quoted
      const allQuoted = lines.every(line => line.startsWith('> '));
      
      if (allQuoted) {
        // Remove quotes
        return lines.map(line => line.slice(2)).join('\n');
      }
      // Add quotes
      return lines.map(line => `> ${line}`).join('\n');
      
    case 'list':
      // Handle multi-line lists
      const listLines = cleanText.split('\n');
      // Check if all lines are already list items
      const allList = listLines.every(line => line.startsWith('- '));
      
      if (allList) {
        // Remove list formatting
        return listLines.map(line => line.slice(2)).join('\n');
      }
      // Add list formatting
      return listLines.map(line => `- ${line}`).join('\n');
      
    case 'underline':
      // Remove existing underline formatting if it's already there
      if (cleanText.startsWith('<u>') && cleanText.endsWith('</u>')) {
        return cleanText.slice(3, -4);
      }
      return `<u>${cleanText}</u>`;
      
    default:
      return cleanText;
  }
}

// Calculate word and character count
export function countWordsAndChars(text: string): { words: number, chars: number } {
  const trimmedText = text.trim();
  const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
  const chars = text.length;
  
  return { words, chars };
}

// Process wiki-style links with [[reference]] syntax
export function processWikiLinks(text: string, entities: {id: string, name: string, type: string}[]): string {
  // Find all [[reference]] patterns
  const linkRegex = /\[\[(.*?)\]\]/g;
  
  // Replace all wiki links with HTML anchors
  return text.replace(linkRegex, (match, name) => {
    // Find entity that matches the name
    const entity = entities.find(e => 
      e.name.toLowerCase() === name.toLowerCase() || 
      name.toLowerCase().startsWith(e.name.toLowerCase())
    );
    
    if (entity) {
      // Create a proper anchor tag with data attributes for entity type and id
      return `<a href="#" class="wiki-link" data-entity-id="${entity.id}" data-entity-type="${entity.type}">${name}</a>`;
    }
    
    // If no match is found, return with a class indicating it's not found
    return `<a href="#" class="wiki-link wiki-link-not-found">${name}</a>`;
  });
}
