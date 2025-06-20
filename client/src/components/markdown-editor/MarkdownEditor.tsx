import React, { useEffect, useState, useRef } from "react";
import { useMarkdownEditor, LinkedEntity } from "@/hooks/use-markdown-editor";
import FormatMenu from "./FormatMenu";
import EntityMenu from "./EntityMenu";
import EntityTooltip from "./EntityTooltip";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { TextAnalyzer } from "@/components/TextAnalyzer";
import { TableOfContents } from "@/components/TableOfContents";
import { useGamificationContext } from "@/context/GamificationContext";
import { 
  Bold, 
  Italic, 
  Code, 
  Link2, 
  Heading1, 
  Heading2,
  Heading3,
  FileText, 
  Eye,
  List,
  ListOrdered,
  Underline,
  Strikethrough,
  Quote,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./editor-styles.css";

const MarkdownEditor: React.FC = () => {
  // Ottieni le funzioni dal contesto di gamification
  const { addWordCount, startWritingSession } = useGamificationContext();
  
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  
  // Function to scroll to a specific line in the textarea
  const scrollToLine = (lineNumber: number) => {
    if (!textareaRef.current) return;
    
    const lines = content.split('\n');
    if (lineNumber > lines.length) return;
    
    // Calculate character position for the line
    let charPosition = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      charPosition += lines[i].length + 1; // +1 for newline
    }
    
    // Set cursor position and scroll to it
    textareaRef.current.setSelectionRange(charPosition, charPosition);
    textareaRef.current.focus();
    
    // Scroll the line into view
    const lineHeight = 24; // Approximate line height
    const scrollTop = (lineNumber - 1) * lineHeight;
    textareaRef.current.scrollTop = scrollTop;
  };
  
  // Toggle Table of Contents visibility
  const toggleTableOfContents = () => {
    setShowTableOfContents(prev => !prev);
  };
  
  const {
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
    findEntityById,
    
    // Funzioni interne
    setShowFormatMenu,
    setShowEntityMenu
  } = useMarkdownEditor();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [showTextAnalyzer, setShowTextAnalyzer] = useState(false);
  const [, navigate] = useLocation();
  
  // Stato per il tooltip delle entità
  const [hoveredEntity, setHoveredEntity] = useState<LinkedEntity | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Rif per il contenitore dell'anteprima
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Gestisce i cambiamenti della textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const oldValue = content;
    
    // Inizializziamo la sessione di scrittura se necessario
    startWritingSession();
    
    // Calcola il numero di parole prima dell'aggiornamento
    const oldWordCount = wordCount || 0;
    
    // Aggiorna il contenuto
    setContent(newValue);
    
    // Il conteggio di parole viene aggiornato nell'hook useMarkdownEditor
    // Aspettiamo che il conteggio sia aggiornato nel prossimo ciclo di rendering
    setTimeout(() => {
      // Verifichiamo se sono state aggiunte parole
      if (wordCount > oldWordCount) {
        const wordsAdded = wordCount - oldWordCount;
        
        // Aggiorna il sistema di gamification con il numero di parole aggiunte
        addWordCount(wordsAdded);
      }
    }, 0);
  };
  
  // Gestisce i tasti speciali nella textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // ESC - chiude i menu
    if (e.key === "Escape") {
      setShowFormatMenu(false);
      setShowEntityMenu(false);
      return;
    }
    
    // Tab - indenta il testo
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Inserisce uno spazio di tabulazione
      const newContent = 
        content.substring(0, start) + 
        "  " + 
        content.substring(end);
      
      setContent(newContent);
      
      // Ripristina la posizione del cursore
      setTimeout(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }
    
    // Implementazione di shortcut comuni
    
    // Ctrl+B / Cmd+B per grassetto
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      applyFormatting('bold');
      return;
    }
    
    // Ctrl+I / Cmd+I per corsivo
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      applyFormatting('italic');
      return;
    }
    
    // Ctrl+U / Cmd+U per sottolineato
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      applyFormatting('underline');
      return;
    }
    
    // Ctrl+K / Cmd+K per codice
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      applyFormatting('code');
      return;
    }
    
    // Ctrl+S / Cmd+S per barrato
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      applyFormatting('strikethrough');
      return;
    }
    
    // Ctrl+Z / Cmd+Z per annullare (undo)
    // Ctrl+Y / Cmd+Y per ripristinare (redo)
    // Non implementati qui perché gestiti nativamente dal browser
    
    // Ctrl+X / Cmd+X per tagliare (cut)
    // Ctrl+C / Cmd+C per copiare (copy)
    // Ctrl+V / Cmd+V per incollare (paste)
    // Non implementati qui perché gestiti nativamente dal browser
    
    // Quando si digita [[, mostra il menu delle entità
    if (e.key === "[") {
      // Controlliamo se c'è già un [ precedente
      const selStart = e.currentTarget.selectionStart;
      if (selStart > 0 && e.currentTarget.value.charAt(selStart - 1) === '[') {
        // Il menu verrà mostrato tramite handleSelectionChange
      }
    }
  };
  
  // Gestisce il click sui link alle entità nell'anteprima
  const handleEntityLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    if (target.tagName === 'A' && target.classList.contains('entity-link')) {
      e.preventDefault();
      
      const entityId = target.getAttribute('data-entity-id');
      const entityType = target.getAttribute('data-entity-type');
      
      if (entityId && entityType) {
        // Salva il contenuto corrente prima di navigare
        saveTemporaryContent();
        
        // Naviga alla pagina appropriata in base al tipo di entità
        switch (entityType) {
          case "character":
            navigate("/character-creation");
            break;
          case "place":
            navigate("/world-building");
            break;
          case "race":
            navigate("/race-management");
            break;
          case "event":
            navigate("/storyboard-planner");
            break;
        }
      }
    }
  };
  
  // Gestisce il passaggio del mouse sui link delle entità
  const handleEntityLinkHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Per i vecchi link HTML delle entità
    if (target.tagName === 'A' && target.classList.contains('entity-link')) {
      const entityId = target.getAttribute('data-entity-id');
      const entityType = target.getAttribute('data-entity-type');
      
      if (entityId && entityType) {
        const entity = findEntityById(entityType, entityId);
        
        if (entity) {
          // Calcola la posizione del tooltip
          const rect = target.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
          
          setTooltipPosition({
            top: rect.bottom + scrollTop,
            left: rect.left + scrollLeft + (rect.width / 2)
          });
          
          setHoveredEntity(entity);
          setShowTooltip(true);
          return;
        }
      }
    } 
    
    // Per le nuove menzioni [[name|type:id]]
    const text = target.textContent || '';
    const mentionRegex = /\[\[([^\|]+)\|(character|place|race|event):([^\]]+)\]\]/;
    const match = text.match(mentionRegex);
    
    if (match) {
      const [fullMatch, name, type, id] = match;
      const entity = findEntityById(type, id);
      
      if (entity) {
        // Calcola la posizione del tooltip
        const rect = target.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        setTooltipPosition({
          top: rect.bottom + scrollTop,
          left: rect.left + scrollLeft + (rect.width / 2)
        });
        
        setHoveredEntity(entity);
        setShowTooltip(true);
        return;
      }
    }
    
    // Se arriviamo qui, non abbiamo trovato un'entità
    setShowTooltip(false);
  };
  
  // Gestisce click al di fuori dei menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Gestione del menu di formattazione
      if (showFormatMenu) {
        const formatMenuElement = document.querySelector('.format-menu');
        if (formatMenuElement && !formatMenuElement.contains(e.target as Node)) {
          setShowFormatMenu(false);
        }
      }
      
      // Gestione del menu delle entità
      if (showEntityMenu) {
        const entityMenuElement = document.querySelector('.entity-menu');
        if (entityMenuElement && !entityMenuElement.contains(e.target as Node)) {
          setShowEntityMenu(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showFormatMenu, showEntityMenu, setShowFormatMenu, setShowEntityMenu]);
  
  // Sincronizza lo scroll tra textarea e preview
  useEffect(() => {
    const syncScroll = () => {
      if (!textareaRef.current || !previewRef.current || !showMarkdownPreview) return;
      
      const textarea = textareaRef.current;
      const preview = previewRef.current;
      
      // Calcola la percentuale di scroll
      const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      
      // Applica la stessa percentuale alla preview
      preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    };
    
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => {
        textarea.removeEventListener('scroll', syncScroll);
      };
    }
  }, [textareaRef, previewRef, showMarkdownPreview]);
  
  // Ripristina il contenuto quando si torna all'editor
  useEffect(() => {
    restoreTemporaryContent();
  }, [restoreTemporaryContent]);
  
  // Traccia la sessione di scrittura per la gamification
  useEffect(() => {
    // Controlla se c'è una sessione di scrittura precedente
    const lastSessionDate = localStorage.getItem('last-writing-session');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Se è il primo accesso di oggi, incrementa sessionsCompleted
    if (lastSessionDate !== today) {
      // Aggiorna la data dell'ultima sessione
      localStorage.setItem('last-writing-session', today);
      
      // Aggiorna il conteggio delle sessioni di scrittura
      // Ma solo se abbiamo scritto effettivamente qualcosa
      if (wordCount > 0) {
        // Il sistema di gamification si occuperà di verificare gli achievement
        // Questo sarà fatto automaticamente grazie ai dati aggiornati in localStorage
      }
    }
  }, [wordCount]);
  
  // Gestisce lo scorrimento ai risultati di ricerca
  useEffect(() => {
    // Funzione per gestire l'evento di scorrimento ai risultati di ricerca
    const handleSearchResultScroll = (event: CustomEvent) => {
      if (!textareaRef.current) return;
      
      const { position, length } = event.detail;
      const textarea = textareaRef.current;
      
      // Imposta la posizione del cursore
      textarea.focus();
      textarea.setSelectionRange(position, position + length);
      
      // Scorre al testo selezionato
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight || '20');
      const textBeforeMatch = content.substring(0, position);
      const linesBefore = textBeforeMatch.split('\n').length - 1;
      
      // Calcola la posizione approssimativa di scorrimento
      const scrollPosition = linesBefore * lineHeight;
      textarea.scrollTop = scrollPosition - (textarea.clientHeight / 2);
    };
    
    // Aggiungi l'event listener per l'evento personalizzato
    window.addEventListener('search-result-scroll', handleSearchResultScroll as EventListener);
    
    return () => {
      window.removeEventListener('search-result-scroll', handleSearchResultScroll as EventListener);
    };
  }, [content, textareaRef]);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; 
      const newHeight = textarea.scrollHeight;
      textarea.style.height = `${newHeight}px`;
    }
  }, [content, textareaRef]);

  // Salva il contenuto HTML renderizzato nel localStorage per l'esportazione
  useEffect(() => {
    const renderedHtml = renderMarkdown(content);
    localStorage.setItem('editor-rendered-content', renderedHtml);
  }, [content, renderMarkdown]);
  
  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : ""
    )}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <Header
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenExportImport={() => window.dispatchEvent(new Event('open-export-import'))}
      />
      
      {/* Componente di analisi del testo */}
      <TextAnalyzer 
        text={content} 
        isVisible={showTextAnalyzer} 
        onToggle={() => setShowTextAnalyzer(!showTextAnalyzer)}
        editorRef={editorRef}
      />
      
      <main className="flex-1 overflow-auto" ref={editorRef}>
        <div className="container mx-auto max-w-5xl py-6">
          <div className="editor-container bg-card rounded-lg shadow-sm border overflow-hidden text-lg">
            {/* Toolbar dell'editor */}
            <div className="editor-toolbar p-2 border-b flex items-center justify-between sticky top-0 z-10 bg-card">
              <div className="format-buttons flex flex-wrap gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTextAnalyzer(!showTextAnalyzer)}
                  title="Analisi del testo"
                  className={showTextAnalyzer ? "bg-primary/20" : ""}
                >
                  <Lightbulb className={`h-4 w-4 ${showTextAnalyzer ? "text-primary" : ""}`} />
                </Button>
                <Separator orientation="vertical" className="h-8 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("bold")}
                  title="Grassetto (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("italic")}
                  title="Corsivo (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("underline")}
                  title="Sottolineato (Ctrl+U)"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("strikethrough")}
                  title="Barrato (Ctrl+S)"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("code")}
                  title="Codice (Ctrl+K)"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("h1")}
                  title="Titolo 1"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("h2")}
                  title="Titolo 2"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("h3")}
                  title="Titolo 3"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("unordered-list")}
                  title="Elenco puntato"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("ordered-list")}
                  title="Elenco numerato"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (textareaRef.current) {
                      const textarea = textareaRef.current;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newText = content.substring(0, start) + "–" + content.substring(end);
                      setContent(newText);
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                      }, 0);
                    }
                  }}
                  title="En dash"
                >
                  <span className="text-xs font-bold">–</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (textareaRef.current) {
                      const textarea = textareaRef.current;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newText = content.substring(0, start) + "—" + content.substring(end);
                      setContent(newText);
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                      }, 0);
                    }
                  }}
                  title="Em dash"
                >
                  <span className="text-xs font-bold">—</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (textareaRef.current) {
                      const textarea = textareaRef.current;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = content.substring(start, end);
                      
                      let newText;
                      if (start !== end) {
                        // Se c'è una selezione, la racchiude tra virgolette
                        newText = content.substring(0, start) + '«' + selectedText + '»' + content.substring(end);
                        textarea.focus();
                        setTimeout(() => {
                          textarea.setSelectionRange(start + selectedText.length + 2, start + selectedText.length + 2);
                        }, 0);
                      } else {
                        // Altrimenti inserisce solo le virgolette
                        newText = content.substring(0, start) + '«»' + content.substring(end);
                        textarea.focus();
                        setTimeout(() => {
                          textarea.setSelectionRange(start + 1, start + 1);
                        }, 0);
                      }
                      
                      setContent(newText);
                    }
                  }}
                  title="Guillemet"
                >
                  <span className="text-xs font-bold">«»</span>
                </Button>
                <Separator orientation="vertical" className="h-8 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  title="Inserisci [[menzione]] per linkare personaggi, luoghi o razze"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="ml-1 text-xs">[[menzione]]</span>
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                title={showMarkdownPreview ? "Mostra editor" : "Mostra anteprima"}
              >
                {showMarkdownPreview ? (
                  <>
                    <FileText className="h-4 w-4 mr-1" />
                    <span className="text-xs">Editor</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="text-xs">Anteprima</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Container flessibile per editor e preview */}
            <div className={cn(
              "editor-content-container relative py-10 px-24",
              showMarkdownPreview ? "flex" : "block"
            )}>
              {/* Textarea per l'editor Markdown */}
              <div className={cn(
                "markdown-textarea-container", 
                showMarkdownPreview ? "hidden" : "w-full"
              )}>
                <textarea
                  ref={textareaRef}
                  className={cn(
                    "w-full min-h-[70vh] p-4 outline-none bg-card",
                    showMarkdownPreview ? "border-r" : ""
                  )}
                  value={content}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onSelect={handleSelectionChange}
                  placeholder="Inizia a scrivere qui... Usa Markdown per la formattazione e [[nome|tipo:id]] per menzionare entità"
                  spellCheck="false"
                ></textarea>
              </div>
              
              {/* Preview dell'HTML renderizzato */}
              {showMarkdownPreview && (
                <div 
                  lang="it-IT"
                  ref={previewRef}
                  className="markdown-preview w-full min-h-[70vh] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  onClick={handleEntityLinkClick}
                  onMouseOver={handleEntityLinkHover}
                  onMouseOut={() => setShowTooltip(false)}
                ></div>
              )}
              
              {/* Menu di formattazione contestuale */}
              <FormatMenu 
                show={showFormatMenu} 
                position={formatMenuPosition} 
                onFormat={applyFormatting} 
              />
              
              {/* Menu entità al digitare @ */}
              <EntityMenu 
                show={showEntityMenu} 
                position={entityMenuPosition} 
                searchResults={entitySearchResults} 
                onSelect={insertEntityLink} 
              />
              
              {/* Tooltip per i link entità */}
              <EntityTooltip 
                entity={hoveredEntity} 
                position={tooltipPosition} 
                show={showTooltip} 
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Table of Contents */}
      <TableOfContents
        content={content}
        isVisible={showTableOfContents}
        onToggle={toggleTableOfContents}
        onHeadingClick={scrollToLine}
      />
      
      <Footer wordCount={wordCount} charCount={charCount} />
    </div>
  );
};

export default MarkdownEditor;