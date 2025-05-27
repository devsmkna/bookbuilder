import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, MapPin, Plus, Edit, Eye, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // Analizza il testo per identificare personaggi e luoghi
  const analyzeContext = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Analisi semplice basata su pattern per nomi propri
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const detectedChars: Map<string, DetectedCharacter> = new Map();
      const detectedLocs: Map<string, DetectedLocation> = new Map();
      
      // Pattern per identificare nomi propri (iniziano con maiuscola, seguiti da minuscole)
      const properNounPattern = /\b[A-Z][a-z]{2,}\b/g;
      
      // Parole comuni da escludere dall'analisi
      const excludeWords = new Set([
        'Il', 'La', 'Lo', 'Gli', 'Le', 'Un', 'Una', 'Uno', 'Del', 'Della', 'Dello', 'Dei', 'Delle',
        'Nel', 'Nella', 'Negli', 'Nelle', 'Sul', 'Sulla', 'Sugli', 'Sulle', 'Dal', 'Dalla', 'Dagli',
        'Dalle', 'Al', 'Alla', 'Agli', 'Alle', 'Per', 'Con', 'Tra', 'Fra', 'Di', 'Da', 'In', 'A',
        'Ma', 'Però', 'Quindi', 'Quando', 'Dove', 'Come', 'Mentre', 'Prima', 'Dopo', 'Durante',
        'Non', 'Ogni', 'Tutto', 'Tutti', 'Tutte', 'Molto', 'Poco', 'Tanto', 'Più', 'Meno',
        'Capitolo', 'Primo', 'Secondo', 'Terzo', 'Quarto', 'Quinto'
      ]);

      // Indicatori di luoghi comuni
      const locationIndicators = [
        'monastero', 'chiesa', 'castello', 'palazzo', 'torre', 'monte', 'montagna', 'valle',
        'fiume', 'lago', 'mare', 'oceano', 'isola', 'città', 'paese', 'villaggio', 'borgo',
        'strada', 'via', 'piazza', 'giardino', 'bosco', 'foresta', 'campo', 'prato',
        'casa', 'dimora', 'abitazione', 'regione', 'regno', 'impero', 'terra', 'mondo'
      ];

      sentences.forEach((sentence, sentenceIndex) => {
        const words = sentence.match(properNounPattern);
        if (!words) return;

        words.forEach(word => {
          if (excludeWords.has(word)) return;

          const isNearLocationIndicator = locationIndicators.some(indicator => 
            sentence.toLowerCase().includes(indicator) && 
            sentence.toLowerCase().indexOf(word.toLowerCase()) !== -1
          );

          const context = sentence.trim().substring(0, 100) + (sentence.length > 100 ? '...' : '');
          
          if (isNearLocationIndicator) {
            // Probabilmente un luogo
            if (detectedLocs.has(word)) {
              const loc = detectedLocs.get(word)!;
              loc.mentions++;
              if (!loc.contexts.includes(context)) {
                loc.contexts.push(context);
              }
            } else {
              detectedLocs.set(word, {
                id: `loc_${Date.now()}_${Math.random()}`,
                name: word,
                mentions: 1,
                contexts: [context],
                isManual: false
              });
            }
          } else {
            // Probabilmente un personaggio
            if (detectedChars.has(word)) {
              const char = detectedChars.get(word)!;
              char.mentions++;
              if (!char.contexts.includes(context)) {
                char.contexts.push(context);
              }
            } else {
              detectedChars.set(word, {
                id: `char_${Date.now()}_${Math.random()}`,
                name: word,
                mentions: 1,
                contexts: [context],
                isManual: false
              });
            }
          }
        });
      });

      // Mantieni i personaggi e luoghi aggiunti manualmente
      const existingManualChars = characters.filter(c => c.isManual);
      const existingManualLocs = locations.filter(l => l.isManual);

      setCharacters([
        ...Array.from(detectedChars.values()),
        ...existingManualChars
      ]);
      
      setLocations([
        ...Array.from(detectedLocs.values()),
        ...existingManualLocs
      ]);

      toast({
        title: "Analisi completata",
        description: `Trovati ${detectedChars.size} personaggi e ${detectedLocs.size} luoghi nel testo.`,
      });

    } catch (error) {
      console.error('Errore nell\'analisi del contesto:', error);
      toast({
        title: "Errore nell'analisi",
        description: "Si è verificato un errore durante l'analisi del testo.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Aggiunge un personaggio manualmente
  const addManualCharacter = () => {
    if (!newCharacterName.trim()) return;

    const newChar: DetectedCharacter = {
      id: `manual_char_${Date.now()}`,
      name: newCharacterName.trim(),
      mentions: 0,
      contexts: [],
      description: newCharacterDesc.trim() || undefined,
      isManual: true
    };

    setCharacters(prev => [...prev, newChar]);
    setNewCharacterName('');
    setNewCharacterDesc('');
    setShowAddCharacter(false);

    toast({
      title: "Personaggio aggiunto",
      description: `${newChar.name} è stato aggiunto al contesto.`,
    });
  };

  // Aggiunge un luogo manualmente
  const addManualLocation = () => {
    if (!newLocationName.trim()) return;

    const newLoc: DetectedLocation = {
      id: `manual_loc_${Date.now()}`,
      name: newLocationName.trim(),
      mentions: 0,
      contexts: [],
      description: newLocationDesc.trim() || undefined,
      isManual: true
    };

    setLocations(prev => [...prev, newLoc]);
    setNewLocationName('');
    setNewLocationDesc('');
    setShowAddLocation(false);

    toast({
      title: "Luogo aggiunto",
      description: `${newLoc.name} è stato aggiunto al contesto.`,
    });
  };

  // Aggiorna descrizione di un personaggio o luogo
  const updateCharacterDescription = (id: string, description: string) => {
    setCharacters(prev => prev.map(char => 
      char.id === id ? { ...char, description } : char
    ));
  };

  const updateLocationDescription = (id: string, description: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, description } : loc
    ));
  };

  // Analizza automaticamente quando cambia il testo (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text.trim() && isVisible) {
        analyzeContext();
      }
    }, 2000); // Aspetta 2 secondi dopo l'ultimo cambiamento

    return () => clearTimeout(timeoutId);
  }, [text, isVisible]);

  if (!isVisible) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Analisi del Contesto
          <Badge variant="secondary" className="ml-auto">
            {characters.length + locations.length} elementi
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={analyzeContext}
            disabled={isAnalyzing || !text.trim()}
            size="sm"
          >
            {isAnalyzing ? 'Analizzando...' : 'Rianalizza Testo'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Personaggi ({characters.length})
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Luoghi ({locations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Personaggi nel testo</h3>
              <Dialog open={showAddCharacter} onOpenChange={setShowAddCharacter}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Personaggio
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aggiungi Personaggio Manualmente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="charName">Nome del personaggio</Label>
                      <Input
                        id="charName"
                        value={newCharacterName}
                        onChange={(e) => setNewCharacterName(e.target.value)}
                        placeholder="Es. Marco, Elena, Signor Rossi..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="charDesc">Descrizione (opzionale)</Label>
                      <Textarea
                        id="charDesc"
                        value={newCharacterDesc}
                        onChange={(e) => setNewCharacterDesc(e.target.value)}
                        placeholder="Descrivi il personaggio, il suo ruolo nella storia..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
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

            <div className="grid gap-3">
              {characters.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nessun personaggio rilevato. Inizia a scrivere o aggiungi personaggi manualmente.
                </p>
              ) : (
                characters.map(character => (
                  <Card key={character.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{character.name}</h4>
                          {character.isManual && (
                            <Badge variant="outline" className="text-xs">Manuale</Badge>
                          )}
                          {character.mentions > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {character.mentions} menzioni
                            </Badge>
                          )}
                        </div>
                        
                        {character.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {character.description}
                          </p>
                        )}

                        {character.contexts.length > 0 && (
                          <div className="mt-2">
                            <Label className="text-xs font-medium">Contesti nel testo:</Label>
                            <div className="space-y-1 mt-1">
                              {character.contexts.slice(0, 3).map((context, index) => (
                                <p key={index} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                  "{context}"
                                </p>
                              ))}
                              {character.contexts.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{character.contexts.length - 3} altri contesti...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifica {character.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Descrizione</Label>
                              <Textarea
                                defaultValue={character.description || ''}
                                onBlur={(e) => updateCharacterDescription(character.id, e.target.value)}
                                placeholder="Aggiungi una descrizione per questo personaggio..."
                                rows={4}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Luoghi nel testo</h3>
              <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Luogo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aggiungi Luogo Manualmente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="locName">Nome del luogo</Label>
                      <Input
                        id="locName"
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        placeholder="Es. Roma, Castello di Neuschwanstein, Casa di Marco..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="locDesc">Descrizione (opzionale)</Label>
                      <Textarea
                        id="locDesc"
                        value={newLocationDesc}
                        onChange={(e) => setNewLocationDesc(e.target.value)}
                        placeholder="Descrivi il luogo, la sua importanza nella storia..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
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

            <div className="grid gap-3">
              {locations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nessun luogo rilevato. Inizia a scrivere o aggiungi luoghi manualmente.
                </p>
              ) : (
                locations.map(location => (
                  <Card key={location.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{location.name}</h4>
                          {location.isManual && (
                            <Badge variant="outline" className="text-xs">Manuale</Badge>
                          )}
                          {location.mentions > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {location.mentions} menzioni
                            </Badge>
                          )}
                        </div>
                        
                        {location.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {location.description}
                          </p>
                        )}

                        {location.contexts.length > 0 && (
                          <div className="mt-2">
                            <Label className="text-xs font-medium">Contesti nel testo:</Label>
                            <div className="space-y-1 mt-1">
                              {location.contexts.slice(0, 3).map((context, index) => (
                                <p key={index} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                  "{context}"
                                </p>
                              ))}
                              {location.contexts.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{location.contexts.length - 3} altri contesti...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifica {location.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Descrizione</Label>
                              <Textarea
                                defaultValue={location.description || ''}
                                onBlur={(e) => updateLocationDescription(location.id, e.target.value)}
                                placeholder="Aggiungi una descrizione per questo luogo..."
                                rows={4}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}