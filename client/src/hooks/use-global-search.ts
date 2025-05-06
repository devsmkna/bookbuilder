import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';

// Tipo per i risultati di ricerca
export interface SearchResult {
  id: string;
  name: string;
  type: "character" | "place" | "race" | "event" | "document";
  description?: string;
  content?: string;
  context?: string;
  match?: {
    start: number;
    end: number;
  };
}

export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  
  // Apre la barra di ricerca globale
  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  // Chiude la barra di ricerca globale
  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  // Funzione per navigare ai risultati
  const handleNavigateToResult = useCallback((result: SearchResult) => {
    // Salva i dati temporanei se necessario
    const saveTemporaryContent = () => {
      const editorContent = localStorage.getItem("editor_content");
      if (editorContent) {
        localStorage.setItem("editor_temp_content", editorContent);
      }
    };
    
    // Chiudi il modal di ricerca
    closeSearch();
    
    // Gestisci la navigazione in base al tipo di risultato
    switch (result.type) {
      case "character":
        saveTemporaryContent();
        navigate("/character-creation", { replace: true });
        
        // Imposta l'ID del personaggio corrente se necessario
        if (result.id) {
          localStorage.setItem("current_character_id", result.id);
        }
        break;
        
      case "place":
        saveTemporaryContent();
        navigate("/world-building", { replace: true });
        
        // Imposta l'ID del luogo corrente se necessario
        if (result.id) {
          localStorage.setItem("current_place_id", result.id);
        }
        break;
        
      case "race":
        saveTemporaryContent();
        navigate("/race-management", { replace: true });
        
        // Imposta l'ID della razza corrente se necessario
        if (result.id) {
          localStorage.setItem("current_race_id", result.id);
        }
        break;
        
      case "event":
        saveTemporaryContent();
        navigate("/storyboard-planner", { replace: true });
        
        // Imposta l'ID dell'evento corrente se necessario
        if (result.id) {
          localStorage.setItem("current_event_id", result.id);
        }
        break;
        
      case "document":
        // Attualmente non navighiamo a documenti specifici
        // Per il documento corrente, potremmo evidenziare la corrispondenza
        if (result.match) {
          // Potremmo impostare un evento personalizzato per far scorrere l'editor
          // alla posizione corrispondente
          const searchScrollEvent = new CustomEvent('search-result-scroll', {
            detail: {
              position: result.match.start,
              length: result.match.end - result.match.start
            }
          });
          window.dispatchEvent(searchScrollEvent);
        }
        break;
    }
  }, [navigate, closeSearch]);
  
  // Gestisce shortcut da tastiera (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F o Cmd+F (Mac) apre la ricerca globale
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault(); // Impedisce la ricerca nativa del browser
        openSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);
  
  return {
    isOpen,
    openSearch,
    closeSearch,
    handleNavigateToResult
  };
}