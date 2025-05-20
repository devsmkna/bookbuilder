import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Lightbulb, BarChart2, MessageSquareText, Type, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AnalysisResult, 
  DialogueAnalysisResult, 
  StyleAnalysisResult,
  analyzeText, 
  analyzeDialogues, 
  analyzeStyle, 
  findSynonyms,
  improveDialogue
} from '../lib/textAnalysis';

interface TextAnalyzerProps {
  text: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function TextAnalyzer({ text, isVisible, onToggle }: TextAnalyzerProps) {
  const [textAnalysis, setTextAnalysis] = useState<AnalysisResult | null>(null);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysisResult | null>(null);
  const [dialogueAnalysis, setDialogueAnalysis] = useState<DialogueAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [selectedDialogue, setSelectedDialogue] = useState<string | null>(null);
  const [dialogueSuggestions, setDialogueSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isVisible && text) {
      analyzeTextContent();
    }
  }, [isVisible, text]);

  const analyzeTextContent = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const general = analyzeText(text);
      const style = analyzeStyle(text);
      const dialogue = analyzeDialogues(text);
      
      setTextAnalysis(general);
      setStyleAnalysis(style);
      setDialogueAnalysis(dialogue);
      setIsAnalyzing(false);
    }, 300); // Simula un breve ritardo di elaborazione
  };

  const handleWordClick = (word: string) => {
    if (word.length < 3) return;
    
    setSelectedWord(word);
    const foundSynonyms = findSynonyms(word);
    setSynonyms(foundSynonyms);
  };

  const handleDialogueSelect = (dialogue: string) => {
    setSelectedDialogue(dialogue);
    const suggestions = improveDialogue(dialogue);
    setDialogueSuggestions(suggestions);
  };

  // Estrae dialoghi dal testo
  const extractDialogues = () => {
    const dialogueRegex = /"([^"]+)"|"([^"]+)"|«([^»]+)»/g;
    const matches = Array.from(text.matchAll(dialogueRegex));
    return matches.map(match => match[1] || match[2] || match[3]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 z-10 w-80 lg:w-96 bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium">Analisi del testo</h2>
        <Button variant="outline" size="icon" onClick={onToggle}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Generale</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-1">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Stile</span>
          </TabsTrigger>
          <TabsTrigger value="dialogue" className="flex items-center gap-1">
            <MessageSquareText className="h-4 w-4" />
            <span className="hidden sm:inline">Dialoghi</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Analisi in corso...</p>
            </div>
          ) : (
            <>
              <TabsContent value="general" className="flex-1 overflow-hidden flex flex-col p-4 pt-0">
                {textAnalysis && (
                  <>
                    <div className="flex items-center gap-2 mt-4 mb-2">
                      <h3 className="font-medium">Punteggio complessivo</h3>
                      <Badge variant={textAnalysis.score > 70 ? "default" : textAnalysis.score > 50 ? "outline" : "secondary"}>
                        {textAnalysis.score}/100
                      </Badge>
                    </div>
                    <Progress value={textAnalysis.score} className="h-2 mb-4" />
                    
                    <div className="space-y-4 overflow-y-auto flex-1">
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Punti di forza
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          {textAnalysis.strengths.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {textAnalysis.strengths.map((strength: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-green-500 mr-1">•</span> {strength}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nessun punto di forza rilevato.</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <X className="h-4 w-4 text-red-500 mr-2" />
                            Aree di miglioramento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          {textAnalysis.weaknesses.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {textAnalysis.weaknesses.map((weakness: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-red-500 mr-1">•</span> {weakness}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nessuna debolezza rilevata.</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                            Suggerimenti
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          {textAnalysis.suggestions.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {textAnalysis.suggestions.map((suggestion: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-yellow-500 mr-1">•</span> {suggestion}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nessun suggerimento disponibile.</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">
                            Analisi del vocabolario
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="text-sm mb-2">Fai clic su qualsiasi parola nel testo per trovare sinonimi:</p>
                          {selectedWord ? (
                            <div className="mt-2">
                              <p className="text-sm mb-1 font-medium">Sinonimi per "{selectedWord}":</p>
                              {synonyms.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {synonyms.map((synonym, i) => (
                                    <Badge key={i} variant="outline" className="cursor-pointer hover:bg-secondary">{synonym}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Nessun sinonimo trovato.</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Seleziona una parola dal testo.</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="style" className="flex-1 overflow-hidden flex flex-col p-4 pt-0">
                {styleAnalysis && (
                  <>
                    <div className="flex items-center gap-2 mt-4 mb-2">
                      <h3 className="font-medium">Stile di scrittura</h3>
                      <Badge variant={styleAnalysis.score > 70 ? "default" : styleAnalysis.score > 50 ? "outline" : "secondary"}>
                        {styleAnalysis.score}/100
                      </Badge>
                    </div>
                    <Progress value={styleAnalysis.score} className="h-2 mb-4" />
                    
                    <div className="space-y-4 overflow-y-auto flex-1">
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">
                            Metriche stilistiche
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Varietà di vocabolario</span>
                                <span className="font-medium">{styleAnalysis.wordVariety}%</span>
                              </div>
                              <Progress value={styleAnalysis.wordVariety} className="h-1 mt-1" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Leggibilità</span>
                                <span className="font-medium">{styleAnalysis.readability}/100</span>
                              </div>
                              <Progress value={styleAnalysis.readability} className="h-1 mt-1" />
                            </div>
                            
                            <div className="text-sm mt-2">
                              <p><span className="font-medium">Lunghezza media frase:</span> {styleAnalysis.sentenceLength.average} parole</p>
                              <p><span className="font-medium">Varietà lunghezza frasi:</span> {styleAnalysis.sentenceLength.variety}</p>
                              <p className="text-xs text-muted-foreground mt-1">(Un valore più alto indica maggiore varietà nel ritmo)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                            Suggerimenti stilistici
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          {styleAnalysis.suggestions.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {styleAnalysis.suggestions.map((suggestion: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-yellow-500 mr-1">•</span> {suggestion}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Lo stile del testo è ben bilanciato.</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">
                            Interpretazione delle metriche
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <ul className="space-y-1 text-sm">
                            <li><span className="font-medium">Varietà di vocabolario:</span> Maggiore è il valore, più ricco è il linguaggio usato.</li>
                            <li><span className="font-medium">Leggibilità:</span> Un valore tra 40-60 è ideale per narrativa. Valori più alti indicano testo più semplice.</li>
                            <li><span className="font-medium">Varietà lunghezza frasi:</span> Valori sopra 4 indicano un buon ritmo prosodico.</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="dialogue" className="flex-1 overflow-hidden flex flex-col p-4 pt-0">
                {dialogueAnalysis && (
                  <>
                    <div className="flex items-center gap-2 mt-4 mb-2">
                      <h3 className="font-medium">Analisi dei dialoghi</h3>
                      <Badge variant={dialogueAnalysis.score > 70 ? "default" : dialogueAnalysis.score > 50 ? "outline" : "secondary"}>
                        {dialogueAnalysis.score}/100
                      </Badge>
                    </div>
                    <Progress value={dialogueAnalysis.score} className="h-2 mb-2" />
                    
                    <div className="flex justify-between text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Impatto emotivo:</span> 
                        <Badge variant="outline" className="ml-1">
                          {dialogueAnalysis.emotionalImpact}%
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Naturalezza:</span> 
                        <Badge variant="outline" className="ml-1">
                          {dialogueAnalysis.naturalness}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto flex-1">
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                            Suggerimenti per i dialoghi
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          {dialogueAnalysis.suggestions.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {dialogueAnalysis.suggestions.map((suggestion: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-yellow-500 mr-1">•</span> {suggestion}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">I dialoghi sono ben costruiti.</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">
                            Analisi dialogo specifico
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Seleziona un dialogo per ricevere suggerimenti su come migliorarlo
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-2">
                          {extractDialogues().length > 0 ? (
                            <ScrollArea className="h-32 rounded-md border p-2">
                              {extractDialogues().map((dialogue, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => handleDialogueSelect(dialogue)}
                                  className={`text-sm p-2 rounded cursor-pointer mb-1 ${selectedDialogue === dialogue ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                                >
                                  "{dialogue.length > 60 ? dialogue.substring(0, 60) + '...' : dialogue}"
                                </div>
                              ))}
                            </ScrollArea>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nessun dialogo trovato nel testo.</p>
                          )}
                          
                          {selectedDialogue && dialogueSuggestions.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-1">Suggerimenti:</h4>
                              <ul className="space-y-1 text-sm">
                                {dialogueSuggestions.map((suggestion, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="text-yellow-500 mr-1">•</span> {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">
                            Consigli generali per dialoghi efficaci
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-start">
                              <span className="text-primary mr-1">•</span> Mostra anziché dire (aggiungi azioni e reazioni fisiche)
                            </li>
                            <li className="flex items-start">
                              <span className="text-primary mr-1">•</span> Crea "voci" uniche per ogni personaggio
                            </li>
                            <li className="flex items-start">
                              <span className="text-primary mr-1">•</span> Usa il sottotesto (ciò che non viene detto)
                            </li>
                            <li className="flex items-start">
                              <span className="text-primary mr-1">•</span> Varia i tag di dialogo (alternativa a "disse")
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
      
      <div className="flex justify-center p-2 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={analyzeTextContent}
          disabled={isAnalyzing}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          Aggiorna analisi
        </Button>
      </div>
    </div>
  );
}