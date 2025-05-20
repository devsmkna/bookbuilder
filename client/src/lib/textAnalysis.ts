/**
 * Servizio di analisi del testo usando algoritmi locali
 * Implementa funzioni per l'analisi di qualità del testo, suggerimenti stilistici,
 * suggerimenti per dialoghi e sinonimi
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
  "pensare": ["riflettere", "meditare", "considerare", "contemplare", "ponderare"],
  // Altri sinonimi possono essere aggiunti
};

// Parole comuni che potrebbero essere sostituite con alternative più interessanti
const commonWords = [
  "molto", "davvero", "certamente", "sempre", "andare", "fare", "dire", "vedere", "buono", "bello",
  "brutto", "cattivo", "grande", "piccolo", "forte", "debole", "veloce", "lento", "facile", "difficile"
];

// Frasi di transizione per migliorare il flusso del testo
const transitionPhrases = [
  "D'altra parte", "Inoltre", "Di conseguenza", "Infatti", "Tuttavia", 
  "In altre parole", "Nonostante ciò", "A questo proposito", "In sintesi",
  "In conclusione", "In particolare", "Per esempio", "Al contrario"
];

// Caratteristiche di dialoghi efficaci
const dialogueCharacteristics = [
  "Mostra invece di dire",
  "Usa inflessioni uniche per ogni personaggio",
  "Integra descrizioni dell'ambiente",
  "Usa tag di dialogo variati",
  "Rifletti lo stato emotivo nel dialogo",
  "Usa sottotesto e non fare dire tutto esplicitamente",
  "Usa pause e silenzi strategicamente"
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
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
  const avgSentenceLength = wordCount / sentenceCount;
  const uniqueWords = new Set(words);
  const uniqueWordsPercentage = (uniqueWords.size / wordCount) * 100;
  
  // Calcola punteggio
  let score = 60; // Punteggio base
  
  // Premia la varietà di parole
  if (uniqueWordsPercentage > 70) score += 10;
  else if (uniqueWordsPercentage > 50) score += 5;
  
  // Premia la lunghezza media delle frasi appropriata
  if (avgSentenceLength > 5 && avgSentenceLength < 20) score += 5;
  else if (avgSentenceLength > 20) score -= 5;
  
  // Lunghezza appropriata dei paragrafi
  if (paragraphs.length > 1 && wordCount / paragraphs.length < 100) score += 5;
  else if (paragraphs.length === 1 && wordCount > 100) score -= 5;
  
  // Inizio a raccogliere punti di forza e debolezza
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
    weaknesses.push("Alcune frasi sono molto lunghe e potrebbero risultare difficili da seguire");
    suggestions.push("Considera di spezzare le frasi più lunghe per migliorare la leggibilità");
  }
  
  // Verifica frasi troppo brevi in sequenza
  let shortSentencesInARow = 0;
  for (const sentence of sentences) {
    const words = sentence.split(' ').length;
    if (words < 5) {
      shortSentencesInARow++;
      if (shortSentencesInARow > 2) {
        weaknesses.push("Troppe frasi brevi consecutive possono creare un ritmo spezzato");
        suggestions.push("Prova a combinare alcune frasi brevi usando congiunzioni");
        break;
      }
    } else {
      shortSentencesInARow = 0;
    }
  }
  
  // Suggerimenti per transizioni
  if (paragraphs.length > 1) {
    let hasTransitions = false;
    for (const phrase of transitionPhrases) {
      if (text.toLowerCase().includes(phrase.toLowerCase())) {
        hasTransitions = true;
        break;
      }
    }
    
    if (!hasTransitions) {
      suggestions.push("Aggiungi frasi di transizione per collegare meglio i paragrafi");
    } else {
      strengths.push("Buon uso delle transizioni tra i paragrafi");
    }
  }
  
  // Verifica uso di parole comuni che potrebbero essere sostituite
  const overusedCommonWords = commonWords.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    return matches && matches.length > 2;
  });
  
  if (overusedCommonWords.length > 0) {
    weaknesses.push(`Uso eccessivo di parole comuni: ${overusedCommonWords.slice(0, 3).join(', ')}${overusedCommonWords.length > 3 ? '...' : ''}`);
    suggestions.push("Sostituisci alcune parole comuni con alternative più specifiche o vivide");
  }
  
  // Analisi dei dialoghi, se presenti
  if (text.includes('"') || text.includes('"') || text.includes('«')) {
    const dialogueResult = analyzeDialogues(text);
    
    if (dialogueResult.score < 60) {
      weaknesses.push("I dialoghi potrebbero essere migliorati");
      suggestions.push(...dialogueResult.suggestions.slice(0, 2));
    } else if (dialogueResult.score > 75) {
      strengths.push("Dialoghi ben costruiti");
    }
  }
  
  // Assicurati di avere almeno un punto di forza
  if (strengths.length === 0) {
    if (wordCount > 200) {
      strengths.push("Buona lunghezza del testo");
    } else if (sentences.every(s => s.trim().endsWith('.'))) {
      strengths.push("Punteggiatura corretta");
    } else {
      strengths.push("Testo strutturato in paragrafi");
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
  const matches = Array.from(text.matchAll(dialogueRegex));
  const dialogues = matches.map(match => match[1] || match[2] || match[3]);
  
  if (dialogues.length === 0) {
    return {
      score: 0,
      suggestions: ["Non sono stati trovati dialoghi da analizzare."],
      emotionalImpact: 0,
      naturalness: 0
    };
  }
  
  // Analizza la lunghezza dei dialoghi
  const avgDialogueLength = dialogues.reduce((sum, d) => sum + d.length, 0) / dialogues.length;
  
  // Calcola statistiche
  const veryLongDialogues = dialogues.filter(d => d.length > 150).length;
  const shortDialogues = dialogues.filter(d => d.length < 15).length;
  const containsEmotionWords = dialogues.filter(d => 
    /triste|felice|arrabbia|gioi|content|furioso|depress|esulta|esclam|grid|sussurr|mormor|sospir/i.test(d)
  ).length;
  
  // Valuta la varietà delle espressioni di dialogo
  const dialogueTags = text.match(/\b(disse|rispose|chiese|esclamò|urlò|sussurrò|mormorò|sospirò|borbottò|replicò|domandò)\b/gi) || [];
  const uniqueDialogueTags = new Set(dialogueTags.map(t => t.toLowerCase()));
  
  let score = 65; // Punteggio base
  let emotionalImpact = 50;
  let naturalness = 60;
  
  const suggestions: string[] = [];
  
  // Valuta la naturalezza
  if (avgDialogueLength > 100) {
    score -= 10;
    naturalness -= 15;
    suggestions.push("I dialoghi sono mediamente troppo lunghi. Nella vita reale, le persone tendono a parlare con frasi più brevi.");
  } else if (avgDialogueLength < 20 && dialogues.length > 3) {
    naturalness += 10;
  }
  
  // Penalizza dialoghi troppo lunghi
  if (veryLongDialogues > dialogues.length / 3) {
    score -= 15;
    suggestions.push("Alcuni dialoghi sono eccessivamente lunghi. Considera di spezzarli o aggiungere reazioni degli altri personaggi.");
  }
  
  // Valuta l'impatto emotivo
  if (containsEmotionWords > dialogues.length / 4) {
    emotionalImpact += 20;
    score += 10;
  } else {
    emotionalImpact -= 10;
    suggestions.push("I dialoghi potrebbero beneficiare di più espressività emotiva. Mostra come i personaggi si sentono.");
  }
  
  // Verifica la varietà nei tag di dialogo
  if (dialogueTags.length > 3 && uniqueDialogueTags.size > 2) {
    score += 5;
    naturalness += 10;
  } else if (dialogueTags.length > 3) {
    suggestions.push("Usa tag di dialogo più variati invece di ripetere sempre 'disse' o 'rispose'.");
  }
  
  // Verifica se ci sono dialoghi che si alternano senza descrizioni
  let consecutiveDialogues = 0;
  let maxConsecutiveDialogues = 0;
  
  for (let i = 1; i < matches.length; i++) {
    const prevEnd = matches[i-1].index! + matches[i-1][0].length;
    const currStart = matches[i].index!;
    const textBetween = text.substring(prevEnd, currStart);
    
    if (textBetween.trim().length < 10) {
      consecutiveDialogues++;
    } else {
      consecutiveDialogues = 0;
    }
    
    maxConsecutiveDialogues = Math.max(maxConsecutiveDialogues, consecutiveDialogues);
  }
  
  if (maxConsecutiveDialogues > 4) {
    score -= 5;
    suggestions.push("Ci sono molti dialoghi consecutivi senza descrizioni o contesto. Aggiungi dettagli sulle reazioni fisiche, l'ambiente o i pensieri dei personaggi.");
  }
  
  // Controlla se ci sono segnali di emozione nei dialoghi
  const emotionSignals = [
    "!", "?!", "...", "?", "—"
  ];
  
  let hasEmotionSignals = false;
  for (const signal of emotionSignals) {
    if (dialogues.some(d => d.includes(signal))) {
      hasEmotionSignals = true;
      break;
    }
  }
  
  if (!hasEmotionSignals && dialogues.length > 2) {
    emotionalImpact -= 10;
    suggestions.push("I dialoghi mancano di segnali di emozione come punti esclamativi, puntini di sospensione o trattini per le pause.");
  }
  
  // Se non ci sono abbastanza suggerimenti, aggiungi qualche consiglio generale
  if (suggestions.length < 2) {
    const randomTip = dialogueCharacteristics[Math.floor(Math.random() * dialogueCharacteristics.length)];
    suggestions.push(`Consiglio per dialoghi efficaci: ${randomTip}`);
  }
  
  // Assicurati che i valori siano nel range corretto
  score = Math.min(100, Math.max(0, Math.round(score)));
  emotionalImpact = Math.min(100, Math.max(0, Math.round(emotionalImpact)));
  naturalness = Math.min(100, Math.max(0, Math.round(naturalness)));
  
  return {
    score,
    suggestions,
    emotionalImpact,
    naturalness
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
  
  // Stima readability (semplificazione dell'indice di Gulpease per l'italiano)
  const letterCount = text.replace(/\s/g, '').length;
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  
  // Formula semplificata, più alto è il valore più facile è da leggere (scala da 0 a 100)
  const readability = 89 + (300 * (sentenceCount / wordCount)) - (10 * (letterCount / wordCount));
  
  // Calcola punteggio
  let score = 60; // Punteggio base
  
  // Premia la varietà di parole
  if (wordVariety > 70) score += 15;
  else if (wordVariety > 50) score += 8;
  else if (wordVariety < 40) score -= 10;
  
  // Premia la varietà nella lunghezza delle frasi
  if (sentenceLengthVariety > 4) score += 10;
  else if (sentenceLengthVariety < 2) score -= 5;
  
  // Readability nel range ottimale (40-60 è un buon compromesso per la narrativa)
  if (readability > 40 && readability < 60) score += 10;
  else if (readability < 30 || readability > 70) score -= 5;
  
  // Raccogli suggerimenti
  const suggestions: string[] = [];
  
  if (wordVariety < 50) {
    suggestions.push("Aumenta la varietà del vocabolario utilizzando sinonimi e termini più specifici.");
  }
  
  if (sentenceLengthVariety < 3) {
    suggestions.push("Varia la lunghezza delle frasi per creare un ritmo più interessante.");
  }
  
  if (avgSentenceLength > 25) {
    suggestions.push("Le tue frasi sono mediamente molto lunghe. Considera di spezzarne alcune per migliorare la leggibilità.");
  } else if (avgSentenceLength < 8 && sentences.length > 5) {
    suggestions.push("Le tue frasi sono mediamente molto brevi. Prova a combinarne alcune per creare un flusso più elegante.");
  }
  
  if (readability < 35) {
    suggestions.push("Il testo risulta piuttosto complesso da leggere. Considera di semplificare alcune frasi.");
  } else if (readability > 70) {
    suggestions.push("Il testo è molto semplice. Per una narrativa più ricca, potresti aggiungere descrizioni più elaborate.");
  }
  
  // Se mancano suggerimenti, aggiungi consigli generali
  if (suggestions.length === 0) {
    suggestions.push("Prova a incorporare più immagini sensoriali per rendere il testo più vivido.");
    suggestions.push("Considera di variare l'inizio delle frasi per evitare ripetizioni strutturali.");
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
    suggestions.push("Il dialogo è piuttosto lungo. Nella conversazione reale, le persone tendono a parlare con frasi più brevi.");
  }
  
  // Verifica espressività emotiva
  if (!/[!?]/.test(dialogue)) {
    suggestions.push("Aggiungi più espressività al dialogo usando punti esclamativi o interrogativi dove appropriato.");
  }
  
  // Verifica uso di avverbi "ly" in italiano "-mente"
  if (/\w+mente\b/i.test(dialogue)) {
    suggestions.push("Sostituisci gli avverbi in '-mente' con descrizioni più vivide dell'azione.");
  }
  
  // Verifica cliché nei dialoghi
  const dialogueClichés = [
    "come stai", "che succede", "cosa sta succedendo", "tutto bene", 
    "non lo so", "non ne ho idea", "mi dispiace", "scusa",
    "non preoccuparti", "fidati di me"
  ];
  
  for (const cliché of dialogueClichés) {
    if (dialogue.toLowerCase().includes(cliché)) {
      suggestions.push(`Il dialogo contiene espressioni comuni come "${cliché}". Prova a rendere più unico il modo in cui il personaggio si esprime.`);
      break;
    }
  }
  
  // Verifica pause e ritmo
  if (!dialogue.includes(",") && !dialogue.includes("...") && dialogue.length > 60) {
    suggestions.push("Aggiungi pause nel dialogo usando virgole o puntini di sospensione per migliorare il ritmo.");
  }
  
  // Se mancano suggerimenti, offri consigli generali
  if (suggestions.length === 0) {
    const generalTips = [
      "Aggiungi un gesto o un'azione che il personaggio compie mentre parla per rendere la scena più dinamica.",
      "Considera di mostrare il sottotesto: ciò che il personaggio pensa davvero ma non dice apertamente.",
      "Usa un linguaggio che rifletta la personalità unica del personaggio.",
      "Aggiungi dettagli sul tono di voce per trasmettere emozione."
    ];
    
    suggestions.push(generalTips[Math.floor(Math.random() * generalTips.length)]);
  }
  
  return suggestions;
}