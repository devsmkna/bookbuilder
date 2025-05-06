import { useState, useEffect, useCallback, useRef } from 'react';
import { Achievement, UserStats, WritingSession } from '@/lib/gamification/types';
import {
  ACHIEVEMENTS,
  DAILY_GOALS,
  calculateLevelFromXP,
  getExperienceForLevel,
  checkAchievementUnlock
} from '@/lib/gamification/constants';
import { useToast } from '@/hooks/use-toast';

interface GamificationState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievements: Achievement[];
  stats: UserStats;
  writingSessions: WritingSession[];
  percentToNextLevel: number;
  recentAchievements: Achievement[];
  showLevelUp: boolean;
  resetLevelUpNotification: () => void;
  dailyWordGoal: number;
}

// Funzioni helper per il localStorage

const getStoredStats = (): { stats: UserStats; experience: number } | null => {
  try {
    const storedStats = localStorage.getItem('gamification_stats');
    return storedStats ? JSON.parse(storedStats) : null;
  } catch (error) {
    console.error('Errore nel recuperare le statistiche di gamification:', error);
    return null;
  }
};

const getStoredAchievements = (): { achievements: Achievement[] } | null => {
  try {
    const storedAchievements = localStorage.getItem('gamification_achievements');
    return storedAchievements ? JSON.parse(storedAchievements) : null;
  } catch (error) {
    console.error('Errore nel recuperare gli achievement:', error);
    return null;
  }
};

const getStoredSessions = (): { sessions: WritingSession[] } | null => {
  try {
    const storedSessions = localStorage.getItem('writing_sessions');
    return storedSessions ? JSON.parse(storedSessions) : null;
  } catch (error) {
    console.error('Errore nel recuperare le sessioni di scrittura:', error);
    return null;
  }
};

const getStoredDailyGoal = (): number => {
  try {
    const storedGoal = localStorage.getItem('daily_word_goal');
    return storedGoal ? parseInt(storedGoal, 10) : DAILY_GOALS[2].value; // Default: Standard (1000)
  } catch (error) {
    console.error('Errore nel recuperare l\'obiettivo giornaliero:', error);
    return DAILY_GOALS[2].value;
  }
};

// Funzioni di utilità
const formatDate = (date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const isToday = (dateStr: string): boolean => {
  return dateStr === formatDate();
};

const isWithinLastWeek = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  return date >= weekAgo && date <= today;
};

export function useGamification(): GamificationState & {
  updateStats: (newStats: Partial<UserStats>) => void;
  addWordCount: (count: number) => void;
  startWritingSession: () => void;
  endWritingSession: (wordCount: number) => void;
  setDailyWordGoal: (goal: number) => void;
  resetStats: () => void;
} {
  // Inizializza le statistiche da localStorage o valori di default
  const [stats, setStats] = useState<UserStats>(() => {
    const storedStats = getStoredStats();
    
    // Valori di default se non ci sono statistiche salvate
    const defaultStats: UserStats = {
      wordCount: 0,
      wordCountToday: 0,
      wordCountWeek: 0,
      characterCount: 0,
      placeCount: 0,
      eventCount: 0,
      raceCount: 0,
      sessionsCompleted: 0,
      wordsPerDay: 0,
      dailyGoalReached: false,
      dailyGoalStreak: 0,
      writeStreak: 0,
      longestWriteStreak: 0,
      writeTime: 0,
      writingSpeed: 0,
      dailyWordGoal: getStoredDailyGoal(),
      theme: 'light'
    };
    
    // Se ci sono statistiche salvate, aggiorna i valori giornalieri/settimanali
    if (storedStats?.stats) {
      const lastActiveDate = localStorage.getItem('last_active_date') || '';
      
      // Reset delle statistiche giornaliere se l'ultimo accesso non è oggi
      if (!isToday(lastActiveDate)) {
        storedStats.stats.wordCountToday = 0;
        storedStats.stats.dailyGoalReached = false;
      }
      
      // Calcola le parole scritte nell'ultima settimana dalle sessioni di scrittura
      const sessions = getStoredSessions()?.sessions || [];
      const wordCountWeek = sessions
        .filter(session => isWithinLastWeek(session.date))
        .reduce((total, session) => total + session.wordCount, 0);
      
      storedStats.stats.wordCountWeek = wordCountWeek;
      
      return {
        ...defaultStats,
        ...storedStats.stats,
        dailyWordGoal: storedStats.stats.dailyWordGoal || defaultStats.dailyWordGoal
      };
    }
    
    return defaultStats;
  });
  
  // Stato per tenere traccia delle sessioni di scrittura
  const [writingSessions, setWritingSessions] = useState<WritingSession[]>(() => {
    const storedSessions = getStoredSessions();
    return storedSessions?.sessions || [];
  });
  
  // Stato per la sessione di scrittura corrente
  const currentSessionRef = useRef<WritingSession | null>(null);
  
  // Inizializza gli achievement da localStorage o valori di default
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const storedAchievements = getStoredAchievements();
    return storedAchievements?.achievements || ACHIEVEMENTS;
  });
  
  // Imposta l'obiettivo giornaliero di parole
  const [dailyWordGoal, setDailyWordGoal] = useState(() => getStoredDailyGoal());
  
  // Hook Toast per le notifiche
  const { toast } = useToast();
  
  // Calcola l'esperienza basandosi sugli achievement sbloccati
  const calculateExperience = useCallback(() => {
    return achievements
      .filter(a => a.unlocked)
      .reduce((total, achievement) => total + achievement.xp, 0);
  }, [achievements]);
  
  // Inizializza l'esperienza
  const [experience, setExperience] = useState(() => {
    const storedStats = getStoredStats();
    return storedStats?.experience || calculateExperience();
  });
  
  // Calcola il livello dall'esperienza
  const level = calculateLevelFromXP(experience);
  
  // Calcola l'esperienza richiesta per il prossimo livello
  const experienceToNextLevel = getExperienceForLevel(level + 1) - experience;
  
  // Calcola la percentuale di completamento al prossimo livello
  const percentToNextLevel = Math.min(
    100,
    ((experience - getExperienceForLevel(level)) / 
     (getExperienceForLevel(level + 1) - getExperienceForLevel(level))) * 100
  );
  
  // Traccia gli achievement recenti per le notifiche
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  
  // Stato per controllare la notifica di livello
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastLevel, setLastLevel] = useState(level);
  
  // Resetta la notifica di livello
  const resetLevelUpNotification = () => {
    setShowLevelUp(false);
  };
  
  // Aggiorna le statistiche
  const updateStats = useCallback((newStats: Partial<UserStats>) => {
    setStats(prev => ({
      ...prev,
      ...newStats
    }));
    
    // Aggiorna la data dell'ultimo accesso
    localStorage.setItem('last_active_date', formatDate());
  }, []);
  
  // Inizia una nuova sessione di scrittura
  const startWritingSession = useCallback(() => {
    // Se c'è già una sessione attiva, non fare nulla
    if (currentSessionRef.current) return;
    
    // Crea una nuova sessione
    const newSession: WritingSession = {
      date: formatDate(),
      wordCount: 0,
      duration: 0,
      startTime: new Date().toISOString()
    };
    
    // Salva la sessione corrente
    currentSessionRef.current = newSession;
    
    console.log('Sessione di scrittura iniziata', newSession);
  }, []);
  
  // Termina la sessione di scrittura e salva le statistiche
  const endWritingSession = useCallback((wordCount: number) => {
    // Se non c'è una sessione attiva, non fare nulla
    if (!currentSessionRef.current) return;
    
    // Aggiorna i dati della sessione
    const endTime = new Date().toISOString();
    const startTime = new Date(currentSessionRef.current.startTime);
    const durationMinutes = Math.max(1, Math.round((new Date().getTime() - startTime.getTime()) / 60000));
    
    const completedSession: WritingSession = {
      ...currentSessionRef.current,
      wordCount,
      duration: durationMinutes,
      endTime
    };
    
    // Aggiungi la sessione alla lista
    setWritingSessions(prev => [...prev, completedSession]);
    
    // Calcola la velocità di scrittura (parole al minuto)
    const speed = Math.round(wordCount / durationMinutes);
    
    // Aggiorna le statistiche
    updateStats({
      sessionsCompleted: stats.sessionsCompleted + 1,
      writeTime: stats.writeTime + durationMinutes,
      writingSpeed: Math.round((stats.writingSpeed + speed) / 2) // Media
    });
    
    // Resetta la sessione corrente
    currentSessionRef.current = null;
    
    console.log('Sessione di scrittura completata', completedSession);
  }, [stats.sessionsCompleted, stats.writeTime, stats.writingSpeed, updateStats]);
  
  // Funzione per aggiungere parole al conteggio
  const addWordCount = useCallback((count: number) => {
    // Solo valori positivi
    if (count <= 0) return;
    
    // Se non c'è una sessione attiva, avviala
    if (!currentSessionRef.current) {
      startWritingSession();
    }
    
    const wordCountToday = stats.wordCountToday + count;
    const totalWordCount = stats.wordCount + count;
    
    // Verifica se l'obiettivo giornaliero è stato raggiunto
    const dailyGoalJustReached = !stats.dailyGoalReached && wordCountToday >= dailyWordGoal;
    
    // Aggiorna le statistiche
    updateStats({
      wordCount: totalWordCount,
      wordCountToday,
      // Aggiorna wordCountWeek
      wordCountWeek: stats.wordCountWeek + count,
      // Calcola media parole al giorno
      wordsPerDay: Math.round(totalWordCount / Math.max(1, stats.sessionsCompleted)),
      // Aggiorna lo stato dell'obiettivo giornaliero
      dailyGoalReached: wordCountToday >= dailyWordGoal,
      // Se l'obiettivo è stato appena raggiunto, incrementa la streak
      dailyGoalStreak: dailyGoalJustReached ? stats.dailyGoalStreak + 1 : stats.dailyGoalStreak
    });
    
    // Mostra notifica di obiettivo raggiunto
    if (dailyGoalJustReached) {
      toast({
        title: "Obiettivo Raggiunto!",
        description: `Hai completato il tuo obiettivo giornaliero di ${dailyWordGoal} parole!`,
        duration: 5000
      });
    }
    
    console.log(`Aggiunte ${count} parole. Oggi: ${wordCountToday}, Totale: ${totalWordCount}`);
  }, [stats, dailyWordGoal, updateStats, startWritingSession, toast]);
  
  // Imposta un nuovo obiettivo giornaliero
  const changeWordGoal = useCallback((goal: number) => {
    setDailyWordGoal(goal);
    updateStats({ dailyWordGoal: goal });
    localStorage.setItem('daily_word_goal', goal.toString());
    
    toast({
      title: "Obiettivo Aggiornato",
      description: `Il tuo obiettivo giornaliero è stato impostato a ${goal} parole`,
      duration: 3000
    });
  }, [updateStats, toast]);
  
  // Resetta le statistiche (per debugging)
  const resetStats = useCallback(() => {
    const confirm = window.confirm('Sei sicuro di voler resettare tutte le statistiche? Questa azione non può essere annullata.');
    if (!confirm) return;
    
    // Rimuovi tutti i dati dal localStorage
    localStorage.removeItem('gamification_stats');
    localStorage.removeItem('gamification_achievements');
    localStorage.removeItem('writing_sessions');
    localStorage.removeItem('last_active_date');
    
    // Reimposta i valori di default
    setStats({
      wordCount: 0,
      wordCountToday: 0,
      wordCountWeek: 0,
      characterCount: 0,
      placeCount: 0,
      eventCount: 0,
      raceCount: 0,
      sessionsCompleted: 0,
      wordsPerDay: 0,
      dailyGoalReached: false,
      dailyGoalStreak: 0,
      writeStreak: 0,
      longestWriteStreak: 0,
      writeTime: 0,
      writingSpeed: 0,
      dailyWordGoal,
      theme: 'light'
    });
    
    setAchievements(ACHIEVEMENTS);
    setExperience(0);
    setWritingSessions([]);
    setRecentAchievements([]);
    
    toast({
      title: "Statistiche Resettate",
      description: "Tutte le statistiche e gli obiettivi sono stati azzerati",
      variant: "destructive",
      duration: 3000
    });
  }, [dailyWordGoal, toast]);
  
  // Verifica se c'è stato un aumento di livello
  useEffect(() => {
    if (level > lastLevel) {
      setShowLevelUp(true);
      setLastLevel(level);
      
      toast({
        title: "Livello Aumentato!",
        description: `Hai raggiunto il livello ${level}. Nuove funzionalità sbloccate!`,
        variant: "default",
        duration: 6000
      });
    }
  }, [level, lastLevel, toast]);
  
  // Controlla lo sblocco di nuovi achievement quando le statistiche cambiano
  useEffect(() => {
    let newlyUnlockedAchievements: Achievement[] = [];
    let experienceGained = 0;
    
    // Crea una copia degli achievement per aggiornarli
    const updatedAchievements = achievements.map(achievement => {
      // Non ricontrollare achievement già sbloccati
      if (achievement.unlocked) {
        return achievement;
      }
      
      const { unlocked, progress, newlyUnlocked } = checkAchievementUnlock(
        achievement,
        stats
      );
      
      // Se appena sbloccato, aggiungi agli achievement recenti e aggiungi XP
      if (newlyUnlocked) {
        const achievementWithDate = { 
          ...achievement, 
          unlocked: true, 
          progress: 100,
          unlockDate: new Date().toISOString() 
        };
        
        newlyUnlockedAchievements.push(achievementWithDate);
        experienceGained += achievement.xp;
        
        // Notifica l'utente
        toast({
          title: `Obiettivo Sbloccato: ${achievement.title}`,
          description: `${achievement.description} (+${achievement.xp} XP)`,
          duration: 5000
        });
        
        return achievementWithDate;
      }
      
      // Altrimenti aggiorna solo il progresso
      return {
        ...achievement,
        unlocked,
        progress
      };
    });
    
    // Se ci sono achievement appena sbloccati
    if (newlyUnlockedAchievements.length > 0) {
      // Aggiorna gli achievement
      setAchievements(updatedAchievements);
      
      // Aggiorna l'esperienza
      setExperience(prev => prev + experienceGained);
      
      // Aggiungi agli achievement recenti
      setRecentAchievements(prev => [...newlyUnlockedAchievements, ...prev].slice(0, 10));
      
      // Salva gli achievement aggiornati
      localStorage.setItem('gamification_achievements', JSON.stringify({ 
        achievements: updatedAchievements 
      }));
    }
  }, [stats, achievements, toast]);
  
  // Salva le statistiche quando cambiano
  useEffect(() => {
    localStorage.setItem('gamification_stats', JSON.stringify({ 
      stats,
      experience 
    }));
  }, [stats, experience]);
  
  // Salva le sessioni di scrittura quando cambiano
  useEffect(() => {
    localStorage.setItem('writing_sessions', JSON.stringify({ 
      sessions: writingSessions
    }));
  }, [writingSessions]);
  
  // Controllo per la streak di scrittura giornaliera
  useEffect(() => {
    const lastActiveDate = localStorage.getItem('last_active_date');
    const today = formatDate();
    
    // Nessuna data di ultima attività, imposta oggi
    if (!lastActiveDate) {
      localStorage.setItem('last_active_date', today);
      return;
    }
    
    // Se è oggi, non fare nulla
    if (lastActiveDate === today) {
      return;
    }
    
    // Calcola la differenza in giorni
    const lastActive = new Date(lastActiveDate);
    const todayDate = new Date(today);
    const diffTime = Math.abs(todayDate.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Aggiorna la streak
    if (diffDays === 1) {
      // Continuazione della streak
      const newStreak = stats.writeStreak + 1;
      const newLongestStreak = Math.max(newStreak, stats.longestWriteStreak);
      
      updateStats({
        writeStreak: newStreak,
        longestWriteStreak: newLongestStreak,
        // Reset del conteggio giornaliero
        wordCountToday: 0,
        dailyGoalReached: false
      });
      
      if (newStreak > 1) {
        toast({
          title: "Streak di Scrittura!",
          description: `Hai scritto per ${newStreak} giorni consecutivi! Continua così!`,
          duration: 4000
        });
      }
    } else if (diffDays > 1) {
      // Reset della streak
      updateStats({
        writeStreak: 0,
        wordCountToday: 0,
        dailyGoalReached: false
      });
    }
    
    // Aggiorna la data dell'ultimo accesso
    localStorage.setItem('last_active_date', today);
  }, [stats.writeStreak, stats.longestWriteStreak, updateStats, toast]);
  
  return {
    level,
    experience,
    experienceToNextLevel,
    achievements,
    stats,
    writingSessions,
    percentToNextLevel,
    recentAchievements,
    showLevelUp,
    resetLevelUpNotification,
    dailyWordGoal,
    updateStats,
    addWordCount,
    startWritingSession,
    endWritingSession,
    setDailyWordGoal: changeWordGoal,
    resetStats
  };
}