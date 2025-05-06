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
      
      console.log("Caricamento entità in corso...");
      
      // Carica i personaggi
      try {
        const savedCharacters = localStorage.getItem('characters');
        console.log("Characters localStorage:", savedCharacters);
        if (savedCharacters) {
          const characters = JSON.parse(savedCharacters);
          console.log("Personaggi trovati:", characters.length);
          const mappedCharacters = characters.map((char: any) => ({
            id: char.id,
            name: char.name || "Unnamed Character",
            type: 'character' as const,
            description: `${char.race || ""} ${char.age ? `(${char.age})` : ""}`.trim(),
            imageUrl: char.imageData || ""
          }));
          entities = [...entities, ...mappedCharacters];
          console.log("Personaggi aggiunti:", mappedCharacters.length);
        }
      } catch (e) {
        console.error('Failed to load characters:', e);
      }
      
      // Carica i luoghi da worldMaps
      try {
        const savedMaps = localStorage.getItem('worldMaps');
        console.log("Maps localStorage:", savedMaps ? "Presente" : "Assente");
        if (savedMaps) {
          const maps = JSON.parse(savedMaps);
          // Estrai tutti i luoghi da tutte le mappe
          let allPlaces: any[] = [];
          maps.forEach((map: any) => {
            if (map.places && Array.isArray(map.places)) {
              allPlaces = allPlaces.concat(map.places);
            }
          });
          
          console.log("Luoghi trovati:", allPlaces.length);
          const mappedPlaces = allPlaces.map((place: any) => ({
            id: place.id,
            name: place.name || "Unnamed Place",
            type: 'place' as const,
            description: place.type || "",
            imageUrl: place.images?.[0] || ""
          }));
          entities = [...entities, ...mappedPlaces];
          console.log("Luoghi aggiunti:", mappedPlaces.length);
        }
      } catch (e) {
        console.error('Failed to load places:', e);
      }
      
      // Carica le razze
      try {
        const savedRaces = localStorage.getItem('book-builder-races');
        console.log("Races localStorage:", savedRaces ? "Presente" : "Assente");
        if (savedRaces) {
          const races = JSON.parse(savedRaces);
          console.log("Razze trovate:", races.length);
          const mappedRaces = races.map((race: any) => ({
            id: race.id,
            name: race.name || "Unnamed Race",
            type: 'race' as const,
            description: race.traits || "",
            imageUrl: race.imageData || ""
          }));
          entities = [...entities, ...mappedRaces];
          console.log("Razze aggiunte:", mappedRaces.length);
        }
      } catch (e) {
        console.error('Failed to load races:', e);
      }
      
      // Carica gli eventi
      try {
        const savedEvents = localStorage.getItem('book-builder-storyboard');
        console.log("Events localStorage:", savedEvents ? "Presente" : "Assente");
        if (savedEvents) {
          const events = JSON.parse(savedEvents);
          console.log("Eventi trovati:", events.length);
          const mappedEvents = events.map((event: any) => ({
            id: event.id,
            name: event.title || "Unnamed Event",
            type: 'event' as const,
            description: event.description || "",
          }));
          entities = [...entities, ...mappedEvents];
          console.log("Eventi aggiunti:", mappedEvents.length);
        }
      } catch (e) {
        console.error('Failed to load events:', e);
      }
      
      // Log per debug
      console.log("Totale entità caricate:", entities.length);
      console.log("Entità caricate:", entities);
      
      // Aggiorna lo stato solo se ci sono effettivamente delle entità
      setLinkedEntities([...entities]);
      
      // Precarica anche il risultato della ricerca vuota con tutte le entità
      setEntitySearchResults({
        entities: [...entities],
        query: ""
      });
    };
    
    // Carica le entità al primo render
    loadEntities();
    
    // Crea un intervallo per ricaricare le entità periodicamente
    // Questo è utile perché l'evento 'storage' potrebbe non essere affidabile
    // tra componenti della stessa pagina
    const interval = setInterval(() => {
      loadEntities();
    }, 3000);
    
    // Aggiungi anche un event listener per aggiornare le entità quando localStorage cambia
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'characters' || 
          e.key === 'worldMaps' || 
          e.key === 'book-builder-races' || 
          e.key === 'book-builder-storyboard') {
        loadEntities();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
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
  
  // Salva il contenuto dell'editor
  const saveTemporaryContent = useCallback(() => {
    // Salviamo il contenuto in localStorage così persiste tra le navigazioni
    localStorage.setItem('editor-content', content);
  }, [content]);
  
  // Ripristina il contenuto temporaneo
  const restoreTemporaryContent = useCallback(() => {
    // Carica il contenuto da localStorage
    const savedContent = localStorage.getItem('editor-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, [setContent]);
  
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
    console.log("Ricerca entità con query:", query);
    console.log("Entità disponibili per la ricerca:", linkedEntities);
    
    if (!query || query.trim() === "") {
      // Se non c'è query, mostra tutte le entità disponibili
      console.log("Mostro tutte le entità:", linkedEntities);
      
      // Assicuriamoci di aggiornare effettivamente lo stato con le entità caricate
      setEntitySearchResults({ 
        entities: [...linkedEntities], // Creiamo una copia dell'array per assicurarci che React rilevi il cambiamento
        query: "" 
      });
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    const filteredEntities = linkedEntities.filter(
      entity => entity.name.toLowerCase().includes(lowerCaseQuery)
    );
    
    console.log("Entità filtrate:", filteredEntities);
    
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
      case "underline":
        formattedText = `<u>${selectedText}</u>`;
        break;
      case "strikethrough":
        formattedText = `~~${selectedText}~~`;
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
      case "unordered-list":
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case "ordered-list":
        formattedText = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
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
  }, [setShowFormatMenu]);
  
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
    
    // Creiamo una sintassi wiki-style come Obsidian
    // Format: [[entity.name|type:id]]
    const mention = `[[${entity.name}|${entity.type}:${entity.id}]]`;
    
    // Sostituisci @query con la menzione
    const newContent = 
      text.substring(0, tagStart) + 
      mention + 
      text.substring(cursorPos);
    
    setContent(newContent);
    
    // Nascondi il menu delle entità
    setShowEntityMenu(false);
    
    // Ripristina il focus su textarea e posiziona il cursore dopo la menzione
    setTimeout(() => {
      textarea.focus();
      const newPosition = tagStart + mention.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, []);

  // Parsa i link alle entità nel testo
  const parseEntityLinks = useCallback((text: string): string => {
    // Supporta il vecchio formato dei link per compatibilità
    const oldEntityLinkRegex = /\[(.*?)\]\((character|place|race|event):\/\/(.*?)\)/g;
    
    text = text.replace(oldEntityLinkRegex, (match, label, type, id) => {
      // Trova l'entità corrispondente
      const entity = linkedEntities.find(e => e.id === id && e.type === type);
      
      if (entity) {
        // Nell'anteprima, mostra solo il nome dell'entità
        return label;
      }
      
      return label;
    });
    
    // Supporta il nuovo formato wiki-style [[name|type:id]]
    const newEntityMentionRegex = /\[\[([^\|]+)\|(character|place|race|event):([^\]]+)\]\]/g;
    
    return text.replace(newEntityMentionRegex, (match, name, type, id) => {
      // Trova l'entità corrispondente
      const entity = linkedEntities.find(e => e.id === id && e.type === type);
      
      if (entity) {
        // Nell'anteprima, mostra solo il nome dell'entità
        return name;
      }
      
      return name;
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
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    // Il tag <u> è già supportato in HTML
    
    // Blocco citazione
    html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
    
    // Liste non ordinate
    const unorderedListLines = html.split('\n');
    let inUnorderedList = false;
    let unorderedListHtml = '';
    
    unorderedListLines.forEach(line => {
      if (line.match(/^- (.*?)$/)) {
        if (!inUnorderedList) {
          // Inizia una nuova lista
          unorderedListHtml += '<ul>';
          inUnorderedList = true;
        }
        const itemContent = line.replace(/^- (.*?)$/, '$1');
        unorderedListHtml += `<li>${itemContent}</li>`;
      } else {
        if (inUnorderedList) {
          // Chiudi la lista precedente
          unorderedListHtml += '</ul>';
          inUnorderedList = false;
        }
        unorderedListHtml += line + '\n';
      }
    });
    
    // Chiudi l'ultima lista non ordinata se necessario
    if (inUnorderedList) {
      unorderedListHtml += '</ul>';
    }
    
    html = unorderedListHtml;
    
    // Liste ordinate
    const orderedListLines = html.split('\n');
    let inOrderedList = false;
    let orderedListHtml = '';
    
    orderedListLines.forEach(line => {
      if (line.match(/^\d+\. (.*?)$/)) {
        if (!inOrderedList) {
          // Inizia una nuova lista ordinata
          orderedListHtml += '<ol>';
          inOrderedList = true;
        }
        const itemContent = line.replace(/^\d+\. (.*?)$/, '$1');
        orderedListHtml += `<li>${itemContent}</li>`;
      } else {
        if (inOrderedList) {
          // Chiudi la lista ordinata precedente
          orderedListHtml += '</ol>';
          inOrderedList = false;
        }
        orderedListHtml += line + '\n';
      }
    });
    
    // Chiudi l'ultima lista ordinata se necessario
    if (inOrderedList) {
      orderedListHtml += '</ol>';
    }
    
    html = orderedListHtml;
    
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