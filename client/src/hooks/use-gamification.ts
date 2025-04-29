import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  ACHIEVEMENTS, 
  XP_LEVELS, 
  checkAchievementUnlock, 
  getExperienceForLevel, 
  calculateLevelFromXP 
} from '@/lib/gamification/constants';
import { Achievement } from '@/lib/gamification/types';

interface GamificationState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievements: Achievement[];
  stats: {
    wordCount: number;
    characterCount: number;
    placeCount: number;
    sessionsCompleted: number;
    wordsPerDay: number;
    writeStreak: number;
    longestWriteStreak: number;
  };
  percentToNextLevel: number;
  recentAchievements: Achievement[];
  showLevelUp: boolean;
  resetLevelUpNotification: () => void;
}

export function useGamification(): GamificationState {
  const { toast } = useToast();

  // Load saved state from localStorage
  const [state, setState] = useState<{
    level: number;
    experience: number;
    achievements: Achievement[];
    stats: GamificationState['stats'];
    lastUpdateDate: string | null;
    recentAchievements: Achievement[];
    showLevelUp: boolean;
  }>(() => {
    // Default initial state
    const defaultState = {
      level: 1,
      experience: 0,
      achievements: ACHIEVEMENTS,
      stats: {
        wordCount: 0,
        characterCount: 0,
        placeCount: 0,
        sessionsCompleted: 0,
        wordsPerDay: 0,
        writeStreak: 0,
        longestWriteStreak: 0
      },
      lastUpdateDate: null,
      recentAchievements: [],
      showLevelUp: false
    };

    // Try to load from localStorage
    try {
      const savedState = localStorage.getItem('gamification');
      if (savedState) {
        return { ...defaultState, ...JSON.parse(savedState) };
      }
    } catch (error) {
      console.error('Failed to load gamification state:', error);
    }

    return defaultState;
  });

  // Calculate experience to next level
  const experienceToNextLevel = getExperienceForLevel(state.level + 1) - state.experience;
  
  // Calculate percentage to next level
  const levelXP = getExperienceForLevel(state.level);
  const nextLevelXP = getExperienceForLevel(state.level + 1);
  const percentToNextLevel = ((state.experience - levelXP) / (nextLevelXP - levelXP)) * 100;

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('gamification', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save gamification state:', error);
    }
  }, [state]);

  // Handle streak updates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (state.lastUpdateDate !== today) {
      // Update last login date
      setState(prevState => {
        // Check if we already logged in today
        if (prevState.lastUpdateDate === today) return prevState;
        
        // Calculate streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        let newStreak = 1;
        let longestStreak = prevState.stats.longestWriteStreak;
        
        if (prevState.lastUpdateDate === yesterdayString) {
          // Continuing streak
          newStreak = prevState.stats.writeStreak + 1;
          if (newStreak > longestStreak) {
            longestStreak = newStreak;
          }
        }
        
        return {
          ...prevState,
          lastUpdateDate: today,
          stats: {
            ...prevState.stats,
            writeStreak: newStreak,
            longestWriteStreak: longestStreak,
            sessionsCompleted: prevState.stats.sessionsCompleted + 1
          }
        };
      });
    }
  }, []);

  // Function to add experience points
  const addExperience = useCallback((amount: number, reason: string) => {
    setState(prevState => {
      const newExperience = prevState.experience + amount;
      const newLevel = calculateLevelFromXP(newExperience);
      
      // Check if we leveled up
      const leveledUp = newLevel > prevState.level;
      
      if (leveledUp) {
        toast({
          title: "Level Up!",
          description: `You've reached level ${newLevel}`,
        });
      }
      
      return {
        ...prevState,
        level: newLevel,
        experience: newExperience,
        showLevelUp: leveledUp
      };
    });
  }, [toast]);

  // Update stats
  const updateStats = useCallback((newStats: Partial<GamificationState['stats']>) => {
    setState(prevState => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        ...newStats
      }
    }));
  }, []);

  // Check achievements
  useEffect(() => {
    const { achievements, stats } = state;
    
    const updatedAchievements = achievements.map(achievement => {
      const { unlocked, progress, newlyUnlocked } = checkAchievementUnlock(achievement, stats);
      
      if (newlyUnlocked) {
        // Add XP for newly unlocked achievement
        addExperience(achievement.xp, `Achievement: ${achievement.title}`);
        
        // Show toast notification
        toast({
          title: "Achievement Unlocked!",
          description: achievement.title,
        });
        
        // Add to recent achievements
        setState(prevState => ({
          ...prevState,
          recentAchievements: [
            achievement,
            ...prevState.recentAchievements
          ].slice(0, 5) // Keep only 5 most recent
        }));
      }
      
      return {
        ...achievement,
        unlocked,
        progress
      };
    });
    
    // Update achievements if they've changed
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setState(prevState => ({
        ...prevState,
        achievements: updatedAchievements
      }));
    }
  }, [state.stats, addExperience, toast]);

  // Function to reset level up notification
  const resetLevelUpNotification = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      showLevelUp: false
    }));
  }, []);

  // Expose game state and functions
  return {
    level: state.level,
    experience: state.experience,
    experienceToNextLevel,
    achievements: state.achievements,
    stats: state.stats,
    percentToNextLevel,
    recentAchievements: state.recentAchievements,
    showLevelUp: state.showLevelUp,
    resetLevelUpNotification
  };
}