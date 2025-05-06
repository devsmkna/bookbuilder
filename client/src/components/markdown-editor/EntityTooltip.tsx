import React from "react";
import { LinkedEntity } from "@/hooks/use-markdown-editor";
import { User, MapPin, Users, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityTooltipProps {
  entity: LinkedEntity | null;
  position: { top: number; left: number };
  show: boolean;
}

const EntityTooltip: React.FC<EntityTooltipProps> = ({ entity, position, show }) => {
  if (!show || !entity) return null;
  
  const getEntityIcon = () => {
    switch (entity.type) {
      case "character":
        return <User className="h-5 w-5 text-blue-500" />;
      case "place":
        return <MapPin className="h-5 w-5 text-green-500" />;
      case "race":
        return <Users className="h-5 w-5 text-amber-500" />;
      case "event":
        return <CalendarDays className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };
  
  const getEntityTypeName = () => {
    switch (entity.type) {
      case "character":
        return "Personaggio";
      case "place":
        return "Luogo";
      case "race":
        return "Razza";
      case "event":
        return "Evento";
      default:
        return entity.type;
    }
  };
  
  return (
    <div
      className={cn(
        "entity-tooltip absolute z-50 bg-card border rounded-md shadow-lg w-72 transition-opacity",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="entity-tooltip-header p-3 border-b flex items-center">
        <div className="entity-icon mr-2">
          {getEntityIcon()}
        </div>
        <div>
          <div className="entity-name font-medium">{entity.name}</div>
          <div className="entity-type text-xs text-muted-foreground">{getEntityTypeName()}</div>
        </div>
      </div>
      
      {entity.imageUrl && (
        <div className="entity-image w-full h-36 bg-muted/30 flex items-center justify-center">
          <img 
            src={entity.imageUrl} 
            alt={entity.name} 
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // Nascondi l'immagine se non può essere caricata
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {entity.description && (
        <div className="entity-description p-3 text-sm">
          {entity.description}
        </div>
      )}
      
      <div className="entity-tooltip-footer p-2 text-xs text-center text-muted-foreground border-t">
        Clicca per visualizzare i dettagli
      </div>
    </div>
  );
};

export default EntityTooltip;