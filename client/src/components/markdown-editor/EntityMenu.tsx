import React from "react";
import { LinkedEntity, EntitySearchResult } from "@/hooks/use-markdown-editor";
import { User, MapPin, Users, CalendarDays } from "lucide-react";
import { useLocation } from "wouter";

interface EntityMenuProps {
  show: boolean;
  position: { top: number; left: number };
  searchResults: EntitySearchResult;
  onSelect: (entity: LinkedEntity) => void;
}

const EntityMenu: React.FC<EntityMenuProps> = ({
  show,
  position,
  searchResults,
  onSelect
}) => {
  if (!show) return null;
  
  const [, navigate] = useLocation();
  const { entities, query } = searchResults;
  
  // Raggruppa le entità per tipo
  const groupedEntities = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) {
      acc[entity.type] = [];
    }
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, LinkedEntity[]>);
  
  // Determina l'icona in base al tipo di entità
  const getEntityIcon = (type: string) => {
    switch (type) {
      case "character":
        return <User className="h-4 w-4 text-blue-500" />;
      case "place":
        return <MapPin className="h-4 w-4 text-green-500" />;
      case "race":
        return <Users className="h-4 w-4 text-amber-500" />;
      case "event":
        return <CalendarDays className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };
  
  // Ottiene il titolo localizzato per ciascun tipo
  const getTypeTitle = (type: string) => {
    switch (type) {
      case "character":
        return "Personaggi";
      case "place":
        return "Luoghi";
      case "race":
        return "Razze";
      case "event":
        return "Eventi";
      default:
        return type;
    }
  };
  
  return (
    <div
      className="entity-menu absolute z-50 bg-card border rounded-md shadow-lg overflow-hidden w-72"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="entity-search-header p-2 border-b bg-muted/30">
        <div className="text-sm font-medium">
          Ricerca di: <span className="font-bold">{query || "tutti"}</span>
        </div>
      </div>
      
      <div className="entity-list max-h-64 overflow-y-auto p-1">
        {Object.keys(groupedEntities).length === 0 ? (
          <div className="py-3 px-4 text-center text-sm">
            <p className="text-muted-foreground mb-2">
              Nessun risultato trovato. Prima crea dei personaggi, luoghi, razze o eventi.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <a 
                href="/character-creation" 
                className="px-2 py-1 text-xs bg-blue-500/10 text-blue-500 rounded-sm hover:bg-blue-500/20 flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  // Salva il contenuto editor prima di navigare
                  localStorage.setItem('editor-content', localStorage.getItem('editor-content') || '');
                  navigate("/character-creation");
                }}
              >
                <User className="h-3 w-3 mr-1" />
                Personaggio
              </a>
              <a 
                href="/world-building" 
                className="px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded-sm hover:bg-green-500/20 flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('editor-content', localStorage.getItem('editor-content') || '');
                  navigate("/world-building");
                }}
              >
                <MapPin className="h-3 w-3 mr-1" />
                Luogo
              </a>
              <a 
                href="/race-management" 
                className="px-2 py-1 text-xs bg-amber-500/10 text-amber-500 rounded-sm hover:bg-amber-500/20 flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('editor-content', localStorage.getItem('editor-content') || '');
                  navigate("/race-management");
                }}
              >
                <Users className="h-3 w-3 mr-1" />
                Razza
              </a>
              <a 
                href="/storyboard-planner" 
                className="px-2 py-1 text-xs bg-purple-500/10 text-purple-500 rounded-sm hover:bg-purple-500/20 flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('editor-content', localStorage.getItem('editor-content') || '');
                  navigate("/storyboard-planner");
                }}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                Evento
              </a>
            </div>
          </div>
        ) : (
          Object.entries(groupedEntities).map(([type, entities]) => (
            <div key={type} className="entity-group mb-2">
              <div className="entity-type-header px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                {getTypeTitle(type)} ({entities.length})
              </div>
              
              {entities.map(entity => (
                <div
                  key={entity.id}
                  className="entity-item px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded cursor-pointer flex items-center"
                  onClick={() => onSelect(entity)}
                >
                  <span className="entity-icon mr-2">
                    {getEntityIcon(entity.type)}
                  </span>
                  <span className="entity-name font-medium">{entity.name}</span>
                  {entity.description && (
                    <span className="entity-description ml-2 text-xs text-muted-foreground">
                      {entity.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      <div className="entity-menu-footer px-2 py-1.5 text-xs text-muted-foreground border-t">
        Seleziona o premi ESC per chiudere
      </div>
    </div>
  );
};

export default EntityMenu;