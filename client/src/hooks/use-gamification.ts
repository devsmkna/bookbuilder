import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '@/lib/gamification/types';
import {
  ACHIEVEMENTS,
  calculateLevelFromXP,
  getExperienceForLevel,
  checkAchievementUnlock
} from '@/lib/gamification/constants';

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

// Helper function to get stored stats or default values
const getStoredStats = () => {
  try {
    const storedStats = localStorage.getItem('gamification_stats');
    return storedStats ? JSON.parse(storedStats) : null;
  } catch (error) {
    console.error('Error retrieving gamification stats:', error);
    return null;
  }
};

// Helper function to get stored achievements or default values
const getStoredAchievements = () => {
  try {
    const storedAchievements = localStorage.getItem('gamification_achievements');
    return storedAchievements ? JSON.parse(storedAchievements) : null;
  } catch (error) {
    console.error('Error retrieving gamification achievements:', error);
    return null;
  }
};

export function useGamification(): GamificationState {
  // Initialize stats from localStorage or default values
  const [stats, setStats] = useState(() => {
    const storedStats = getStoredStats();
    return storedStats?.stats || {
      wordCount: 0,
      characterCount: 0,
      placeCount: 0,
      sessionsCompleted: 0,
      wordsPerDay: 0,
      writeStreak: 0,
      longestWriteStreak: 0
    };
  });
  
  // Initialize achievements from localStorage or default values
  const [achievements, setAchievements] = useState(() => {
    const storedAchievements = getStoredAchievements();
    return storedAchievements?.achievements || ACHIEVEMENTS;
  });
  
  // Calculate experience based on achievements
  const calculateExperience = useCallback(() => {
    return achievements
      .filter(a => a.unlocked)
      .reduce((total, achievement) => total + achievement.xp, 0);
  }, [achievements]);
  
  // Initialize experience
  const [experience, setExperience] = useState(() => {
    const storedStats = getStoredStats();
    return storedStats?.experience || calculateExperience();
  });
  
  // Calculate level from experience
  const level = calculateLevelFromXP(experience);
  
  // Calculate experience required for next level
  const experienceToNextLevel = getExperienceForLevel(level + 1) - experience;
  
  // Calculate percentage to next level
  const percentToNextLevel = Math.min(
    100,
    ((experience - getExperienceForLevel(level)) / 
     (getExperienceForLevel(level + 1) - getExperienceForLevel(level))) * 100
  );
  
  // Track recent achievements for notifications
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  
  // State to control level up notification
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastLevel, setLastLevel] = useState(level);
  
  // Reset level up notification
  const resetLevelUpNotification = () => {
    setShowLevelUp(false);
  };
  
  // Check for level up
  useEffect(() => {
    if (level > lastLevel) {
      setShowLevelUp(true);
      setLastLevel(level);
    }
  }, [level, lastLevel]);
  
  // Check for achievement unlocks when stats change
  useEffect(() => {
    let newlyUnlockedAchievements: Achievement[] = [];
    let experienceGained = 0;
    
    // Create a copy of achievements to update
    const updatedAchievements = achievements.map(achievement => {
      const { unlocked, progress, newlyUnlocked } = checkAchievementUnlock(
        achievement,
        stats
      );
      
      // If newly unlocked, add to recent achievements and add XP
      if (newlyUnlocked) {
        newlyUnlockedAchievements.push({ ...achievement, unlocked: true });
        experienceGained += achievement.xp;
      }
      
      // Return updated achievement
      return {
        ...achievement,
        unlocked,
        progress
      };
    });
    
    // If any achievements were newly unlocked
    if (newlyUnlockedAchievements.length > 0) {
      // Update achievements
      setAchievements(updatedAchievements);
      
      // Update experience
      setExperience(prev => prev + experienceGained);
      
      // Add to recent achievements
      setRecentAchievements(prev => [...newlyUnlockedAchievements, ...prev]);
      
      // Store updated achievements
      localStorage.setItem('gamification_achievements', JSON.stringify({ 
        achievements: updatedAchievements 
      }));
    }
  }, [stats, achievements]);
  
  // Store stats when they change
  useEffect(() => {
    localStorage.setItem('gamification_stats', JSON.stringify({ 
      stats,
      experience 
    }));
  }, [stats, experience]);
  
  return {
    level,
    experience,
    experienceToNextLevel,
    achievements,
    stats,
    percentToNextLevel,
    recentAchievements,
    showLevelUp,
    resetLevelUpNotification
  };
}