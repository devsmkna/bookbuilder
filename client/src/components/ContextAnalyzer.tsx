import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, MapPin, Plus, RefreshCw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DetectedCharacter {
  id: string;
  name: string;
  mentions: number;
  contexts: string[];
  description?: string;
  isManual?: boolean;
}

interface DetectedLocation {
  id: string;
  name: string;
  mentions: number;
  contexts: string[];
  description?: string;
  isManual?: boolean;
}

interface ContextAnalyzerProps {
  text: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function ContextAnalyzer({ text, isVisible, onToggle }: ContextAnalyzerProps) {
  const { toast } = useToast();
  const [characters, setCharacters] = useState<DetectedCharacter[]>([]);
  const [locations, setLocations] = useState<DetectedLocation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<DetectedCharacter | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<DetectedLocation | null>(null);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  // Form states per aggiungere manualmente
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterDesc, setNewCharacterDesc] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationDesc, setNewLocationDesc] = useState('');

  // Analizza il testo per identificare personaggi e luoghi esistenti
  const analyzeContext = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Carica i personaggi e luoghi esistenti dal database
      const [charactersResponse, placesResponse] = await Promise.all([
        fetch('/api/characters'),
        fetch('/api/places')
      ]);
      
      const existingCharacters = charactersResponse.ok ? await charactersResponse.json() : [];
      const existingPlaces = placesResponse.ok ? await placesResponse.json() : [];
      
      const detectedChars: DetectedCharacter[] = [];
      const detectedLocs: DetectedLocation[] = [];
      
      // Dividi il testo in frasi per il contesto
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Cerca i personaggi esistenti nel testo
      existingCharacters.forEach((character: any) => {
        const regex = new RegExp(`\\b${character.name}\\b`, 'gi');
        const matches = text.match(regex);
        
        if (matches && matches.length > 0) {
          const contexts: string[] = [];
          
          // Trova le frasi che contengono il personaggio
          sentences.forEach(sentence => {
            if (sentence.toLowerCase().includes(character.name.toLowerCase())) {
              contexts.push(sentence.trim());
            }
          });
          
          detectedChars.push({
            id: character.id,
            name: character.name,
            mentions: matches.length,
            contexts: contexts,
            description: character.description,
            isManual: false
          });
        }
      });
      
      // Cerca i luoghi esistenti nel testo
      existingPlaces.forEach((place: any) => {
        const regex = new RegExp(`\\b${place.name}\\b`, 'gi');
        const matches = text.match(regex);
        
        if (matches && matches.length > 0) {
          const contexts: string[] = [];
          
          // Trova le frasi che contengono il luogo
          sentences.forEach(sentence => {
            if (sentence.toLowerCase().includes(place.name.toLowerCase())) {
              contexts.push(sentence.trim());
            }
          });
          
          detectedLocs.push({
            id: place.id,
            name: place.name,
            mentions: matches.length,
            contexts: contexts,
            description: place.description,
            isManual: false
          });
        }
      });
      
      setCharacters(detectedChars);
      setLocations(detectedLocs);
      
    } catch (error) {
      console.error('Errore nell\'analisi del contesto:', error);
      toast({
        title: "Errore",
        description: `Impossibile analizzare il contesto del testo: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Aggiungi manualmente un personaggio
  const addManualCharacter = () => {
    if (!newCharacterName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del personaggio è obbligatorio.",
        variant: "destructive"
      });
      return;
    }

    const newChar: DetectedCharacter = {
      id: `manual_char_${Date.now()}`,
      name: newCharacterName,
      mentions: 0,
      contexts: [],
      description: newCharacterDesc,
      isManual: true
    };

    setCharacters(prev => [...prev, newChar]);
    setNewCharacterName('');
    setNewCharacterDesc('');
    setShowAddCharacter(false);
    
    toast({
      title: "Successo",
      description: "Personaggio aggiunto manualmente.",
    });
  };

  // Aggiungi manualmente un luogo
  const addManualLocation = () => {
    if (!newLocationName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del luogo è obbligatorio.",
        variant: "destructive"
      });
      return;
    }

    const newLoc: DetectedLocation = {
      id: `manual_loc_${Date.now()}`,
      name: newLocationName,
      mentions: 0,
      contexts: [],
      description: newLocationDesc,
      isManual: true
    };

    setLocations(prev => [...prev, newLoc]);
    setNewLocationName('');
    setNewLocationDesc('');
    setShowAddLocation(false);
    
    toast({
      title: "Successo",
      description: "Luogo aggiunto manualmente.",
    });
  };

  // Rimuovi elemento
  const removeCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  };

  const removeLocation = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  // Esegui analisi automatica quando il testo cambia
  useEffect(() => {
    if (text && isVisible) {
      analyzeContext();
    }
  }, [text, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Header con pulsanti di controllo */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Analisi del Contesto</h3>
          <Button 
            onClick={analyzeContext} 
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analizzando...' : 'Aggiorna'}
          </Button>
        </div>

        {/* Sezione Personaggi */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Personaggi ({characters.length})
              </CardTitle>
              <Dialog open={showAddCharacter} onOpenChange={setShowAddCharacter}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aggiungi Personaggio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={newCharacterName}
                        onChange={(e) => setNewCharacterName(e.target.value)}
                        placeholder="Nome del personaggio"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrizione (opzionale)</label>
                      <Textarea
                        value={newCharacterDesc}
                        onChange={(e) => setNewCharacterDesc(e.target.value)}
                        placeholder="Descrizione del personaggio"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddCharacter(false)}>
                        Annulla
                      </Button>
                      <Button onClick={addManualCharacter}>
                        Aggiungi
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            {characters.length > 0 ? (
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      className="p-2 rounded-md border bg-background hover:bg-accent/50 cursor-pointer"
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{character.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {character.mentions} {character.mentions === 1 ? 'menzione' : 'menzioni'}
                          </Badge>
                          {character.isManual && (
                            <Badge variant="outline" className="text-xs">
                              Manuale
                            </Badge>
                          )}
                        </div>
                      </div>
                      {character.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {character.description.length > 50 
                            ? character.description.substring(0, 50) + '...'
                            : character.description
                          }
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun personaggio rilevato nel testo.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sezione Luoghi */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-green-500" />
                Luoghi ({locations.length})
              </CardTitle>
              <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aggiungi Luogo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        placeholder="Nome del luogo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrizione (opzionale)</label>
                      <Textarea
                        value={newLocationDesc}
                        onChange={(e) => setNewLocationDesc(e.target.value)}
                        placeholder="Descrizione del luogo"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddLocation(false)}>
                        Annulla
                      </Button>
                      <Button onClick={addManualLocation}>
                        Aggiungi
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            {locations.length > 0 ? (
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="p-2 rounded-md border bg-background hover:bg-accent/50 cursor-pointer"
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{location.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {location.mentions} {location.mentions === 1 ? 'menzione' : 'menzioni'}
                          </Badge>
                          {location.isManual && (
                            <Badge variant="outline" className="text-xs">
                              Manuale
                            </Badge>
                          )}
                        </div>
                      </div>
                      {location.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {location.description.length > 50 
                            ? location.description.substring(0, 50) + '...'
                            : location.description
                          }
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun luogo rilevato nel testo.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dettagli del personaggio selezionato */}
        {selectedCharacter && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Dettagli: {selectedCharacter.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {selectedCharacter.description && (
                <p className="text-sm mb-3">{selectedCharacter.description}</p>
              )}
              {selectedCharacter.contexts.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-2">Contesti nel testo:</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {selectedCharacter.contexts.map((context, index) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          "{context}"
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nessun contesto trovato nel testo.
                </p>
              )}
              <div className="flex justify-end mt-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedCharacter(null)}>
                  Chiudi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dettagli del luogo selezionato */}
        {selectedLocation && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Dettagli: {selectedLocation.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {selectedLocation.description && (
                <p className="text-sm mb-3">{selectedLocation.description}</p>
              )}
              {selectedLocation.contexts.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-2">Contesti nel testo:</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {selectedLocation.contexts.map((context, index) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          "{context}"
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nessun contesto trovato nel testo.
                </p>
              )}
              <div className="flex justify-end mt-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedLocation(null)}>
                  Chiudi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}