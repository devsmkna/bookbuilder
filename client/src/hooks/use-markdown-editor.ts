import { useState, useRef, useCallback, useEffect } from "react";
import { countWordsAndChars } from "@/lib/utils";

// Tipi di entità che possono essere linkate nell'editor
export interface LinkedEntity {
  id: string;
  name: string;
  type: "character" | "place" | "race" | "event";
  description?: string;
  imageUrl?: string;
}

// Risultato della ricerca di entità da linkare
export interface EntitySearchResult {
  entities: LinkedEntity[];
  query: string;
}

// Posizione del cursore o della selezione
interface CursorPosition {
  start: number;
  end: number;
}

export function useMarkdownEditor() {
  // Stato dell'editor
  const [content, setContent] = useState<string>(() => {
    // Recupera il contenuto salvato precedentemente
    const savedContent = localStorage.getItem('editor-content');
    return savedContent || "";
  });
  
  // Stati UI
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("editor-theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  
  // Metriche del testo
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Riferimenti agli elementi DOM
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Stato per il menu di formattazione sulla selezione
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [formatMenuPosition, setFormatMenuPosition] = useState({ top: 0, left: 0 });
  
  // Stato per il menu di ricerca delle entità
  const [showEntityMenu, setShowEntityMenu] = useState(false);
  const [entityMenuPosition, setEntityMenuPosition] = useState({ top: 0, left: 0 });
  const [entitySearchQuery, setEntitySearchQuery] = useState("");
  const [entitySearchResults, setEntitySearchResults] = useState<EntitySearchResult>({
    entities: [],
    query: ""
  });
  
  // Posizione corrente del cursore o della selezione
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ start: 0, end: 0 });
  
  // Stato per le entità linkate già create
  const [linkedEntities, setLinkedEntities] = useState<LinkedEntity[]>([]);
  
  // Carica le entità da localStorage
  useEffect(() => {
    const loadEntities = () => {
      let entities: LinkedEntity[] = [];
      
      // Carica i personaggi
      try {
        const savedCharacters = localStorage.getItem('characters');
        if (savedCharacters) {
          const characters = JSON.parse(savedCharacters);
          entities = entities.concat(
            characters.map((char: any) => ({
              id: char.id,
              name: char.name || "Unnamed Character",
              type: 'character',
              description: `${char.race || ""} ${char.age ? `(${char.age})` : ""}`.trim(),
              imageUrl: char.imageData || ""
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load characters:', e);
      }
      
      // Carica i luoghi
      try {
        const savedPlaces = localStorage.getItem('world-builder-places');
        if (savedPlaces) {
          const places = JSON.parse(savedPlaces);
          entities = entities.concat(
            places.map((place: any) => ({
              id: place.id,
              name: place.name || "Unnamed Place",
              type: 'place',
              description: place.type || "",
              imageUrl: place.images?.[0] || ""
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load places:', e);
      }
      
      // Carica le razze
      try {
        const savedRaces = localStorage.getItem('book-builder-races');
        if (savedRaces) {
          const races = JSON.parse(savedRaces);
          entities = entities.concat(
            races.map((race: any) => ({
              id: race.id,
              name: race.name || "Unnamed Race",
              type: 'race',
              description: race.traits || "",
              imageUrl: race.imageData || ""
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load races:', e);
      }
      
      // Carica gli eventi
      try {
        const savedEvents = localStorage.getItem('book-builder-storyboard');
        if (savedEvents) {
          const events = JSON.parse(savedEvents);
          entities = entities.concat(
            events.map((event: any) => ({
              id: event.id,
              name: event.title || "Unnamed Event",
              type: 'event',
              description: event.description || "",
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load events:', e);
      }
      
      setLinkedEntities(entities);
    };
    
    loadEntities();
  }, []);
  
  // Aggiorna i conteggi parole/caratteri e salva quando il contenuto cambia
  useEffect(() => {
    const { words, chars } = countWordsAndChars(content);
    setWordCount(words);
    setCharCount(chars);
    
    // Salva automaticamente
    localStorage.setItem('editor-content', content);
  }, [content]);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);
  
  // Toggle tema
  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => {
      const newTheme = !prev;
      localStorage.setItem("editor-theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  }, []);
  
  // Salva la posizione temporanea quando si cambia pagina
  const saveTemporaryContent = useCallback(() => {
    localStorage.setItem('temp-document-content', content);
  }, [content]);
  
  // Ripristina il contenuto temporaneo
  const restoreTemporaryContent = useCallback(() => {
    const tempContent = localStorage.getItem('temp-document-content');
    if (tempContent) {
      setContent(tempContent);
    }
  }, []);
  
  // Gestisce i cambiamenti di selezione del testo
  const handleSelectionChange = useCallback(() => {
    if (!textareaRef.current || !window.getSelection) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = window.getSelection();
    
    setCursorPosition({ start, end });
    
    // Controlla se c'è una selezione reale (non solo il cursore)
    if (start !== end && selection && !selection.isCollapsed) {
      // Calcola la posizione del menu
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const editorRect = editorRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
      
      setFormatMenuPosition({
        top: rect.top - editorRect.top - 35, // posiziona sopra la selezione
        left: rect.left + (rect.width / 2) // centra orizzontalmente
      });
      
      setShowFormatMenu(true);
    } else {
      setShowFormatMenu(false);
      
      // Controlla se è stato digitato @ per mostrare il menu delle entità
      const currentLine = getCurrentLineContent(textarea);
      const match = /@(\w*)$/.exec(currentLine);
      
      if (match) {
        const query = match[1];
        setEntitySearchQuery(query);
        
        // Calcola la posizione del cursore per il menu entità
        const cursorPosition = getCursorCoordinates(textarea);
        if (cursorPosition) {
          const editorRect = editorRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
          
          setEntityMenuPosition({
            top: cursorPosition.top - editorRect.top + 20, // posiziona sotto il cursore
            left: cursorPosition.left - editorRect.left
          });
          
          // Cerca entità per il menu
          searchEntities(query);
          setShowEntityMenu(true);
        }
      } else {
        setShowEntityMenu(false);
      }
    }
  }, []);
  
  // Ottiene il contenuto della linea corrente
  const getCurrentLineContent = (textarea: HTMLTextAreaElement): string => {
    const start = textarea.selectionStart;
    const text = textarea.value;
    
    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    let lineEnd = start;
    while (lineEnd < text.length && text[lineEnd] !== '\n') {
      lineEnd++;
    }
    
    return text.substring(lineStart, start);
  };
  
  // Ottiene le coordinate del cursore nella textarea
  const getCursorCoordinates = (textarea: HTMLTextAreaElement) => {
    const position = textarea.selectionStart;
    
    // Creiamo un elemento temporaneo che rispecchia lo stile della textarea
    const mirror = document.createElement('div');
    mirror.style.position = 'absolute';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.padding = window.getComputedStyle(textarea).padding;
    mirror.style.border = window.getComputedStyle(textarea).border;
    mirror.style.font = window.getComputedStyle(textarea).font;
    
    // Aggiungiamo il testo fino alla posizione del cursore
    const textBeforeCursor = textarea.value.substring(0, position);
    mirror.textContent = textBeforeCursor;
    
    // Aggiungiamo un elemento span per rappresentare il cursore
    const cursorSpan = document.createElement('span');
    cursorSpan.textContent = '.';
    mirror.appendChild(cursorSpan);
    
    // Aggiungiamo il mirror al DOM temporaneamente
    document.body.appendChild(mirror);
    
    // Otteniamo le coordinate
    const cursorCoords = cursorSpan.getBoundingClientRect();
    
    // Rimuoviamo l'elemento temporaneo
    document.body.removeChild(mirror);
    
    return cursorCoords;
  };
  
  // Cerca entità in base alla query
  const searchEntities = (query: string) => {
    if (!query) {
      setEntitySearchResults({ entities: linkedEntities, query: "" });
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    const filteredEntities = linkedEntities.filter(
      entity => entity.name.toLowerCase().includes(lowerCaseQuery)
    );
    
    setEntitySearchResults({
      entities: filteredEntities,
      query
    });
  };
  
  // Applica una formattazione Markdown al testo selezionato
  const applyFormatting = useCallback((format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return; // Nessuna selezione
    
    const selectedText = textarea.value.substring(start, end);
    let formattedText = "";
    
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "code":
        formattedText = `\`${selectedText}\``;
        break;
      case "h1":
        formattedText = `# ${selectedText}`;
        break;
      case "h2":
        formattedText = `## ${selectedText}`;
        break;
      case "h3":
        formattedText = `### ${selectedText}`;
        break;
      case "quote":
        formattedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        break;
      case "list":
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      default:
        formattedText = selectedText;
    }
    
    // Sostituisci il testo selezionato con il testo formattato
    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setContent(newContent);
    
    // Nascondi il menu di formattazione
    setShowFormatMenu(false);
    
    // Ripristina il focus su textarea e posiziona il cursore dopo la formattazione
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, []);
  
  // Inserisce un'entità linkata nel testo
  const insertEntityLink = useCallback((entity: LinkedEntity) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // Troviamo l'inizio del tag @
    let tagStart = cursorPos;
    while (tagStart > 0 && text[tagStart - 1] !== '@') {
      tagStart--;
      if (tagStart > 0 && text[tagStart - 1] === '\n') break;
    }
    
    if (tagStart > 0) tagStart--; // Include il carattere @
    
    // Creiamo il nuovo link all'entità in formato Markdown
    const link = `[${entity.name}](${entity.type}://${entity.id})`;
    
    // Sostituisci @query con il link
    const newContent = 
      text.substring(0, tagStart) + 
      link + 
      text.substring(cursorPos);
    
    setContent(newContent);
    
    // Nascondi il menu delle entità
    setShowEntityMenu(false);
    
    // Ripristina il focus su textarea e posiziona il cursore dopo il link
    setTimeout(() => {
      textarea.focus();
      const newPosition = tagStart + link.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, []);

  // Parsa i link alle entità nel testo
  const parseEntityLinks = useCallback((text: string): string => {
    const entityLinkRegex = /\[(.*?)\]\((character|place|race|event):\/\/(.*?)\)/g;
    
    return text.replace(entityLinkRegex, (match, label, type, id) => {
      // Trova l'entità corrispondente
      const entity = linkedEntities.find(e => e.id === id && e.type === type);
      
      if (entity) {
        // Crea un elemento HTML per il link con attributi data per le informazioni sull'entità
        return `<a 
          href="#" 
          class="entity-link entity-${type}" 
          data-entity-id="${id}" 
          data-entity-type="${type}" 
          data-entity-name="${entity.name}"
          data-entity-desc="${entity.description || ''}"
          data-entity-img="${entity.imageUrl || ''}"
        >${label}</a>`;
      }
      
      // Se l'entità non viene trovata, mantieni il testo originale
      return label;
    });
  }, [linkedEntities]);
  
  // Applica la formattazione Markdown al testo
  const renderMarkdown = useCallback((markdown: string): string => {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Intestazioni
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    
    // Formattazione testo
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Blocco citazione
    html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
    
    // Liste non ordinate (approccio semplificato)
    const listLines = html.split('\n');
    let inList = false;
    let listHtml = '';
    
    listLines.forEach(line => {
      if (line.match(/^- (.*?)$/)) {
        if (!inList) {
          // Inizia una nuova lista
          listHtml += '<ul>';
          inList = true;
        }
        const itemContent = line.replace(/^- (.*?)$/, '$1');
        listHtml += `<li>${itemContent}</li>`;
      } else {
        if (inList) {
          // Chiudi la lista precedente
          listHtml += '</ul>';
          inList = false;
        }
        listHtml += line + '\n';
      }
    });
    
    // Chiudi l'ultima lista se necessario
    if (inList) {
      listHtml += '</ul>';
    }
    
    html = listHtml;
    
    // Gestione dei link alle entità
    html = parseEntityLinks(html);
    
    // Paragrafi (deve essere l'ultimo)
    html = html.replace(/^(?!<[a-z]).+/gm, '<p>$&</p>');
    
    return html;
  }, [parseEntityLinks]);
  
  // Controlla se un elemento è visibile nell'area visibile della pagina
  const isElementInViewport = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);
  
  // Trova entità per tipo e ID
  const findEntityById = useCallback((type: string, id: string): LinkedEntity | undefined => {
    return linkedEntities.find(entity => entity.type === type && entity.id === id);
  }, [linkedEntities]);
  
  return {
    // State
    content,
    setContent,
    wordCount,
    charCount,
    isFullscreen,
    isDarkTheme,
    showFormatMenu,
    formatMenuPosition,
    showEntityMenu,
    entityMenuPosition,
    entitySearchResults,
    cursorPosition,
    linkedEntities,
    
    // Refs
    editorRef,
    textareaRef,
    
    // Funzioni
    toggleFullscreen,
    toggleTheme,
    saveTemporaryContent,
    restoreTemporaryContent,
    handleSelectionChange,
    applyFormatting,
    insertEntityLink,
    renderMarkdown,
    isElementInViewport,
    findEntityById,
    
    // Funzioni interne
    setShowFormatMenu,
    setShowEntityMenu
  };
}