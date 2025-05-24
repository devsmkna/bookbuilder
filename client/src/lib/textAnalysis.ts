/**
 * Servizio di analisi del testo che utilizza algoritmi locali
 * Offre funzionalità per analizzare la qualità del testo, fornire suggerimenti stilistici,
 * migliorare i dialoghi e trovare sinonimi.
 */

export interface AnalysisResult {
  score: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface DialogueAnalysisResult {
  score: number;
  suggestions: string[];
  emotionalImpact: number;
  naturalness: number;
}

export interface StyleAnalysisResult {
  score: number;
  wordVariety: number;
  sentenceLength: {
    average: number;
    variety: number;
  };
  readability: number;
  suggestions: string[];
}

// Database locale di sinonimi comuni in italiano
const synonymsDatabase: Record<string, string[]> = {
  // Aggettivi qualificativi
  "buono": ["eccellente", "ottimo", "pregevole", "magnifico", "splendido"],
  "cattivo": ["malvagio", "pessimo", "terribile", "scadente", "mediocre"],
  "bello": ["splendido", "magnifico", "stupendo", "meraviglioso", "incantevole"],
  "brutto": ["orribile", "orrendo", "sgradevole", "ripugnante", "disgustoso"],
  "grande": ["enorme", "colossale", "vasto", "immenso", "gigantesco"],
  "piccolo": ["minuscolo", "minimo", "ridotto", "esiguo", "limitato"],
  "nuovo": ["moderno", "recente", "fresco", "inedito", "innovativo"],
  "vecchio": ["antico", "antiquato", "datato", "sorpassato", "obsoleto"],
  "giovane": ["giovanile", "fresco", "acerbo", "adolescente", "junior"],
  "anziano": ["maturo", "attempato", "senior", "avanzato", "veterano"],
  "forte": ["potente", "robusto", "vigoroso", "energico", "possente"],
  "debole": ["fragile", "delicato", "gracile", "fievole", "vulnerabile"],
  "alto": ["elevato", "erto", "sublime", "superiore", "imponente"],
  "basso": ["ridotto", "inferiore", "modesto", "contenuto", "limitato"],
  "lungo": ["esteso", "prolungato", "duraturo", "continuato", "allungato"],
  "corto": ["breve", "conciso", "succinto", "ridotto", "limitato"],
  "largo": ["ampio", "esteso", "spazioso", "vasto", "generoso"],
  "stretto": ["angusto", "ristretto", "limitato", "ridotto", "esiguo"],
  "caldo": ["bollente", "torrido", "rovente", "ardente", "infuocato"],
  "freddo": ["gelido", "glaciale", "rigido", "algido", "ghiacciato"],
  "facile": ["semplice", "agevole", "elementare", "immediato", "accessibile"],
  "difficile": ["arduo", "complesso", "complicato", "impegnativo", "ostico"],
  "veloce": ["rapido", "celere", "svelto", "lesto", "fulmineo"],
  "lento": ["tardo", "placido", "flemmatico", "indolente", "pigro"],
  "ricco": ["facoltoso", "benestante", "agiato", "abbiente", "danaroso"],
  "povero": ["indigente", "bisognoso", "squattrinato", "spiantato", "nullatenente"],
  "intelligente": ["brillante", "perspicace", "acuto", "sagace", "geniale"],
  "stupido": ["sciocco", "ottuso", "ignorante", "stolto", "insensato"],
  "felice": ["contento", "allegro", "gioioso", "lieto", "raggiante"],
  "triste": ["malinconico", "afflitto", "mesto", "abbattuto", "sconsolato"],
  "arrabbiato": ["furioso", "irato", "adirato", "infuriato", "indignato"],
  "calmo": ["tranquillo", "sereno", "placido", "pacifico", "rilassato"],
  "stanco": ["affaticato", "spossato", "esausto", "sfinito", "logorato"],
  "energico": ["vivace", "dinamico", "attivo", "vigoroso", "scattante"],

  // Verbi di movimento
  "camminare": ["passeggiare", "marciare", "incedere", "avanzare", "procedere"],
  "correre": ["scappare", "fuggire", "precipitarsi", "sfrecciare", "galoppare"],
  "saltare": ["balzare", "sobbalzare", "rimbalzare", "scavalcare", "scattare"],
  "volare": ["planare", "volteggiare", "librarsi", "svolazzare", "aleggiare"],
  "cadere": ["precipitare", "crollare", "rovinare", "piombare", "capitombolare"],
  "andare": ["recarsi", "dirigersi", "avviarsi", "incamminarsi", "muoversi"],
  "venire": ["arrivare", "giungere", "sopraggiungere", "approdare", "comparire"],
  "tornare": ["rientrare", "ritornare", "far ritorno", "rimpatriare", "riapparire"],
  "partire": ["allontanarsi", "avviarsi", "decollare", "salpare", "emigrare"],
  "entrare": ["accedere", "penetrare", "introdursi", "infilarsi", "immettersi"],
  "uscire": ["allontanarsi", "defluire", "sgattaiolare", "evadere", "emergere"],

  // Verbi di percezione
  "guardare": ["osservare", "fissare", "esaminare", "scrutare", "contemplare"],
  "vedere": ["scorgere", "notare", "avvistare", "individuare", "rilevare"],
  "sentire": ["percepire", "udire", "ascoltare", "avvertire", "captare"],
  "toccare": ["sfiorare", "palpare", "tastare", "accarezzare", "manipolare"],
  "odorare": ["fiutare", "annusare", "inalare", "aspirare", "profumare"],
  "gustare": ["assaporare", "degustare", "pregustare", "apprezzare", "sorseggiare"],

  // Verbi di comunicazione
  "dire": ["affermare", "dichiarare", "esprimere", "comunicare", "proferire"],
  "parlare": ["conversare", "dialogare", "discutere", "chiacchierare", "conferire"],
  "gridare": ["urlare", "strillare", "vociferare", "sbraitare", "esclamare"],
  "sussurrare": ["bisbigliare", "mormorare", "soffiare", "biascicare", "farfugliare"],
  "chiamare": ["invocare", "gridare", "appellare", "denominare", "convocare"],
  "rispondere": ["replicare", "ribattere", "controbattere", "obiettare", "reagire"],
  "domandare": ["chiedere", "interrogare", "questionare", "interpellare", "informarsi"],
  "raccontare": ["narrare", "riferire", "esporre", "descrivere", "riportare"],

  // Verbi di azione
  "fare": ["compiere", "eseguire", "realizzare", "effettuare", "attuare"],
  "prendere": ["afferrare", "agguantare", "ghermire", "impugnare", "catturare"],
  "dare": ["fornire", "consegnare", "elargire", "concedere", "distribuire"],
  "mettere": ["posare", "collocare", "sistemare", "riporre", "disporre"],
  "togliere": ["rimuovere", "sottrarre", "eliminare", "levare", "asportare"],
  "aprire": ["schiudere", "dischiudere", "spalancare", "scoperchiare", "svelare"],
  "chiudere": ["serrare", "sbarrare", "sigillare", "otturare", "bloccare"],
  "spingere": ["sospingere", "premere", "incalzare", "sollecitare", "stimolare"],
  "tirare": ["trascinare", "strattonare", "strappare", "estrarre", "attirare"],
  "rompere": ["spezzare", "frantumare", "infrangere", "demolire", "distruggere"],
  "costruire": ["edificare", "erigere", "fabbricare", "realizzare", "assemblare"],
  "comprare": ["acquistare", "procurarsi", "ottenere", "comperare", "aggiudicarsi"],
  "vendere": ["smerciare", "cedere", "commerciare", "spacciare", "liquidare"],

  // Verbi cognitivi
  "pensare": ["riflettere", "meditare", "considerare", "contemplare", "ponderare"],
  "sapere": ["conoscere", "essere", "informato", "padroneggiare", "dominare"],
  "imparare": ["apprendere", "studiare", "assimilare", "memorizzare", "acquisire"],
  "dimenticare": ["scordare", "tralasciare", "omettere", "trascurare", "ignorare"],
  "ricordare": ["rammentare", "rammemorarsi", "richiamare", "evocare", "rievocare"],
  "capire": ["comprendere", "intendere", "afferrare", "realizzare", "cogliere"],
  "credere": ["ritenere", "presumere", "supporre", "immaginare", "sospettare"],
  "sperare": ["auspicare", "confidare", "aspettarsi", "attendersi", "agognare"],

  // Sostantivi comuni
  "casa": ["abitazione", "dimora", "residenza", "domicilio", "tetto"],
  "uomo": ["individuo", "persona", "essere", "soggetto", "tipo"],
  "donna": ["signora", "dama", "femmina", "fanciulla", "ragazza"],
  "bambino": ["bimbo", "fanciullo", "piccolo", "ragazzino", "infante"],
  "giorno": ["giornata", "dì", "tempo", "periodo", "momento"],
  "notte": ["nottata", "buio", "oscurità", "tenebre", "sera"],
  "sole": ["astro", "stella", "luminare", "disco", "solare"],
  "luna": ["satellite", "astro", "disco", "falce", "crescente"],
  "mare": ["oceano", "lago", "distesa", "acqua", "flutto"],
  "cielo": ["firmamento", "volta", "azzurro", "empireo", "spazio"],
  "terra": ["suolo", "terreno", "globo", "mondo", "pianeta"],
  "albero": ["pianta", "arbusto", "fusto", "tronco", "vegetale"],
  "fiore": ["bocciolo", "corolla", "petalo", "fioritura", "sbocciare"],
  "strada": ["via", "sentiero", "percorso", "tracciato", "cammino"],
  "città": ["metropoli", "centro", "paese", "località", "borgo"],
  "tempo": ["durata", "periodo", "momento", "fase", "epoca"],
  "vita": ["esistenza", "essere", "vivere", "quotidiano", "esperienza"],
  "morte": ["decesso", "fine", "trapasso", "scomparsa", "termine"],
  "amore": ["affetto", "passione", "sentimento", "tenerezza", "devozione"],
  "guerra": ["conflitto", "battaglia", "scontro", "combattimento", "ostilità"],
  "pace": ["tranquillità", "serenità", "calma", "armonia", "quiete"],
  "lavoro": ["impiego", "occupazione", "attività", "mestiere", "professione"],
  "scuola": ["istituto", "educazione", "istruzione", "formazione", "studio"],
  "libro": ["volume", "testo", "opera", "pubblicazione", "lettura"],
  "musica": ["melodia", "suono", "armonia", "composizione", "canzone"],
  "cibo": ["alimento", "nutrimento", "vivanda", "pietanza", "pasto"],
  "acqua": ["liquido", "bevanda", "fluido", "elemento", "sostanza"],
  "fuoco": ["fiamma", "combustione", "rogo", "incendio", "falò"]
};

// Parole comuni che potrebbero essere sostituite con alternative più interessanti
const commonWords = [
  "molto", "davvero", "certamente", "sempre", "andare", "fare", "dire", "vedere"
];

// Frasi di transizione per migliorare il flusso del testo
const transitionPhrases = [
  "D'altra parte", "Inoltre", "Di conseguenza", "Infatti", "Tuttavia"
];

/**
 * Analizza un testo e fornisce suggerimenti per migliorarne la qualità
 */
export function analyzeText(text: string): AnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      suggestions: ["Aggiungi del testo per ricevere suggerimenti."],
      strengths: [],
      weaknesses: []
    };
  }

  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  // Calcola statistiche
  const avgWordLength = wordCount > 0 ? words.reduce((sum, word) => sum + word.length, 0) / wordCount : 0;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const uniqueWords = new Set(words);
  const uniqueWordsPercentage = wordCount > 0 ? (uniqueWords.size / wordCount) * 100 : 0;
  
  // Calcola punteggio base
  let score = 60;
  
  // Premia la varietà di parole
  if (uniqueWordsPercentage > 70) score += 10;
  else if (uniqueWordsPercentage > 50) score += 5;
  
  // Premia la lunghezza media delle frasi appropriata
  if (avgSentenceLength > 5 && avgSentenceLength < 20) score += 5;
  else if (avgSentenceLength > 20) score -= 5;
  
  // Lunghezza appropriata dei paragrafi
  if (paragraphs.length > 1 && wordCount / paragraphs.length < 100) score += 5;
  else if (paragraphs.length === 1 && wordCount > 100) score -= 5;
  
  // Raccolta punti di forza e debolezza
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  
  // Verifica varietà di parole
  if (uniqueWordsPercentage > 70) {
    strengths.push("Eccellente varietà di vocabolario");
  } else if (uniqueWordsPercentage < 40) {
    weaknesses.push("Vocabolario limitato");
    suggestions.push("Prova ad arricchire il testo con parole più variegate");
  }
  
  // Verifica ripetizioni
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 3) { // Ignora parole molto brevi
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  const repeatedWords = Object.entries(wordFrequency)
    .filter(([word, count]) => count > 2 && word.length > 3)
    .map(([word]) => word);
  
  if (repeatedWords.length > 0) {
    weaknesses.push(`Parole ripetute con frequenza: ${repeatedWords.slice(0, 3).join(', ')}${repeatedWords.length > 3 ? '...' : ''}`);
    
    // Suggerisci sinonimi per le parole ripetute (usando il database locale per velocità)
    repeatedWords.slice(0, 3).forEach(word => {
      if (synonymsDatabase[word.toLowerCase()]) {
        const synonyms = synonymsDatabase[word.toLowerCase()];
        suggestions.push(`Sostituisci "${word}" con: ${synonyms.slice(0, 3).join(', ')}`);
      }
    });
  }
  
  // Verifica lunghezza frasi
  const longSentences = sentences.filter(s => s.split(' ').length > 25);
  if (longSentences.length > 0) {
    weaknesses.push("Alcune frasi sono molto lunghe");
    suggestions.push("Considera di spezzare le frasi più lunghe per migliorare la leggibilità");
  }
  
  // Assicurati di avere almeno un punto di forza
  if (strengths.length === 0) {
    if (wordCount > 200) {
      strengths.push("Buona lunghezza del testo");
    } else if (sentences.every(s => s.trim().endsWith('.'))) {
      strengths.push("Punteggiatura corretta");
    } else {
      strengths.push("Testo ben strutturato");
    }
  }
  
  // Arrotonda il punteggio
  score = Math.min(100, Math.max(0, Math.round(score)));
  
  // Limita le suggestioni per non sovraccaricare
  if (suggestions.length > 5) {
    suggestions.length = 5;
  }
  
  return {
    score,
    suggestions,
    strengths,
    weaknesses
  };
}

/**
 * Analizza specificamente i dialoghi nel testo
 */
export function analyzeDialogues(text: string): DialogueAnalysisResult {
  // Estrai i dialoghi dal testo
  const dialogueRegex = /"([^"]+)"|"([^"]+)"|«([^»]+)»/g;
  const dialogues: string[] = [];
  let match;
  
  while ((match = dialogueRegex.exec(text)) !== null) {
    dialogues.push(match[1] || match[2] || match[3]);
  }
  
  if (dialogues.length === 0) {
    return {
      score: 0,
      suggestions: ["Non sono stati trovati dialoghi da analizzare."],
      emotionalImpact: 0,
      naturalness: 0
    };
  }
  
  // Calcola punteggio base e metriche
  let score = 65;
  let emotionalImpact = 50;
  let naturalness = 60;
  const suggestions: string[] = [];
  
  // Analizza la lunghezza dei dialoghi
  const avgDialogueLength = dialogues.reduce((sum, d) => sum + d.length, 0) / dialogues.length;
  
  if (avgDialogueLength > 100) {
    score -= 10;
    naturalness -= 15;
    suggestions.push("I dialoghi sono mediamente troppo lunghi. Considera di renderli più concisi.");
  }
  
  // Verifica presenza di emozioni
  const emotionWords = ["felice", "triste", "arrabbiato", "spaventato", "sorpreso"];
  const containsEmotions = dialogues.some(d => 
    emotionWords.some(word => d.toLowerCase().includes(word))
  );
  
  if (!containsEmotions) {
    emotionalImpact -= 10;
    suggestions.push("Aggiungi più espressioni emotive nei dialoghi per renderli più coinvolgenti.");
  }
  
  // Se non ci sono abbastanza suggerimenti, aggiungi un consiglio generale
  if (suggestions.length < 2) {
    suggestions.push("Considera di alternare i dialoghi con descrizioni per dare ritmo alla narrazione.");
  }
  
  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    suggestions,
    emotionalImpact: Math.min(100, Math.max(0, Math.round(emotionalImpact))),
    naturalness: Math.min(100, Math.max(0, Math.round(naturalness)))
  };
}

/**
 * Analizza lo stile della scrittura
 */
export function analyzeStyle(text: string): StyleAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      wordVariety: 0,
      sentenceLength: { average: 0, variety: 0 },
      readability: 0,
      suggestions: ["Aggiungi del testo per ricevere suggerimenti sullo stile."]
    };
  }
  
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (words.length === 0 || sentences.length === 0) {
    return {
      score: 0,
      wordVariety: 0,
      sentenceLength: { average: 0, variety: 0 },
      readability: 0,
      suggestions: ["Il testo è troppo breve per un'analisi significativa."]
    };
  }
  
  // Calcola statistiche
  const uniqueWords = new Set(words);
  const wordVariety = (uniqueWords.size / words.length) * 100;
  
  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
  const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentences.length;
  
  // Calcola la varietà della lunghezza delle frasi (deviazione standard)
  const sentenceLengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentences.length;
  const sentenceLengthVariety = Math.sqrt(sentenceLengthVariance);
  
  // Stima readability (semplificazione dell'indice per l'italiano)
  const letterCount = text.replace(/\s/g, '').length;
  const readability = 89 + (300 * (sentences.length / words.length)) - (10 * (letterCount / words.length));
  
  // Calcola punteggio
  let score = 60;
  
  // Premia la varietà di parole
  if (wordVariety > 70) score += 15;
  else if (wordVariety > 50) score += 8;
  else if (wordVariety < 40) score -= 10;
  
  // Premia la varietà nella lunghezza delle frasi
  if (sentenceLengthVariety > 4) score += 10;
  else if (sentenceLengthVariety < 2) score -= 5;
  
  // Raccogli suggerimenti
  const suggestions: string[] = [];
  
  if (wordVariety < 50) {
    suggestions.push("Aumenta la varietà del vocabolario utilizzando sinonimi e termini più specifici.");
  }
  
  if (sentenceLengthVariety < 3) {
    suggestions.push("Varia la lunghezza delle frasi per creare un ritmo più interessante.");
  }
  
  if (avgSentenceLength > 25) {
    suggestions.push("Le tue frasi sono mediamente molto lunghe. Considera di spezzarne alcune.");
  }
  
  // Se mancano suggerimenti, aggiungi consigli generali
  if (suggestions.length === 0) {
    suggestions.push("Prova a incorporare più immagini sensoriali per rendere il testo più vivido.");
  }
  
  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    wordVariety: Math.round(wordVariety),
    sentenceLength: {
      average: Math.round(avgSentenceLength * 10) / 10,
      variety: Math.round(sentenceLengthVariety * 10) / 10
    },
    readability: Math.round(readability),
    suggestions: suggestions.slice(0, 3) // Limita a 3 suggerimenti
  };
}

/**
 * Trova sinonimi per una parola data
 */
// Funzione helper per rilevare se una parola è italiana
function isItalianWord(word: string): boolean {
  // Lista di caratteri tipici italiani e terminazioni comuni
  const italianEndings = ['are', 'ere', 'ire', 'ato', 'uto', 'ita', 'etto', 'ezza', 'ione', 'ante', 'ente'];
  const italianChars = /[àèéìíîòóù]/;
  
  return italianChars.test(word) || italianEndings.some(ending => word.endsWith(ending));
}

export async function findSynonyms(word: string): Promise<string[]> {
  const cleanWord = word.toLowerCase().trim();
  const isItalian = isItalianWord(cleanWord);
  
  try {
    // 1. PRIORITÀ: API per italiano se la parola sembra italiana
    if (isItalian) {
      // Prova con OpenThesaurus per italiano
      try {
        const openThesaurus = await fetch(`https://www.openthesaurus.de/synonyme/search?q=${encodeURIComponent(cleanWord)}&format=application/json`);
        if (openThesaurus.ok) {
          const data = await openThesaurus.json();
          if (data.synsets && data.synsets.length > 0) {
            const synonyms: string[] = [];
            data.synsets.forEach((synset: any) => {
              synset.terms?.forEach((term: any) => {
                if (term.term && term.term !== cleanWord && synonyms.length < 8) {
                  synonyms.push(term.term);
                }
              });
            });
            if (synonyms.length > 0) {
              return synonyms;
            }
          }
        }
      } catch (e) {
        console.warn('OpenThesaurus API non disponibile:', e);
      }

      // Prova con Wiktionary italiano
      try {
        const wiktItalian = await fetch(`https://it.wiktionary.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(cleanWord)}&prop=wikitext&origin=*`);
        if (wiktItalian.ok) {
          const data = await wiktItalian.json();
          if (data.parse && data.parse.wikitext) {
            const wikitext = data.parse.wikitext['*'];
            const synonyms: string[] = [];
            
            // Cerca sinonimi nel formato Wiktionary
            const synMatches = wikitext.match(/\{\{sinonimi\}\}([^{]*)/gi) || 
                             wikitext.match(/sinonimi?[:\s]*([^.\n]*)/gi);
            
            if (synMatches) {
              synMatches.forEach((match: string) => {
                const words = match.replace(/\{\{sinonimi\}\}|sinonimi?[:\s]*/gi, '')
                  .split(/[,;|]/)
                  .map((w: string) => w.trim().replace(/\[\[|\]\]/g, ''))
                  .filter((w: string) => w && w !== cleanWord);
                
                words.forEach((w: string) => {
                  if (synonyms.length < 6 && !synonyms.includes(w)) {
                    synonyms.push(w);
                  }
                });
              });
            }
            
            if (synonyms.length > 0) {
              return synonyms;
            }
          }
        }
      } catch (e) {
        console.warn('Wiktionary italiano non disponibile:', e);
      }
    }

    // 2. API multilingue con supporto esteso
    try {
      // Prova con Datamuse per parole italiane (supporta italiano limitato)
      const datamuseIt = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=8`);
      const datamuseData = await datamuseIt.json();
      
      if (datamuseData && datamuseData.length > 0) {
        return datamuseData.map((item: any) => item.word);
      }
    } catch (e) {
      console.warn('Datamuse API non disponibile:', e);
    }

    // 3. Per parole inglesi o come fallback
    if (!isItalian) {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
        
        if (response.ok) {
          const data = await response.json();
          const synonyms: string[] = [];
          
          data.forEach((entry: any) => {
            entry.meanings?.forEach((meaning: any) => {
              meaning.synonyms?.forEach((synonym: string) => {
                if (!synonyms.includes(synonym) && synonyms.length < 8) {
                  synonyms.push(synonym);
                }
              });
            });
          });
          
          if (synonyms.length > 0) {
            return synonyms;
          }
        }
      } catch (e) {
        console.warn('Free Dictionary API non disponibile:', e);
      }
    }
    
    // 4. Prova con Wiktionary generale
    try {
      const wiktionary = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanWord)}`);
      
      if (wiktionary.ok) {
        const wiktData = await wiktionary.json();
        const synonyms: string[] = [];
        
        Object.values(wiktData).forEach((langData: any) => {
          if (Array.isArray(langData)) {
            langData.forEach((definition: any) => {
              if (definition.definition) {
                const text = definition.definition.toLowerCase();
                const synonymMatches = text.match(/synonym[s]?[:\s]+([^.;,]+)/gi) ||
                                     text.match(/sinonim[io][:\s]+([^.;,]+)/gi);
                if (synonymMatches) {
                  synonymMatches.forEach((match: string) => {
                    const words = match.replace(/synonym[s]?[:\s]+|sinonim[io][:\s]+/gi, '').split(/[,;]/);
                    words.forEach((w: string) => {
                      const cleanSyn = w.trim().replace(/[^\w\sàèéìíîòóù]/g, '');
                      if (cleanSyn && !synonyms.includes(cleanSyn) && synonyms.length < 6) {
                        synonyms.push(cleanSyn);
                      }
                    });
                  });
                }
              }
            });
          }
        });
        
        if (synonyms.length > 0) {
          return synonyms;
        }
      }
    } catch (e) {
      console.warn('Wiktionary API non disponibile:', e);
    }

    // 5. Ultimo tentativo con MyMemory Translation per sinonimi di contesto
    try {
      const myMemory = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=it|en`);
      if (myMemory.ok) {
        const data = await myMemory.json();
        if (data.responseData && data.responseData.translatedText) {
          // Usa la traduzione per cercare sinonimi in inglese e poi ritraduci
          const translation = data.responseData.translatedText.toLowerCase();
          if (translation !== cleanWord) {
            const englishSyns = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(translation)}&max=5`);
            const englishData = await englishSyns.json();
            
            if (englishData && englishData.length > 0) {
              // Traduci i sinonimi inglesi in italiano
              const synonyms: string[] = [];
              for (const syn of englishData.slice(0, 3)) {
                try {
                  const backTranslate = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(syn.word)}&langpair=en|it`);
                  const backData = await backTranslate.json();
                  if (backData.responseData && backData.responseData.translatedText) {
                    const italianSyn = backData.responseData.translatedText.toLowerCase();
                    if (italianSyn !== cleanWord && !synonyms.includes(italianSyn)) {
                      synonyms.push(italianSyn);
                    }
                  }
                } catch (e) {
                  // Ignora errori per singole traduzioni
                }
              }
              
              if (synonyms.length > 0) {
                return synonyms;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('MyMemory API non disponibile:', e);
    }
    
    // Se nessuna API funziona, restituisci array vuoto
    return [];
    
  } catch (error) {
    console.warn('Errore generale nel recupero dei sinonimi:', error);
    return [];
  }
}

/**
 * Suggerisce come migliorare un dialogo specifico
 */
export function improveDialogue(dialogue: string): string[] {
  if (!dialogue || dialogue.trim().length === 0) {
    return ["Inserisci un dialogo per ricevere suggerimenti."];
  }
  
  const suggestions: string[] = [];
  
  // Controllo lunghezza
  if (dialogue.length > 150) {
    suggestions.push("Il dialogo è piuttosto lungo. Considera di spezzarlo in frasi più brevi.");
  }
  
  // Verifica espressività emotiva
  if (!/[!?]/.test(dialogue)) {
    suggestions.push("Aggiungi più espressività al dialogo usando punti esclamativi o interrogativi.");
  }
  
  // Se mancano suggerimenti, offri consigli generali
  if (suggestions.length === 0) {
    suggestions.push("Aggiungi dettagli su gesti o tono di voce per rendere il dialogo più espressivo.");
  }
  
  return suggestions;
}