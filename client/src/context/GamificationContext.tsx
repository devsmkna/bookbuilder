import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGamification } from '@/hooks/use-gamification';
import { LevelUpNotification } from '@/components/gamification/LevelUpNotification';

interface GamificationContextType {
  addWordCount: (count: number) => void;
  addCharacterCount: (count: number) => void;
  addPlaceCount: (count: number) => void;
  getCurrentStats: () => {
    level: number;
    experience: number;
    experienceToNextLevel: number;
    wordCount: number;
    characterCount: number;
    placeCount: number;
  };
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const gamification = useGamification();
  const [wordCount, setWordCount] = useState(0);
  
  // Track changes in stats to update corresponding counts
  useEffect(() => {
    setWordCount(gamification.stats.wordCount);
  }, [gamification.stats.wordCount]);
  
  // Function to add to word count
  const addWordCount = (count: number) => {
    // Only add positive values
    if (count <= 0) return;
    
    const newWordCount = wordCount + count;
    setWordCount(newWordCount);
    
    // Update gamification stats
    // This will trigger achievement checks in useGamification
    const newStats = {
      ...gamification.stats,
      wordCount: newWordCount,
      wordsPerDay: Math.floor(newWordCount / Math.max(1, gamification.stats.sessionsCompleted))
    };
    
    // Update stats through gamification hook
    // This will be implemented to update stats in localStorage
    // and trigger achievement checks
  };
  
  // Function to add to character count
  const addCharacterCount = (count: number) => {
    // Only add 1 at a time for characters created
    if (count !== 1) return;
    
    // Update gamification stats
    const newCharacterCount = gamification.stats.characterCount + 1;
    
    // Update stats
    const newStats = {
      ...gamification.stats,
      characterCount: newCharacterCount
    };
    
    // Would update through gamification hook
  };
  
  // Function to add to place count
  const addPlaceCount = (count: number) => {
    // Only add 1 at a time for places created
    if (count !== 1) return;
    
    // Update gamification stats
    const newPlaceCount = gamification.stats.placeCount + 1;
    
    // Update stats
    const newStats = {
      ...gamification.stats,
      placeCount: newPlaceCount
    };
    
    // Would update through gamification hook
  };
  
  // Function to get current stats
  const getCurrentStats = () => {
    return {
      level: gamification.level,
      experience: gamification.experience,
      experienceToNextLevel: gamification.experienceToNextLevel,
      wordCount: gamification.stats.wordCount,
      characterCount: gamification.stats.characterCount,
      placeCount: gamification.stats.placeCount
    };
  };
  
  const contextValue: GamificationContextType = {
    addWordCount,
    addCharacterCount,
    addPlaceCount,
    getCurrentStats
  };
  
  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
      
      {/* Level up notification */}
      <LevelUpNotification 
        level={gamification.level}
        onClose={gamification.resetLevelUpNotification}
        open={gamification.showLevelUp}
      />
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamificationContext must be used within a GamificationProvider');
  }
  return context;
}