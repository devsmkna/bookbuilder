import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Achievement, UserStats, WritingSession } from '@/lib/gamification/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  DAILY_GOALS,
  calculateLevelFromXP,
  getExperienceForLevel
} from '@/lib/gamification/constants';

interface GamificationApiState {
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
  isLoading: boolean;
}

export function useApiGamification(): GamificationApiState & {
  updateStats: (newStats: Partial<UserStats>) => void;
  addWordCount: (count: number) => void;
  startWritingSession: () => void;
  endWritingSession: (wordCount: number) => void;
  setDailyWordGoal: (goal: number) => void;
  resetStats: () => void;
} {
  // Ottieni le statistiche dal server
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats']
  });

  // Ottieni gli achievement dal server
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements']
  });

  // Ottieni le sessioni di scrittura dal server
  const { data: writingSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/writing-sessions']
  });

  // Query client per invalidare le query
  const queryClient = useQueryClient();
  
  // Hook Toast per le notifiche
  const { toast } = useToast();

  // Stato per tenere traccia della sessione di scrittura corrente
  const currentSessionRef = useRef<WritingSession | null>(null);

  // Stati per livello e achievement
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastLevel, setLastLevel] = useState(0);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  // Mutation per aggiornare le statistiche
  const updateStatsMutation = useMutation({
    mutationFn: async (newStats: Partial<UserStats>) => {
      const response = await apiRequest('PUT', '/api/stats', newStats);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    }
  });

  // Mutation per incrementare le statistiche
  const incrementStatsMutation = useMutation({
    mutationFn: async (increments: Partial<UserStats>) => {
      const response = await apiRequest('POST', '/api/stats/increment', increments);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
    }
  });

  // Mutation per creare una sessione di scrittura
  const createSessionMutation = useMutation({
    mutationFn: async (session: Partial<WritingSession>) => {
      const response = await apiRequest('POST', '/api/writing-sessions', session);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/writing-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    }
  });

  // Imposta l'obiettivo giornaliero di parole
  const [dailyWordGoal, setDailyWordGoalState] = useState(() => {
    return stats?.dailyWordGoal || DAILY_GOALS[2].value; // Default: Standard (1000)
  });

  // Aggiorna le statistiche
  const updateStats = useCallback((newStats: Partial<UserStats>) => {
    updateStatsMutation.mutate(newStats);
  }, [updateStatsMutation]);

  // Funzione per aggiungere parole al conteggio
  const addWordCount = useCallback((count: number) => {
    // Solo valori positivi
    if (count <= 0) return;
    
    // Se non c'è una sessione attiva, avviala
    if (!currentSessionRef.current) {
      startWritingSession();
    }
    
    // Incrementa le statistiche
    incrementStatsMutation.mutate({
      wordCount: count,
      wordCountToday: count,
      wordCountWeek: count,
      characterCount: count * 5 // Stima approssimativa
    });
  }, [incrementStatsMutation]);

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
    
    // Invia la sessione al server
    createSessionMutation.mutate(completedSession);
    
    // Resetta la sessione corrente
    currentSessionRef.current = null;
    
    console.log('Sessione di scrittura completata', completedSession);
  }, [createSessionMutation]);

  // Imposta un nuovo obiettivo giornaliero
  const setDailyWordGoal = useCallback((goal: number) => {
    setDailyWordGoalState(goal);
    updateStats({ dailyWordGoal: goal });
    
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
    
    // Reimposta i valori di default tramite una PUT alle statistiche
    updateStats({
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
      dailyWordGoal: DAILY_GOALS[2].value,
      experience: 0,
      level: 1
    });
    
    setRecentAchievements([]);
    
    toast({
      title: "Statistiche Resettate",
      description: "Tutte le statistiche e gli obiettivi sono stati azzerati",
      variant: "destructive",
      duration: 3000
    });
    
    // Invalida tutte le query per aggiornare i dati
    queryClient.invalidateQueries();
  }, [updateStats, toast, queryClient]);

  // Aggiorna l'obiettivo giornaliero quando le statistiche cambiano
  useEffect(() => {
    if (stats?.dailyWordGoal) {
      setDailyWordGoalState(stats.dailyWordGoal);
    }
  }, [stats?.dailyWordGoal]);

  // Verifica se c'è stato un aumento di livello
  useEffect(() => {
    if (!stats?.level) return;
    
    if (stats.level > lastLevel && lastLevel > 0) {
      setShowLevelUp(true);
      
      toast({
        title: "Livello Aumentato!",
        description: `Hai raggiunto il livello ${stats.level}. Nuove funzionalità sbloccate!`,
        variant: "default",
        duration: 6000
      });
    }
    
    setLastLevel(stats.level);
  }, [stats?.level, lastLevel, toast]);

  // Calcola l'esperienza richiesta per il prossimo livello
  const experienceToNextLevel = stats?.level 
    ? getExperienceForLevel(stats.level + 1) - (stats.experience || 0)
    : 100;

  // Calcola la percentuale di completamento al prossimo livello
  const percentToNextLevel = stats?.level
    ? Math.min(
        100,
        ((stats.experience - getExperienceForLevel(stats.level)) / 
         (getExperienceForLevel(stats.level + 1) - getExperienceForLevel(stats.level))) * 100
      )
    : 0;

  // Verifica per achievement appena sbloccati
  useEffect(() => {
    if (!achievements) return;
    
    // Filtra solo gli achievement appena sbloccati 
    // (quelli sbloccati nelle ultime 24 ore)
    const recentlyUnlocked = achievements
      .filter(a => a.unlocked && a.unlockDate)
      .filter(a => {
        const unlockDate = new Date(a.unlockDate as string);
        const now = new Date();
        const diff = now.getTime() - unlockDate.getTime();
        return diff < 24 * 60 * 60 * 1000; // 24 ore
      });
    
    if (recentlyUnlocked.length > 0) {
      setRecentAchievements(recentlyUnlocked);
    }
  }, [achievements]);

  // Resetta la notifica di livello
  const resetLevelUpNotification = () => {
    setShowLevelUp(false);
  };

  // Determina se i dati stanno caricando
  const isLoading = statsLoading || achievementsLoading || sessionsLoading;

  // Valori di default quando i dati non sono ancora caricati
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
    dailyWordGoal: DAILY_GOALS[2].value,
    theme: 'light',
    experience: 0,
    level: 1
  };

  return {
    level: stats?.level || 1,
    experience: stats?.experience || 0,
    experienceToNextLevel,
    achievements: achievements || [],
    stats: stats || defaultStats,
    writingSessions: writingSessions || [],
    percentToNextLevel,
    recentAchievements,
    showLevelUp,
    resetLevelUpNotification,
    dailyWordGoal,
    isLoading,
    
    // Funzioni di aggiornamento
    updateStats,
    addWordCount,
    startWritingSession,
    endWritingSession,
    setDailyWordGoal,
    resetStats
  };
}