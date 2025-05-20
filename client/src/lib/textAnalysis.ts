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
  "buono": ["eccellente", "ottimo", "pregevole", "pregiato", "squisito"],
  "cattivo": ["malvagio", "spiacevole", "terribile", "scadente", "mediocre"],
  "guardare": ["osservare", "fissare", "esaminare", "scrutare", "contemplare"],
  "camminare": ["passeggiare", "marciare", "incedere", "avanzare", "procedere"],
  "veloce": ["rapido", "celere", "svelto", "lesto", "fulmineo"],
  "lento": ["pigro", "tardo", "placido", "flemmatico", "indolente"],
  "dire": ["affermare", "dichiarare", "esprimere", "comunicare", "proferire"],
  "vedere": ["scorgere", "notare", "avvistare", "individuare", "rilevare"],
  "grande": ["enorme", "colossale", "vasto", "immenso", "gigantesco"],
  "piccolo": ["minuscolo", "minimo", "ridotto", "esiguo", "limitato"],
  "bello": ["splendido", "magnifico", "stupendo", "meraviglioso", "incantevole"],
  "brutto": ["orribile", "orrendo", "sgradevole", "ripugnante", "terribile"],
  "felice": ["contento", "allegro", "gioioso", "lieto", "raggiante"],
  "triste": ["malinconico", "afflitto", "mesto", "abbattuto", "sconsolato"],
  "parlare": ["conversare", "dialogare", "discutere", "chiacchierare", "conferire"],
  "pensare": ["riflettere", "meditare", "considerare", "contemplare", "ponderare"]
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
    
    // Suggerisci sinonimi per le parole ripetute
    repeatedWords.slice(0, 3).forEach(word => {
      const synonyms = findSynonyms(word);
      if (synonyms.length > 0) {
        suggestions.push(`Sostituisci "${word}" con: ${synonyms.join(', ')}`);
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
export function findSynonyms(word: string): string[] {
  // Pulisci la parola
  const cleanWord = word.toLowerCase().trim();
  
  // Cerca nella nostra base di sinonimi
  if (synonymsDatabase[cleanWord]) {
    return synonymsDatabase[cleanWord];
  }
  
  // Prova a trovare sinonimi per forme simili
  for (const key of Object.keys(synonymsDatabase)) {
    // Verifica se la parola inizia con la stessa radice
    if (cleanWord.startsWith(key) || key.startsWith(cleanWord)) {
      return synonymsDatabase[key];
    }
  }
  
  return [];
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