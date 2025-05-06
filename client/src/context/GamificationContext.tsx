import React, { createContext, useContext } from 'react';
import { useApiGamification } from '@/hooks/use-api-gamification';
import { LevelUpNotification } from '@/components/gamification/LevelUpNotification';
import { UserStats, Achievement, WritingSession } from '@/lib/gamification/types';

// Definizione dell'interfaccia del contesto
interface GamificationContextType {
  // Dati principali
  level: number;
  experience: number;
  experienceToNextLevel: number;
  percentToNextLevel: number;
  achievements: Achievement[];
  recentAchievements: Achievement[];
  stats: UserStats;
  writingSessions: WritingSession[];
  dailyWordGoal: number;
  
  // Funzioni di aggiornamento
  addWordCount: (count: number) => void;
  addCharacterCount: (count: number) => void;
  addPlaceCount: (count: number) => void;
  addRaceCount: (count: number) => void;
  addEventCount: (count: number) => void;
  
  // Gestione sessioni
  startWritingSession: () => void;
  endWritingSession: (wordCount: number) => void;
  
  // Configurazione
  setDailyWordGoal: (goal: number) => void;
  resetStats: () => void;
}

// Crea il contesto
const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Provider del contesto
export function GamificationProvider({ children }: { children: React.ReactNode }) {
  // Usa l'hook interno che gestisce tutta la logica - ora utilizza l'API
  const gamification = useApiGamification();
  
  // Funzione per incrementare personaggi
  const addCharacterCount = (count: number = 1) => {
    // Valida conteggio positivo
    if (count <= 0) return;
    
    // Aggiorna conteggio personaggi tramite API
    gamification.updateStats({
      characterCount: (gamification.stats?.characterCount || 0) + count
    });
  };
  
  // Funzione per incrementare luoghi
  const addPlaceCount = (count: number = 1) => {
    // Valida conteggio positivo
    if (count <= 0) return;
    
    // Aggiorna conteggio luoghi tramite API
    gamification.updateStats({
      placeCount: (gamification.stats?.placeCount || 0) + count
    });
  };
  
  // Funzione per incrementare razze
  const addRaceCount = (count: number = 1) => {
    // Valida conteggio positivo
    if (count <= 0) return;
    
    // Aggiorna conteggio razze tramite API
    gamification.updateStats({
      raceCount: (gamification.stats?.raceCount || 0) + count
    });
  };
  
  // Funzione per incrementare eventi
  const addEventCount = (count: number = 1) => {
    // Valida conteggio positivo
    if (count <= 0) return;
    
    // Aggiorna conteggio eventi tramite API
    gamification.updateStats({
      eventCount: (gamification.stats?.eventCount || 0) + count
    });
  };
  
  // Valori esposti dal contesto
  const contextValue: GamificationContextType = {
    // Dati principali
    level: gamification.level,
    experience: gamification.experience,
    experienceToNextLevel: gamification.experienceToNextLevel,
    percentToNextLevel: gamification.percentToNextLevel,
    achievements: gamification.achievements,
    recentAchievements: gamification.recentAchievements,
    stats: gamification.stats,
    writingSessions: gamification.writingSessions,
    dailyWordGoal: gamification.dailyWordGoal,
    
    // Funzioni di aggiornamento
    addWordCount: gamification.addWordCount,
    addCharacterCount,
    addPlaceCount,
    addRaceCount,
    addEventCount,
    
    // Gestione sessioni
    startWritingSession: gamification.startWritingSession,
    endWritingSession: gamification.endWritingSession,
    
    // Configurazione
    setDailyWordGoal: gamification.setDailyWordGoal,
    resetStats: gamification.resetStats
  };
  
  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notifica di livello aumentato */}
      <LevelUpNotification 
        level={gamification.level}
        onClose={gamification.resetLevelUpNotification}
        open={gamification.showLevelUp}
      />
    </GamificationContext.Provider>
  );
}

// Hook personalizzato per accedere al contesto
export function useGamificationContext() {
  const context = useContext(GamificationContext);
  
  if (context === undefined) {
    throw new Error('useGamificationContext deve essere usato all\'interno di un GamificationProvider');
  }
  
  return context;
}