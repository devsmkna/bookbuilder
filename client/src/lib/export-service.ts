/**
 * Servizio per l'esportazione del contenuto dell'editor in diversi formati
 */

import { marked } from 'marked';

export interface ExportOptions {
  title?: string;
  author?: string;
  includeMetadata?: boolean;
  includeStats?: boolean;
  format: 'pdf' | 'html' | 'txt' | 'docx';
}

export interface ExportMetadata {
  title: string;
  author: string;
  wordCount: number;
  charCount: number;
  exportDate: string;
  projectName: string;
}

/**
 * Esporta il contenuto in formato HTML
 */
export function exportToHTML(content: string, metadata: ExportMetadata, options: ExportOptions, isAlreadyRendered: boolean = false): string {
  // Se il contenuto è già HTML renderizzato, lo usiamo direttamente, altrimenti lo convertiamo da Markdown
  const htmlContent = isAlreadyRendered ? content : marked(content);
  
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title}</title>
    <style>
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
            background-color: #fff;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            border-bottom: 2px solid #eee;
            padding-bottom: 2rem;
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }
        
        .author {
            font-size: 1.2rem;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .metadata {
            background-color: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .content {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 1.1rem;
            text-align: justify;
            line-height: 1.4;
            overflow-y: auto;
            -webkit-hyphens: auto;
            -moz-hyphens: auto;
            -ms-hyphens: auto;
            hyphens: auto;
            word-break: normal;
            overflow-wrap: normal;
        }
        
        /* Stili identici all'anteprima dell'editor */
        .content h1 {
            font-size: 1.5rem;
            margin: 8rem 0 10rem;
            text-align: center;
            color: #2c3e50;
        }
        
        .content h1:first-child {
            margin-top: 0;
        }
        
        .content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem;
            padding-bottom: 0.2rem;
            color: #34495e;
        }
        
        .content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 1rem 0 0.75rem;
            color: #34495e;
        }
        
        .content p {
            margin: 0;
            text-indent: 2rem;
        }
        
        .content blockquote {
            border-left: 4px solid #007AFF;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6c757d;
            font-style: italic;
            background-color: #f8f9fa;
            padding: 1rem;
            border-radius: 0 8px 8px 0;
        }
        
        .content code {
            font-family: "Menlo", "Monaco", "Consolas", monospace;
            background-color: #f1f3f4;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.9em;
        }
        
        .content pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 1rem;
            overflow-x: auto;
        }
        
        /* Stili per le liste */
        .content ul, .content ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }
        
        .content li {
            margin-bottom: 0.5rem;
        }
        
        /* Stili per i link delle entità */
        .content .entity-link {
            color: #007AFF;
            text-decoration: none;
            border-bottom: 1px dotted #007AFF;
        }
        
        .content .entity-link:hover {
            background-color: #f0f8ff;
        }
        
        /* Stili per enfasi */
        .content strong {
            font-weight: bold;
        }
        
        .content em {
            font-style: italic;
        }
        
        .content u {
            text-decoration: underline;
        }
        
        .content del {
            text-decoration: line-through;
        }
        
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        @media print {
            body {
                padding: 1rem;
            }
            
            .metadata {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${metadata.title}</div>
        <div class="author">di ${metadata.author}</div>
    </div>
    
    ${options.includeMetadata ? `
    <div class="metadata">
        <strong>Progetto:</strong> ${metadata.projectName}<br>
        <strong>Parole:</strong> ${metadata.wordCount.toLocaleString()}<br>
        <strong>Caratteri:</strong> ${metadata.charCount.toLocaleString()}<br>
        <strong>Esportato il:</strong> ${new Date(metadata.exportDate).toLocaleDateString('it-IT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
    </div>
    ` : ''}
    
    <div class="content">
        ${htmlContent}
    </div>
    
    <div class="footer">
        Generato con BookBuilder - ${new Date().getFullYear()}
    </div>
</body>
</html>`;

  return htmlTemplate;
}

/**
 * Esporta il contenuto in formato PDF usando la stampa del browser
 */
export function exportToPDF(htmlContent: string, filename: string): void {
  // Crea una nuova finestra con il contenuto HTML
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aspetta che il contenuto sia caricato, poi avvia la stampa
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Chiudi la finestra dopo la stampa (opzionale)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  } else {
    alert('Impossibile aprire la finestra di stampa. Controlla le impostazioni del popup.');
  }
}

/**
 * Esporta il contenuto in formato testo semplice
 */
export function exportToTXT(content: string, filename: string): void {
  // Rimuove la formattazione Markdown per ottenere testo semplice
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Rimuove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Rimuove bold
    .replace(/\*(.*?)\*/g, '$1') // Rimuove italic
    .replace(/`(.*?)`/g, '$1') // Rimuove code inline
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Rimuove links, mantiene testo
    .replace(/^\s*[-*+]\s+/gm, '• ') // Converte liste in bullet points
    .replace(/^\s*\d+\.\s+/gm, '• ') // Converte liste numerate in bullet points
    .replace(/^>\s+/gm, '"') // Converte quote in virgolette
    .replace(/\n{3,}/g, '\n\n'); // Riduce righe vuote multiple
  
  downloadFile(plainText, filename, 'text/plain');
}

/**
 * Scarica il contenuto HTML
 */
export function downloadHTML(htmlContent: string, filename: string): void {
  downloadFile(htmlContent, filename, 'text/html');
}

/**
 * Funzione helper per scaricare file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Libera la memoria
  URL.revokeObjectURL(url);
}

/**
 * Genera un nome file basato su titolo e data
 */
export function generateFilename(title: string, format: string): string {
  const sanitizedTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, '') // Rimuove caratteri speciali
    .replace(/\s+/g, '-') // Sostituisce spazi con trattini
    .toLowerCase();
  
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  return `${sanitizedTitle || 'documento'}-${date}.${format}`;
}

/**
 * Conta le statistiche del testo
 */
export function getTextStatistics(content: string): { wordCount: number; charCount: number; paragraphs: number } {
  const words = content
    .replace(/[^\w\s]/g, ' ') // Sostituisce punteggiatura con spazi
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
    
  const characters = content.length;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  
  return {
    wordCount: words.length,
    charCount: characters,
    paragraphs
  };
}