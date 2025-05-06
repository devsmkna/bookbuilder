export type AchievementCategory = 
  | 'writing' 
  | 'character' 
  | 'world' 
  | 'commitment' 
  | 'milestone' 
  | 'challenge';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xp: number;
  unlocked: boolean;
  progress?: number;  // 0-100
  condition: {
    type: StatType;
    threshold: number;
  };
  icon?: string; // Nome icona di Lucide React
  badge?: string; // URL a immagine badge o nome CSS classe
  unlockDate?: string; // Data di sblocco in formato ISO
}

export interface LevelDefinition {
  level: number;
  xpRequired: number;
  unlockedFeatures: string[];
  title?: string; // Titolo livello (es. "Principiante", "Scrittore Esperto")
  badge?: string; // Badge o icona per questo livello
}

export type StatType = 
  | 'wordCount' 
  | 'wordCountTotal' 
  | 'wordCountToday'
  | 'wordCountWeek'
  | 'characterCount' 
  | 'placeCount' 
  | 'eventCount'
  | 'raceCount'
  | 'sessionsCompleted' 
  | 'wordsPerDay' 
  | 'dailyGoalStreak'
  | 'writeStreak' 
  | 'writeTime'
  | 'writingSpeed';

export interface UserStats {
  // Conteggi totali
  wordCount: number;         // Parole scritte in totale
  wordCountToday: number;    // Parole scritte oggi
  wordCountWeek: number;     // Parole scritte questa settimana
  characterCount: number;    // Personaggi creati
  placeCount: number;        // Luoghi creati
  eventCount: number;        // Eventi della storia creati 
  raceCount: number;         // Razze create
  
  // Metriche di impegno
  sessionsCompleted: number; // Sessioni di scrittura completate
  wordsPerDay: number;       // Media di parole al giorno
  dailyGoalReached: boolean; // Se l'obiettivo giornaliero è stato raggiunto oggi
  dailyGoalStreak: number;   // Giorni consecutivi con obiettivo raggiunto
  writeStreak: number;       // Giorni consecutivi di scrittura
  longestWriteStreak: number;// Streak più lunga di sempre
  
  // Tempo di scrittura
  writeTime: number;         // Minuti totali di scrittura
  writingSpeed: number;      // Parole al minuto (media)
  
  // Preferenze dell'utente
  dailyWordGoal: number;     // Obiettivo giornaliero di parole
  theme: string;             // Tema preferito
}

export interface WritingSession {
  date: string;              // Data in formato ISO
  wordCount: number;         // Parole scritte in questa sessione
  duration: number;          // Durata sessione in minuti
  startTime: string;         // Orario inizio in formato ISO
  endTime?: string;          // Orario fine in formato ISO
}