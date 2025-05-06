import { Achievement, LevelDefinition, UserStats, StatType } from './types';
import { 
  Book, 
  Award, 
  Trophy, 
  Crown, 
  Star, 
  Flame, 
  Zap, 
  Coffee, 
  Rocket, 
  Medal, 
  BookOpen,
  Map,
  Users,
  Calendar,
  BadgeCheck,
  Sparkles
} from 'lucide-react';

// Definizione dei livelli e requisiti
export const XP_LEVELS: Record<number, LevelDefinition> = {
  1: {
    level: 1,
    xpRequired: 0,
    title: "Aspirante Scrittore",
    unlockedFeatures: ['Editor di Base', 'Formattazione Markdown'],
    badge: 'level-1'
  },
  2: {
    level: 2,
    xpRequired: 100,
    title: "Scrittore Dilettante",
    unlockedFeatures: ['Creazione Personaggi', 'Notifiche di Progressi'],
    badge: 'level-2'
  },
  3: {
    level: 3,
    xpRequired: 250,
    title: "Narratore",
    unlockedFeatures: ['Costruzione del Mondo', 'Tracking Giornaliero'],
    badge: 'level-3'
  },
  4: {
    level: 4,
    xpRequired: 500,
    title: "Narratore Esperto",
    unlockedFeatures: ['Collegamenti tra Personaggi e Luoghi', 'Badge Speciali'],
    badge: 'level-4'
  },
  5: {
    level: 5,
    xpRequired: 1000,
    title: "Maestro del Racconto",
    unlockedFeatures: ['Statistiche di Scrittura Avanzate', 'Suggerimenti Personalizzati'],
    badge: 'level-5'
  },
  6: {
    level: 6,
    xpRequired: 2000,
    title: "Compositore di Storie",
    unlockedFeatures: ['Template Avanzati per lo Sviluppo dei Personaggi', 'Obiettivi Personalizzati'],
    badge: 'level-6'
  },
  7: {
    level: 7,
    xpRequired: 3500,
    title: "Romanziere",
    unlockedFeatures: ['Supporto a Mappe Multiple', 'Sfide di Scrittura'],
    badge: 'level-7'
  },
  8: {
    level: 8,
    xpRequired: 5000,
    title: "Scrittore Prolifico",
    unlockedFeatures: ['Creazione Timeline', 'Analisi del Testo'],
    badge: 'level-8'
  },
  9: {
    level: 9,
    xpRequired: 7500,
    title: "Autore Visionario",
    unlockedFeatures: ['Rete di Relazioni tra Personaggi', 'Consigli Avanzati'],
    badge: 'level-9'
  },
  10: {
    level: 10,
    xpRequired: 10000,
    title: "Maestro Letterario",
    unlockedFeatures: ['Status di Maestro Scrittore', 'Temi Personalizzati', 'Icone Esclusive'],
    badge: 'level-10'
  }
};

// Obiettivi giornalieri predefiniti (parole)
export const DAILY_GOALS = [
  { label: "Leggero", value: 250 },
  { label: "Moderato", value: 500 },
  { label: "Standard", value: 1000 },
  { label: "Sfidante", value: 2000 },
  { label: "NaNoWriMo", value: 1667 },  // National Novel Writing Month (50k parole/30 giorni)
  { label: "Personalizzato", value: 0 }
];

// Definizione di categorie di achievement con colori e descrizioni
export const ACHIEVEMENT_CATEGORIES = {
  writing: {
    name: "Scrittura",
    description: "Raggiungi diversi traguardi nella scrittura",
    color: "text-blue-500",
    icon: BookOpen
  },
  character: { 
    name: "Personaggi",
    description: "Crea e sviluppa personaggi per la tua storia",
    color: "text-purple-500",
    icon: Users
  },
  world: {
    name: "Ambientazione",
    description: "Costruisci un mondo dettagliato per la tua narrazione",
    color: "text-green-500",
    icon: Map
  },
  commitment: {
    name: "Costanza",
    description: "Mantieni l'abitudine di scrivere regolarmente",
    color: "text-amber-500",
    icon: Flame
  },
  milestone: {
    name: "Traguardi",
    description: "Celebra i grandi traguardi del tuo percorso",
    color: "text-red-500",
    icon: Trophy
  },
  challenge: {
    name: "Sfide",
    description: "Completa sfide speciali per spingere la tua creatività",
    color: "text-indigo-500",
    icon: Zap
  }
};

// Lista degli obiettivi
export const ACHIEVEMENTS: Achievement[] = [
  // Obiettivi di scrittura (Word Count)
  {
    id: 'writing-1',
    title: 'Prime Parole',
    description: 'Scrivi le tue prime 100 parole',
    category: 'writing',
    xp: 10,
    unlocked: false,
    icon: 'pencil',
    condition: {
      type: 'wordCount',
      threshold: 100
    }
  },
  {
    id: 'writing-2',
    title: 'Autore in Erba',
    description: 'Raggiungi 500 parole nel tuo scritto',
    category: 'writing',
    xp: 20,
    unlocked: false,
    icon: 'book',
    condition: {
      type: 'wordCount',
      threshold: 500
    }
  },
  {
    id: 'writing-3',
    title: 'Primo Capitolo',
    description: 'Raggiungi 1.000 parole nel tuo scritto',
    category: 'writing',
    xp: 30,
    unlocked: false,
    icon: 'book-open',
    condition: {
      type: 'wordCount',
      threshold: 1000
    }
  },
  {
    id: 'writing-4',
    title: 'Racconto Breve',
    description: 'Raggiungi 2.500 parole nel tuo scritto',
    category: 'writing',
    xp: 50,
    unlocked: false,
    icon: 'book-open',
    condition: {
      type: 'wordCount',
      threshold: 2500
    }
  },
  {
    id: 'writing-5',
    title: 'Scrittore Prolisso',
    description: 'Raggiungi 5.000 parole nel tuo scritto',
    category: 'writing',
    xp: 75,
    unlocked: false,
    icon: 'book',
    condition: {
      type: 'wordCount',
      threshold: 5000
    }
  },
  {
    id: 'writing-6',
    title: 'Novellista',
    description: 'Raggiungi 10.000 parole nel tuo scritto',
    category: 'writing',
    xp: 100,
    unlocked: false,
    icon: 'library',
    condition: {
      type: 'wordCount',
      threshold: 10000
    }
  },
  {
    id: 'writing-7',
    title: 'Romanziere',
    description: 'Raggiungi 25.000 parole nel tuo scritto',
    category: 'writing',
    xp: 200,
    unlocked: false,
    icon: 'book-text',
    condition: {
      type: 'wordCount',
      threshold: 25000
    }
  },
  {
    id: 'writing-8',
    title: 'Maestro della Prosa',
    description: 'Raggiungi 50.000 parole nel tuo scritto',
    category: 'writing',
    xp: 300,
    unlocked: false,
    icon: 'book-copy',
    condition: {
      type: 'wordCount',
      threshold: 50000
    }
  },
  {
    id: 'writing-9',
    title: 'Tolkien in Erba',
    description: 'Raggiungi 100.000 parole nel tuo scritto',
    category: 'writing',
    xp: 500,
    unlocked: false,
    icon: 'books',
    condition: {
      type: 'wordCount',
      threshold: 100000
    }
  },
  
  // Obiettivi giornalieri
  {
    id: 'daily-1',
    title: 'Scintilla Creativa',
    description: 'Scrivi almeno 100 parole in un giorno',
    category: 'commitment',
    xp: 10,
    unlocked: false,
    icon: 'zap',
    condition: {
      type: 'wordCountToday',
      threshold: 100
    }
  },
  {
    id: 'daily-2',
    title: 'Flusso di Idee',
    description: 'Scrivi almeno 500 parole in un giorno',
    category: 'commitment',
    xp: 20,
    unlocked: false,
    icon: 'zap',
    condition: {
      type: 'wordCountToday',
      threshold: 500
    }
  },
  {
    id: 'daily-3',
    title: 'Ispirazione Potente',
    description: 'Scrivi almeno 1.000 parole in un giorno',
    category: 'commitment',
    xp: 30,
    unlocked: false,
    icon: 'rocket',
    condition: {
      type: 'wordCountToday',
      threshold: 1000
    }
  },
  {
    id: 'daily-4',
    title: 'Maratona di Scrittura',
    description: 'Scrivi almeno 2.000 parole in un giorno',
    category: 'commitment',
    xp: 50,
    unlocked: false,
    icon: 'rocket',
    condition: {
      type: 'wordCountToday',
      threshold: 2000
    }
  },
  {
    id: 'daily-5',
    title: 'Flow State',
    description: 'Scrivi almeno 3.000 parole in un giorno',
    category: 'commitment',
    xp: 75,
    unlocked: false,
    icon: 'wind',
    condition: {
      type: 'wordCountToday',
      threshold: 3000
    }
  },
  {
    id: 'daily-6',
    title: 'Trance Creativa',
    description: 'Scrivi almeno 5.000 parole in un giorno',
    category: 'commitment',
    xp: 100,
    unlocked: false,
    icon: 'zap',
    condition: {
      type: 'wordCountToday',
      threshold: 5000
    }
  },
  
  // Streaks e costanza
  {
    id: 'streak-1',
    title: 'Primi Passi',
    description: 'Scrivi per 3 giorni consecutivi',
    category: 'commitment',
    xp: 30,
    unlocked: false,
    icon: 'calendar',
    condition: {
      type: 'writeStreak',
      threshold: 3
    }
  },
  {
    id: 'streak-2',
    title: 'Abitudine in Formazione',
    description: 'Scrivi per 7 giorni consecutivi',
    category: 'commitment',
    xp: 75,
    unlocked: false,
    icon: 'calendar-check',
    condition: {
      type: 'writeStreak',
      threshold: 7
    }
  },
  {
    id: 'streak-3',
    title: 'Disciplina dello Scrittore',
    description: 'Scrivi per 14 giorni consecutivi',
    category: 'commitment',
    xp: 150,
    unlocked: false,
    icon: 'calendar-check',
    condition: {
      type: 'writeStreak',
      threshold: 14
    }
  },
  {
    id: 'streak-4',
    title: 'Routine Consolidata',
    description: 'Scrivi per 21 giorni consecutivi',
    category: 'commitment',
    xp: 200,
    unlocked: false,
    icon: 'calendar-heart',
    condition: {
      type: 'writeStreak',
      threshold: 21
    }
  },
  {
    id: 'streak-5',
    title: 'Maestro della Costanza',
    description: 'Scrivi per 30 giorni consecutivi',
    category: 'commitment',
    xp: 300,
    unlocked: false,
    icon: 'calendar-star',
    condition: {
      type: 'writeStreak',
      threshold: 30
    }
  },
  
  // Obiettivi giornalieri raggiunti
  {
    id: 'goal-1',
    title: 'Primo Obiettivo',
    description: 'Raggiungi il tuo obiettivo giornaliero per la prima volta',
    category: 'commitment',
    xp: 20,
    unlocked: false,
    icon: 'target',
    condition: {
      type: 'dailyGoalStreak',
      threshold: 1
    }
  },
  {
    id: 'goal-2',
    title: 'Costanza Iniziale',
    description: 'Raggiungi il tuo obiettivo giornaliero per 3 giorni consecutivi',
    category: 'commitment',
    xp: 40,
    unlocked: false,
    icon: 'target',
    condition: {
      type: 'dailyGoalStreak',
      threshold: 3
    }
  },
  {
    id: 'goal-3',
    title: 'Determinazione',
    description: 'Raggiungi il tuo obiettivo giornaliero per 7 giorni consecutivi',
    category: 'commitment',
    xp: 100,
    unlocked: false,
    icon: 'award',
    condition: {
      type: 'dailyGoalStreak',
      threshold: 7
    }
  },
  {
    id: 'goal-4',
    title: 'Inflessibile',
    description: 'Raggiungi il tuo obiettivo giornaliero per 14 giorni consecutivi',
    category: 'commitment',
    xp: 200,
    unlocked: false,
    icon: 'trophy',
    condition: {
      type: 'dailyGoalStreak',
      threshold: 14
    }
  },
  {
    id: 'goal-5',
    title: 'Dominatore di Obiettivi',
    description: 'Raggiungi il tuo obiettivo giornaliero per 30 giorni consecutivi',
    category: 'commitment',
    xp: 400,
    unlocked: false,
    icon: 'medal',
    condition: {
      type: 'dailyGoalStreak',
      threshold: 30
    }
  },
  
  // Personaggi
  {
    id: 'character-1',
    title: 'Primo Personaggio',
    description: 'Crea il tuo primo personaggio',
    category: 'character',
    xp: 25,
    unlocked: false,
    icon: 'user',
    condition: {
      type: 'characterCount',
      threshold: 1
    }
  },
  {
    id: 'character-2',
    title: 'Cast di Supporto',
    description: 'Crea 3 diversi personaggi',
    category: 'character',
    xp: 50,
    unlocked: false,
    icon: 'users',
    condition: {
      type: 'characterCount',
      threshold: 3
    }
  },
  {
    id: 'character-3',
    title: 'Direttore del Cast',
    description: 'Crea 5 diversi personaggi',
    category: 'character',
    xp: 75,
    unlocked: false,
    icon: 'users',
    condition: {
      type: 'characterCount',
      threshold: 5
    }
  },
  {
    id: 'character-4',
    title: 'Narratore Popolato',
    description: 'Crea 10 diversi personaggi',
    category: 'character',
    xp: 100,
    unlocked: false,
    icon: 'users',
    condition: {
      type: 'characterCount',
      threshold: 10
    }
  },
  {
    id: 'character-5',
    title: 'Creatore di Vite',
    description: 'Crea 20 diversi personaggi',
    category: 'character',
    xp: 150,
    unlocked: false,
    icon: 'users',
    condition: {
      type: 'characterCount',
      threshold: 20
    }
  },
  
  // Luoghi
  {
    id: 'place-1',
    title: 'Architetto',
    description: 'Crea il tuo primo luogo',
    category: 'world',
    xp: 25,
    unlocked: false,
    icon: 'map-pin',
    condition: {
      type: 'placeCount',
      threshold: 1
    }
  },
  {
    id: 'place-2',
    title: 'Cartografo',
    description: 'Crea 3 diversi luoghi',
    category: 'world',
    xp: 50,
    unlocked: false,
    icon: 'map',
    condition: {
      type: 'placeCount',
      threshold: 3
    }
  },
  {
    id: 'place-3',
    title: 'Esploratore',
    description: 'Crea 5 diversi luoghi',
    category: 'world',
    xp: 75,
    unlocked: false,
    icon: 'map',
    condition: {
      type: 'placeCount',
      threshold: 5
    }
  },
  {
    id: 'place-4',
    title: 'Maestro Geografo',
    description: 'Crea 10 diversi luoghi',
    category: 'world',
    xp: 100,
    unlocked: false,
    icon: 'globe',
    condition: {
      type: 'placeCount',
      threshold: 10
    }
  },
  {
    id: 'place-5',
    title: 'Creatore di Mondi',
    description: 'Crea 20 diversi luoghi',
    category: 'world',
    xp: 150,
    unlocked: false,
    icon: 'globe',
    condition: {
      type: 'placeCount',
      threshold: 20
    }
  },
  
  // Razze
  {
    id: 'race-1',
    title: 'Biologo Fantastico',
    description: 'Crea la tua prima razza',
    category: 'world',
    xp: 25,
    unlocked: false,
    icon: 'leaf',
    condition: {
      type: 'raceCount',
      threshold: 1
    }
  },
  {
    id: 'race-2',
    title: 'Antropologo Creativo',
    description: 'Crea 3 diverse razze',
    category: 'world',
    xp: 50,
    unlocked: false,
    icon: 'tree',
    condition: {
      type: 'raceCount',
      threshold: 3
    }
  },
  {
    id: 'race-3',
    title: 'Diversità Fantastica',
    description: 'Crea 5 diverse razze',
    category: 'world',
    xp: 100,
    unlocked: false,
    icon: 'trees',
    condition: {
      type: 'raceCount',
      threshold: 5
    }
  },
  
  // Eventi
  {
    id: 'event-1',
    title: 'Primo Atto',
    description: 'Crea il tuo primo evento nella storia',
    category: 'milestone',
    xp: 25,
    unlocked: false,
    icon: 'star',
    condition: {
      type: 'eventCount',
      threshold: 1
    }
  },
  {
    id: 'event-2',
    title: 'Sviluppo della Trama',
    description: 'Crea 3 eventi nella storia',
    category: 'milestone',
    xp: 50,
    unlocked: false,
    icon: 'stars',
    condition: {
      type: 'eventCount',
      threshold: 3
    }
  },
  {
    id: 'event-3',
    title: 'Intrecciatore di Storie',
    description: 'Crea 5 eventi nella storia',
    category: 'milestone',
    xp: 75,
    unlocked: false,
    icon: 'sparkles',
    condition: {
      type: 'eventCount',
      threshold: 5
    }
  },
  {
    id: 'event-4',
    title: 'Maestro del Racconto',
    description: 'Crea 10 eventi nella storia',
    category: 'milestone',
    xp: 100,
    unlocked: false,
    icon: 'sparkles',
    condition: {
      type: 'eventCount',
      threshold: 10
    }
  },
  
  // Scrittura veloce
  {
    id: 'speed-1',
    title: 'Flusso Iniziale',
    description: 'Scrivi con una velocità media di 20 parole al minuto',
    category: 'challenge',
    xp: 30,
    unlocked: false,
    icon: 'timer',
    condition: {
      type: 'writingSpeed',
      threshold: 20
    }
  },
  {
    id: 'speed-2',
    title: 'Pensiero Rapido',
    description: 'Scrivi con una velocità media di 40 parole al minuto',
    category: 'challenge',
    xp: 60,
    unlocked: false,
    icon: 'timer',
    condition: {
      type: 'writingSpeed',
      threshold: 40
    }
  },
  {
    id: 'speed-3',
    title: 'Dattilografo Esperto',
    description: 'Scrivi con una velocità media di 60 parole al minuto',
    category: 'challenge',
    xp: 100,
    unlocked: false,
    icon: 'stopwatch',
    condition: {
      type: 'writingSpeed',
      threshold: 60
    }
  },
  
  // Tempo di scrittura
  {
    id: 'time-1',
    title: 'Primo Sprint',
    description: 'Trascorri 1 ora scrivendo',
    category: 'commitment',
    xp: 20,
    unlocked: false,
    icon: 'clock',
    condition: {
      type: 'writeTime',
      threshold: 60
    }
  },
  {
    id: 'time-2',
    title: 'Scrittore Costante',
    description: 'Trascorri 5 ore scrivendo',
    category: 'commitment',
    xp: 50,
    unlocked: false,
    icon: 'clock',
    condition: {
      type: 'writeTime',
      threshold: 300
    }
  },
  {
    id: 'time-3',
    title: 'Scrittore Devoto',
    description: 'Trascorri 10 ore scrivendo',
    category: 'commitment',
    xp: 100,
    unlocked: false,
    icon: 'hourglass',
    condition: {
      type: 'writeTime',
      threshold: 600
    }
  },
  {
    id: 'time-4',
    title: 'Scrittore Professionista',
    description: 'Trascorri 24 ore scrivendo',
    category: 'commitment',
    xp: 200,
    unlocked: false,
    icon: 'hourglass',
    condition: {
      type: 'writeTime',
      threshold: 1440
    }
  },
  {
    id: 'time-5',
    title: 'Autore Dedicato',
    description: 'Trascorri 50 ore scrivendo',
    category: 'commitment',
    xp: 300,
    unlocked: false,
    icon: 'hourglass',
    condition: {
      type: 'writeTime',
      threshold: 3000
    }
  },
  
  // Traguardi speciali
  {
    id: 'special-1',
    title: 'Piccola Grande Idea',
    description: 'Completa il tuo primo racconto breve (5.000 parole)',
    category: 'milestone',
    xp: 100,
    unlocked: false,
    icon: 'bookmark',
    condition: {
      type: 'wordCount',
      threshold: 5000
    }
  },
  {
    id: 'special-2',
    title: 'Primo Racconto',
    description: 'Completa una novella (10.000 parole)',
    category: 'milestone',
    xp: 200,
    unlocked: false,
    icon: 'book-marked',
    condition: {
      type: 'wordCount',
      threshold: 10000
    }
  },
  {
    id: 'special-3',
    title: 'Primo Romanzo',
    description: 'Completa un romanzo breve (40.000 parole)',
    category: 'milestone',
    xp: 400,
    unlocked: false,
    icon: 'award',
    condition: {
      type: 'wordCount',
      threshold: 40000
    }
  },
  {
    id: 'special-4',
    title: 'Opera Magna',
    description: 'Completa un romanzo (80.000 parole)',
    category: 'milestone',
    xp: 600,
    unlocked: false,
    icon: 'trophy',
    condition: {
      type: 'wordCount',
      threshold: 80000
    }
  },
  {
    id: "special-5",
    title: "Saga Epica",
    description: "Completa un'opera monumentale (150.000 parole)",
    category: "milestone",
    xp: 1000,
    unlocked: false,
    icon: "crown",
    condition: {
      type: 'wordCount',
      threshold: 150000
    }
  }
];

// ----------------- Funzioni di utilità -----------------

// Calcola il livello in base all'esperienza
export function calculateLevelFromXP(xp: number): number {
  let level = 1;
  
  // Trova il livello più alto che l'utente ha raggiunto
  for (let i = 10; i >= 1; i--) {
    if (xp >= XP_LEVELS[i].xpRequired) {
      level = i;
      break;
    }
  }
  
  return level;
}

// Ottieni XP richiesti per un livello specifico
export function getExperienceForLevel(level: number): number {
  return XP_LEVELS[Math.min(Math.max(level, 1), 10)].xpRequired;
}

// Verifica se un obiettivo deve essere sbloccato
export function checkAchievementUnlock(
  achievement: Achievement, 
  stats: UserStats
): { unlocked: boolean; progress: number; newlyUnlocked: boolean } {
  const { condition } = achievement;
  
  // Recupera il valore corretto dalla tipologia di statistica
  const statValue = getStatValue(stats, condition.type);
  
  // Calcola percentuale di progresso (0-100)
  const progress = Math.min(100, Math.floor((statValue / condition.threshold) * 100));
  
  // Determina se l'obiettivo è sbloccato
  const unlocked = statValue >= condition.threshold;
  
  // Verifica se è appena stato sbloccato (era bloccato prima, è sbloccato ora)
  const newlyUnlocked = !achievement.unlocked && unlocked;
  
  return { unlocked, progress, newlyUnlocked };
}

// Funzione helper per ottenere il valore di una statistica
function getStatValue(stats: UserStats, statType: StatType): number {
  switch(statType) {
    case 'wordCount':
    case 'wordCountTotal':
      return stats.wordCount;
    case 'wordCountToday':
      return stats.wordCountToday;
    case 'wordCountWeek':
      return stats.wordCountWeek;
    case 'characterCount':
      return stats.characterCount;
    case 'placeCount':
      return stats.placeCount;
    case 'eventCount':
      return stats.eventCount;
    case 'raceCount':
      return stats.raceCount;
    case 'sessionsCompleted':
      return stats.sessionsCompleted;
    case 'wordsPerDay':
      return stats.wordsPerDay;
    case 'dailyGoalStreak':
      return stats.dailyGoalStreak;
    case 'writeStreak':
      return stats.writeStreak;
    case 'writeTime':
      return stats.writeTime;
    case 'writingSpeed':
      return stats.writingSpeed;
    default:
      return 0;
  }
}