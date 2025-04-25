import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert plain text to Markdown format
export function applyMarkdownFormat(text: string, format: string): string {
  switch (format) {
    case 'bold':
      return `**${text}**`;
    case 'italic':
      return `*${text}*`;
    case 'code':
      return `\`${text}\``;
    case 'h1':
      return `# ${text}`;
    case 'h2':
      return `## ${text}`;
    case 'h3':
      return `### ${text}`;
    case 'quote':
      return `> ${text}`;
    case 'list':
      return text.split('\n').map(line => `- ${line}`).join('\n');
    case 'underline':
      return `<u>${text}</u>`;
    default:
      return text;
  }
}

// Calculate word and character count
export function countWordsAndChars(text: string): { words: number, chars: number } {
  const trimmedText = text.trim();
  const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
  const chars = text.length;
  
  return { words, chars };
}
