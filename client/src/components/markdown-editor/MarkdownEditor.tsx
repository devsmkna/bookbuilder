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
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./editor-styles.css";

const MarkdownEditor: React.FC = () => {
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
    setContent(newValue);
    
    // Aggiorna il conteggio delle parole e dei caratteri
    const text = newValue || '';
    const wordMatches = text.match(/\S+/g);
    setWordCount(wordMatches ? wordMatches.length : 0);
    setCharCount(text.length);
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
    
    // Quando @ è premuto, mostra il menu delle entità
    if (e.key === "@") {
      // Il menu verrà mostrato tramite handleSelectionChange
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
    
    // Per le nuove menzioni @name{type:id}
    const text = target.textContent || '';
    const mentionRegex = /@([^{]+){(character|place|race|event):([^}]+)}/;
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
      />
      
      <main className="flex-1 overflow-auto" ref={editorRef}>
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="editor-container bg-card rounded-lg shadow-sm border overflow-hidden">
            {/* Toolbar dell'editor */}
            <div className="editor-toolbar p-2 border-b flex items-center justify-between">
              <div className="format-buttons flex flex-wrap gap-1">
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
                  title="Sottolineato"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("strikethrough")}
                  title="Barrato"
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
                  title="Inserisci @menzione per linkare personaggi, luoghi o razze"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="ml-1 text-xs">@menzione</span>
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
              "editor-content-container relative",
              showMarkdownPreview ? "flex" : "block"
            )}>
              {/* Textarea per l'editor Markdown */}
              <div className={cn(
                "markdown-textarea-container", 
                showMarkdownPreview ? "w-1/2" : "w-full"
              )}>
                <textarea
                  ref={textareaRef}
                  className={cn(
                    "w-full min-h-[70vh] p-4 font-mono text-sm resize-none outline-none bg-card",
                    showMarkdownPreview ? "border-r" : ""
                  )}
                  value={content}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onSelect={handleSelectionChange}
                  placeholder="Inizia a scrivere qui... Usa Markdown per la formattazione e @ per menzionare entità"
                  spellCheck="false"
                ></textarea>
              </div>
              
              {/* Preview dell'HTML renderizzato */}
              {showMarkdownPreview && (
                <div 
                  ref={previewRef}
                  className="markdown-preview w-1/2 min-h-[70vh] p-4 overflow-auto"
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
      
      <Footer wordCount={wordCount} charCount={charCount} />
    </div>
  );
};

export default MarkdownEditor;