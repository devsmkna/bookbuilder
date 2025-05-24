import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApiGamification } from './use-api-gamification';

interface LocalSession {
  wordsWritten: number;
  charactersCreated: number;
  placesCreated: number;
  racesCreated: number;
  eventsCreated: number;
  mapsCreated: number;
  sessionStartTime: number;
  lastSyncTime: number;
  today: string;
}

const STORAGE_KEY = 'gamification_session';
const SYNC_INTERVAL = 60000; // 1 minuto

export function useRealtimeGamification() {
  const { toast } = useToast();
  const {
    addWordCount,
    updateStats,
    achievements,
    stats,
    level,
    experience,
    experienceToNextLevel,
    percentToNextLevel,
    startWritingSession,
    endWritingSession
  } = useApiGamification();

  const [localSession, setLocalSession] = useState<LocalSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toDateString();
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Se è un nuovo giorno, reset della sessione
      if (parsed.today !== today) {
        const newSession: LocalSession = {
          wordsWritten: 0,
          charactersCreated: 0,
          placesCreated: 0,
          racesCreated: 0,
          eventsCreated: 0,
          mapsCreated: 0,
          sessionStartTime: Date.now(),
          lastSyncTime: Date.now(),
          today
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
        return newSession;
      }
      return parsed;
    }

    const newSession: LocalSession = {
      wordsWritten: 0,
      charactersCreated: 0,
      placesCreated: 0,
      racesCreated: 0,
      eventsCreated: 0,
      mapsCreated: 0,
      sessionStartTime: Date.now(),
      lastSyncTime: Date.now(),
      today
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    return newSession;
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const lastAchievementCountRef = useRef(achievements?.length || 0);

  // Salva la sessione locale nel localStorage
  const saveLocalSession = useCallback((session: LocalSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setLocalSession(session);
  }, []);

  // Sincronizza con il database
  const syncWithDatabase = useCallback(async () => {
    if (localSession.wordsWritten > 0) {
      console.log('🔄 Sincronizzazione gamificazione con DB:', localSession);
      
      // Invia i dati al server
      try {
        await addWordCount(localSession.wordsWritten);
        
        // Se ci sono altre statistiche da aggiornare
        const updates: any = {};
        if (localSession.charactersCreated > 0) updates.characterCount = localSession.charactersCreated;
        if (localSession.placesCreated > 0) updates.placeCount = localSession.placesCreated;
        if (localSession.racesCreated > 0) updates.raceCount = localSession.racesCreated;
        if (localSession.eventsCreated > 0) updates.eventCount = localSession.eventsCreated;
        
        if (Object.keys(updates).length > 0) {
          updateStats(updates);
        }

        // Reset della sessione locale dopo la sincronizzazione
        const resetSession: LocalSession = {
          ...localSession,
          wordsWritten: 0,
          charactersCreated: 0,
          placesCreated: 0,
          racesCreated: 0,
          eventsCreated: 0,
          mapsCreated: 0,
          lastSyncTime: Date.now()
        };
        saveLocalSession(resetSession);
        
      } catch (error) {
        console.error('❌ Errore sincronizzazione gamificazione:', error);
      }
    }
  }, [localSession, addWordCount, updateStats, saveLocalSession]);

  // Programma la sincronizzazione automatica
  const scheduleSyncronization = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      syncWithDatabase();
      scheduleSyncronization(); // Riporgramma per il prossimo ciclo
    }, SYNC_INTERVAL);
  }, [syncWithDatabase]);

  // Aggiungi parole alla sessione corrente
  const addWordsToSession = useCallback((wordCount: number) => {
    if (wordCount <= 0) return;
    
    const updatedSession: LocalSession = {
      ...localSession,
      wordsWritten: localSession.wordsWritten + wordCount
    };
    
    saveLocalSession(updatedSession);
    
    // Se è la prima parola della sessione, avvia la sessione di scrittura
    if (localSession.wordsWritten === 0) {
      startWritingSession();
    }
    
    console.log(`✍️ Aggiunte ${wordCount} parole - Totale sessione: ${updatedSession.wordsWritten}`);
  }, [localSession, saveLocalSession, startWritingSession]);

  // Aggiungi altre attività
  const addCharacterCreated = useCallback(() => {
    const updatedSession: LocalSession = {
      ...localSession,
      charactersCreated: localSession.charactersCreated + 1
    };
    saveLocalSession(updatedSession);
    
    toast({
      title: "Personaggio Creato!",
      description: "Hai guadagnato esperienza per aver creato un nuovo personaggio",
      duration: 3000
    });
    
    // Sincronizza immediatamente per attività speciali
    setTimeout(() => syncWithDatabase(), 100);
  }, [localSession, saveLocalSession, toast, syncWithDatabase]);

  const addPlaceCreated = useCallback(() => {
    const updatedSession: LocalSession = {
      ...localSession,
      placesCreated: localSession.placesCreated + 1
    };
    saveLocalSession(updatedSession);
    
    toast({
      title: "Luogo Creato!",
      description: "Hai guadagnato esperienza per aver creato un nuovo luogo",
      duration: 3000
    });
    
    setTimeout(() => syncWithDatabase(), 100);
  }, [localSession, saveLocalSession, toast, syncWithDatabase]);

  const addRaceCreated = useCallback(() => {
    const updatedSession: LocalSession = {
      ...localSession,
      racesCreated: localSession.racesCreated + 1
    };
    saveLocalSession(updatedSession);
    
    toast({
      title: "Razza Creata!",
      description: "Hai guadagnato esperienza per aver creato una nuova razza",
      duration: 3000
    });
    
    setTimeout(() => syncWithDatabase(), 100);
  }, [localSession, saveLocalSession, toast, syncWithDatabase]);

  const addEventCreated = useCallback(() => {
    const updatedSession: LocalSession = {
      ...localSession,
      eventsCreated: localSession.eventsCreated + 1
    };
    saveLocalSession(updatedSession);
    
    toast({
      title: "Evento Creato!",
      description: "Hai guadagnato esperienza per aver creato un nuovo evento",
      duration: 3000
    });
    
    setTimeout(() => syncWithDatabase(), 100);
  }, [localSession, saveLocalSession, toast, syncWithDatabase]);

  const addMapCreated = useCallback(() => {
    const updatedSession: LocalSession = {
      ...localSession,
      mapsCreated: localSession.mapsCreated + 1
    };
    saveLocalSession(updatedSession);
    
    toast({
      title: "Mappa Caricata!",
      description: "Hai guadagnato esperienza per aver caricato una nuova mappa",
      duration: 3000
    });
    
    setTimeout(() => syncWithDatabase(), 100);
  }, [localSession, saveLocalSession, toast, syncWithDatabase]);

  // Verifica nuovi achievement e mostra toast
  useEffect(() => {
    if (!achievements) return;
    
    const currentAchievementCount = achievements.filter(a => a.unlocked).length;
    const previousCount = lastAchievementCountRef.current;
    
    if (currentAchievementCount > previousCount) {
      // Trova i nuovi achievement
      const recentAchievements = achievements
        .filter(a => a.unlocked && a.unlockDate)
        .sort((a, b) => new Date(b.unlockDate!).getTime() - new Date(a.unlockDate!).getTime())
        .slice(0, currentAchievementCount - previousCount);
      
      // Mostra toast per ogni nuovo achievement
      recentAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          toast({
            title: "🏆 Trofeo Sbloccato!",
            description: `${achievement.title}: ${achievement.description}`,
            duration: 5000,
            className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
          });
        }, index * 1000); // Stagger dei toast
      });
    }
    
    lastAchievementCountRef.current = currentAchievementCount;
  }, [achievements, toast]);

  // Avvia la sincronizzazione periodica
  useEffect(() => {
    scheduleSyncronization();
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [scheduleSyncronization]);

  // Sincronizzazione quando la pagina viene chiusa
  useEffect(() => {
    const handleBeforeUnload = () => {
      syncWithDatabase();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncWithDatabase]);

  return {
    // Statistiche correnti (DB + sessione locale)
    totalWordsWritten: (stats?.wordCount || 0) + localSession.wordsWritten,
    sessionWordsWritten: localSession.wordsWritten,
    level,
    experience,
    experienceToNextLevel,
    percentToNextLevel,
    achievements: achievements || [],
    stats: stats || null,
    
    // Funzioni per aggiungere attività
    addWordsToSession,
    addCharacterCreated,
    addPlaceCreated,
    addRaceCreated,
    addEventCreated,
    addMapCreated,
    
    // Funzioni di controllo
    syncWithDatabase,
    localSession
  };
}