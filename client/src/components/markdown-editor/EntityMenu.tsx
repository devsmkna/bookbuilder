import React from "react";
import { LinkedEntity, EntitySearchResult } from "@/hooks/use-markdown-editor";
import { User, MapPin, Users, CalendarDays } from "lucide-react";

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
          <div className="py-3 px-4 text-center text-sm text-muted-foreground">
            Nessun risultato trovato
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