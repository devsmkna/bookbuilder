import React, { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight, FileText, User, Map, Users, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Tipi delle entità per la ricerca
interface SearchResult {
  id: string;
  name: string;
  type: "character" | "place" | "race" | "event" | "document";
  description?: string;
  content?: string;
  context?: string; // Testo che contiene la query di ricerca
  match?: {
    start: number;
    end: number;
  };
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (result: SearchResult) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Effetto per il focus all'apertura
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Gestisce ricerca quando la query cambia
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Effetto per la navigazione con tastiera
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[activeIndex]) {
            onNavigate(results[activeIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, activeIndex, onNavigate, onClose]);

  // Effetto per scrollare al risultato attivo
  useEffect(() => {
    if (resultsContainerRef.current && results.length > 0) {
      const activeElement = resultsContainerRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      );
      
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    }
  }, [activeIndex, results]);

  // Funzione di ricerca
  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    try {
      // Recupera tutte le entità dal localStorage
      // Personaggi
      const charactersData = localStorage.getItem("characters");
      const characters = charactersData ? JSON.parse(charactersData) : [];
      
      // Luoghi
      const mapsData = localStorage.getItem("maps");
      const maps = mapsData ? JSON.parse(mapsData) : [];
      let places: any[] = [];
      maps.forEach((map: any) => {
        if (map.places && Array.isArray(map.places)) {
          places = [...places, ...map.places];
        }
      });
      
      // Razze
      const racesData = localStorage.getItem("races");
      const races = racesData ? JSON.parse(racesData) : [];
      
      // Eventi
      const eventsData = localStorage.getItem("events");
      const events = eventsData ? JSON.parse(eventsData) : [];
      
      // Contenuto dell'editor corrente
      const editorContent = localStorage.getItem("editor_content") || "";
      
      // Crea un array di risultati
      const searchResults: SearchResult[] = [];
      
      // Cerca nei personaggi
      characters.forEach((character: any) => {
        const characterText = JSON.stringify(character).toLowerCase();
        if (characterText.includes(searchQuery.toLowerCase())) {
          // Trova la proprietà specifica dove è stata trovata la corrispondenza
          let context = "";
          let match = { start: 0, end: 0 };
          
          Object.entries(character).forEach(([key, value]: [string, any]) => {
            if (typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase())) {
              const lowerValue = value.toLowerCase();
              const matchIndex = lowerValue.indexOf(searchQuery.toLowerCase());
              
              if (matchIndex !== -1) {
                // Estratto di testo attorno alla corrispondenza
                const start = Math.max(0, matchIndex - 30);
                const end = Math.min(lowerValue.length, matchIndex + searchQuery.length + 30);
                context = `${key}: ${value.substring(start, matchIndex)}[${value.substring(matchIndex, matchIndex + searchQuery.length)}]${value.substring(matchIndex + searchQuery.length, end)}...`;
                match = {
                  start: matchIndex,
                  end: matchIndex + searchQuery.length
                };
              }
            }
          });
          
          searchResults.push({
            id: character.id || String(Math.random()),
            name: character.name || "Personaggio senza nome",
            type: "character",
            description: `${character.age ? character.age + " anni" : ""} ${character.race || ""}`.trim(),
            context,
            match
          });
        }
      });
      
      // Cerca nei luoghi
      places.forEach((place: any) => {
        const placeText = JSON.stringify(place).toLowerCase();
        if (placeText.includes(searchQuery.toLowerCase())) {
          // Trova la proprietà specifica
          let context = "";
          let match = { start: 0, end: 0 };
          
          Object.entries(place).forEach(([key, value]: [string, any]) => {
            if (typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase())) {
              const lowerValue = value.toLowerCase();
              const matchIndex = lowerValue.indexOf(searchQuery.toLowerCase());
              
              if (matchIndex !== -1) {
                const start = Math.max(0, matchIndex - 30);
                const end = Math.min(lowerValue.length, matchIndex + searchQuery.length + 30);
                context = `${key}: ${value.substring(start, matchIndex)}[${value.substring(matchIndex, matchIndex + searchQuery.length)}]${value.substring(matchIndex + searchQuery.length, end)}...`;
                match = {
                  start: matchIndex,
                  end: matchIndex + searchQuery.length
                };
              }
            }
          });
          
          searchResults.push({
            id: place.id || String(Math.random()),
            name: place.name || "Luogo senza nome",
            type: "place",
            description: place.type || "",
            context,
            match
          });
        }
      });
      
      // Cerca nelle razze
      races.forEach((race: any) => {
        const raceText = JSON.stringify(race).toLowerCase();
        if (raceText.includes(searchQuery.toLowerCase())) {
          // Trova la proprietà specifica
          let context = "";
          let match = { start: 0, end: 0 };
          
          Object.entries(race).forEach(([key, value]: [string, any]) => {
            if (typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase())) {
              const lowerValue = value.toLowerCase();
              const matchIndex = lowerValue.indexOf(searchQuery.toLowerCase());
              
              if (matchIndex !== -1) {
                const start = Math.max(0, matchIndex - 30);
                const end = Math.min(lowerValue.length, matchIndex + searchQuery.length + 30);
                context = `${key}: ${value.substring(start, matchIndex)}[${value.substring(matchIndex, matchIndex + searchQuery.length)}]${value.substring(matchIndex + searchQuery.length, end)}...`;
                match = {
                  start: matchIndex,
                  end: matchIndex + searchQuery.length
                };
              }
            }
          });
          
          searchResults.push({
            id: race.id || String(Math.random()),
            name: race.name || "Razza senza nome",
            type: "race",
            context,
            match
          });
        }
      });
      
      // Cerca negli eventi
      events.forEach((event: any) => {
        const eventText = JSON.stringify(event).toLowerCase();
        if (eventText.includes(searchQuery.toLowerCase())) {
          // Trova la proprietà specifica
          let context = "";
          let match = { start: 0, end: 0 };
          
          Object.entries(event).forEach(([key, value]: [string, any]) => {
            if (typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase())) {
              const lowerValue = value.toLowerCase();
              const matchIndex = lowerValue.indexOf(searchQuery.toLowerCase());
              
              if (matchIndex !== -1) {
                const start = Math.max(0, matchIndex - 30);
                const end = Math.min(lowerValue.length, matchIndex + searchQuery.length + 30);
                context = `${key}: ${value.substring(start, matchIndex)}[${value.substring(matchIndex, matchIndex + searchQuery.length)}]${value.substring(matchIndex + searchQuery.length, end)}...`;
                match = {
                  start: matchIndex,
                  end: matchIndex + searchQuery.length
                };
              }
            }
          });
          
          searchResults.push({
            id: event.id || String(Math.random()),
            name: event.title || "Evento senza nome",
            type: "event",
            description: event.type || "",
            context,
            match
          });
        }
      });
      
      // Cerca nel contenuto dell'editor
      if (editorContent.toLowerCase().includes(searchQuery.toLowerCase())) {
        const editorContentLower = editorContent.toLowerCase();
        let lastIndex = 0;
        let count = 0;
        
        while (lastIndex !== -1 && count < 5) { // Limita a 5 risultati nell'editor
          const matchIndex = editorContentLower.indexOf(searchQuery.toLowerCase(), lastIndex);
          
          if (matchIndex === -1) break;
          
          // Estratto di testo attorno alla corrispondenza
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(editorContentLower.length, matchIndex + searchQuery.length + 30);
          const context = `${editorContent.substring(start, matchIndex)}[${editorContent.substring(matchIndex, matchIndex + searchQuery.length)}]${editorContent.substring(matchIndex + searchQuery.length, end)}...`;
          
          searchResults.push({
            id: `editor-${count}`,
            name: "Documento corrente",
            type: "document",
            description: `Corrispondenza ${count + 1}`,
            context,
            match: {
              start: matchIndex,
              end: matchIndex + searchQuery.length
            }
          });
          
          lastIndex = matchIndex + searchQuery.length;
          count++;
        }
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error("Errore durante la ricerca:", error);
      setResults([]);
    }
    
    setLoading(false);
  };

  // Restituisce l'icona appropriata per il tipo di risultato
  const getResultIcon = (type: string) => {
    switch (type) {
      case "character":
        return <User className="h-4 w-4 text-blue-500" />;
      case "place":
        return <Map className="h-4 w-4 text-green-500" />;
      case "race":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Restituisce la label del tipo di risultato
  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "character":
        return "Personaggio";
      case "place":
        return "Luogo";
      case "race":
        return "Razza";
      case "event":
        return "Evento";
      case "document":
        return "Documento";
      default:
        return "Altro";
    }
  };

  // Evidenzia la query nei risultati
  const highlightQuery = (text: string) => {
    if (!query || !text) return text;

    // Sostituzione temporanea per i marcatori
    text = text.replace(/\[/g, "[[OPEN]]").replace(/\]/g, "[[CLOSE]]");
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => {
          // Ripristino dei marcatori originali
          part = part.replace(/\[\[OPEN\]\]/g, "[").replace(/\[\[CLOSE\]\]/g, "]");
          
          // Applico evidenziazione solo alle parti che corrispondono esattamente alla query
          if (part.toLowerCase() === query.toLowerCase()) {
            return <span key={i} className="bg-yellow-200 text-black font-medium rounded-sm px-0.5">{part}</span>;
          }
          
          // Per le parti con marcatori manuali, gestiamo separatamente
          if (part.includes("[") && part.includes("]")) {
            const highlightStart = part.indexOf("[");
            const highlightEnd = part.indexOf("]") + 1;
            
            if (highlightStart > -1 && highlightEnd > highlightStart) {
              const before = part.substring(0, highlightStart);
              const highlighted = part.substring(highlightStart + 1, highlightEnd - 1);
              const after = part.substring(highlightEnd);
              
              return (
                <React.Fragment key={i}>
                  {before}
                  <span className="bg-yellow-200 text-black font-medium rounded-sm px-0.5">{highlighted}</span>
                  {after}
                </React.Fragment>
              );
            }
          }
          
          return part;
        })}
      </>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-hidden border"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra di ricerca */}
            <div className="flex items-center px-4 py-3 border-b">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca in tutti i documenti e le entità..."
                className="flex-1 bg-transparent border-none outline-none text-lg"
                autoComplete="off"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Area risultati */}
            <div 
              ref={resultsContainerRef}
              className="max-h-[60vh] overflow-y-auto"
            >
              {/* Stato di caricamento */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-muted-foreground">Ricerca in corso...</span>
                </div>
              )}
              
              {/* Nessun risultato */}
              {!loading && query.trim().length > 1 && results.length === 0 && (
                <div className="py-8 px-4 text-center text-muted-foreground">
                  Nessun risultato trovato per "{query}"
                </div>
              )}
              
              {/* Placeholder per query vuota */}
              {!loading && query.trim().length <= 1 && (
                <div className="py-8 px-4 text-center text-muted-foreground">
                  Inserisci almeno 2 caratteri per cercare
                </div>
              )}
              
              {/* Lista risultati */}
              {!loading && results.length > 0 && (
                <div className="divide-y">
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      data-index={index}
                      className={cn(
                        "px-4 py-3 cursor-pointer flex items-start transition-colors",
                        activeIndex === index ? "bg-muted" : "hover:bg-muted/50"
                      )}
                      onClick={() => onNavigate(result)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div className="mr-3 mt-1">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="font-medium mr-2 truncate">{result.name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted-foreground/20 text-muted-foreground">
                            {getResultTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                        )}
                        {result.context && (
                          <p className="text-sm mt-1 line-clamp-2">
                            {highlightQuery(result.context)}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-2 mt-2 opacity-70" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer con consigli */}
            <div className="px-4 py-3 bg-muted/50 text-xs text-muted-foreground border-t">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">↑↓</span> per navigare &nbsp;•&nbsp; 
                  <span className="font-medium">Invio</span> per selezionare &nbsp;•&nbsp; 
                  <span className="font-medium">Esc</span> per chiudere
                </div>
                <div>{results.length > 0 ? `${results.length} risultati` : ''}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;