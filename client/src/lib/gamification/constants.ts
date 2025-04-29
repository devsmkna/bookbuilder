import { Achievement, LevelDefinition, UserStats } from './types';

// XP levels and requirements
export const XP_LEVELS: Record<number, LevelDefinition> = {
  1: {
    level: 1,
    xpRequired: 0,
    unlockedFeatures: ['Basic Editor Features']
  },
  2: {
    level: 2,
    xpRequired: 100,
    unlockedFeatures: ['Character Creation']
  },
  3: {
    level: 3,
    xpRequired: 250,
    unlockedFeatures: ['World Building']
  },
  4: {
    level: 4,
    xpRequired: 500,
    unlockedFeatures: ['Character-to-Place Linking']
  },
  5: {
    level: 5,
    xpRequired: 1000,
    unlockedFeatures: ['Daily Writing Metrics']
  },
  6: {
    level: 6,
    xpRequired: 2000,
    unlockedFeatures: ['Advanced Character Development Templates']
  },
  7: {
    level: 7,
    xpRequired: 3500,
    unlockedFeatures: ['Multiple Maps Support']
  },
  8: {
    level: 8,
    xpRequired: 5000,
    unlockedFeatures: ['Timeline Creation']
  },
  9: {
    level: 9,
    xpRequired: 7500,
    unlockedFeatures: ['Relationship Web']
  },
  10: {
    level: 10,
    xpRequired: 10000,
    unlockedFeatures: ['Master Writer Status', 'Custom Themes']
  }
};

// List of achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Writing achievements
  {
    id: 'writing-1',
    title: 'First Words',
    description: 'Write your first 100 words',
    category: 'writing',
    xp: 10,
    unlocked: false,
    condition: {
      type: 'wordCount',
      threshold: 100
    }
  },
  {
    id: 'writing-2',
    title: 'Budding Author',
    description: 'Reach 1,000 words in your writing',
    category: 'writing',
    xp: 30,
    unlocked: false,
    condition: {
      type: 'wordCount',
      threshold: 1000
    }
  },
  {
    id: 'writing-3',
    title: 'Prolific Writer',
    description: 'Reach 5,000 words in your writing',
    category: 'writing',
    xp: 75,
    unlocked: false,
    condition: {
      type: 'wordCount',
      threshold: 5000
    }
  },
  {
    id: 'writing-4',
    title: 'Novelist',
    description: 'Reach 10,000 words in your writing',
    category: 'writing',
    xp: 150,
    unlocked: false,
    condition: {
      type: 'wordCount',
      threshold: 10000
    }
  },
  {
    id: 'writing-5',
    title: 'Epic Storyteller',
    description: 'Reach 50,000 words in your writing',
    category: 'writing',
    xp: 500,
    unlocked: false,
    condition: {
      type: 'wordCount',
      threshold: 50000
    }
  },
  
  // Character achievements
  {
    id: 'character-1',
    title: 'Character Creator',
    description: 'Create your first character',
    category: 'character',
    xp: 25,
    unlocked: false,
    condition: {
      type: 'characterCount',
      threshold: 1
    }
  },
  {
    id: 'character-2',
    title: 'Supporting Cast',
    description: 'Create 5 different characters',
    category: 'character',
    xp: 50,
    unlocked: false,
    condition: {
      type: 'characterCount',
      threshold: 5
    }
  },
  {
    id: 'character-3',
    title: 'Ensemble Director',
    description: 'Create 15 different characters',
    category: 'character',
    xp: 100,
    unlocked: false,
    condition: {
      type: 'characterCount',
      threshold: 15
    }
  },
  {
    id: 'character-4',
    title: 'Character Master',
    description: 'Create 30 different characters',
    category: 'character',
    xp: 200,
    unlocked: false,
    condition: {
      type: 'characterCount',
      threshold: 30
    }
  },
  
  // World Building achievements
  {
    id: 'world-1',
    title: 'World Builder',
    description: 'Create your first place',
    category: 'world',
    xp: 25,
    unlocked: false,
    condition: {
      type: 'placeCount',
      threshold: 1
    }
  },
  {
    id: 'world-2',
    title: 'Terrain Mapper',
    description: 'Create 5 different places',
    category: 'world',
    xp: 50,
    unlocked: false,
    condition: {
      type: 'placeCount',
      threshold: 5
    }
  },
  {
    id: 'world-3',
    title: 'Geography Expert',
    description: 'Create 15 different places',
    category: 'world',
    xp: 100,
    unlocked: false,
    condition: {
      type: 'placeCount',
      threshold: 15
    }
  },
  {
    id: 'world-4',
    title: 'World Master',
    description: 'Create 30 different places',
    category: 'world',
    xp: 200,
    unlocked: false,
    condition: {
      type: 'placeCount',
      threshold: 30
    }
  },
  
  // Commitment achievements
  {
    id: 'commitment-1',
    title: 'Dedicated Writer',
    description: 'Complete 7 writing sessions',
    category: 'commitment',
    xp: 25,
    unlocked: false,
    condition: {
      type: 'sessionsCompleted',
      threshold: 7
    }
  },
  {
    id: 'commitment-2',
    title: 'Consistent Creator',
    description: 'Write for 3 days in a row',
    category: 'commitment',
    xp: 30,
    unlocked: false,
    condition: {
      type: 'writeStreak',
      threshold: 3
    }
  },
  {
    id: 'commitment-3',
    title: 'Writing Habit',
    description: 'Write for 7 days in a row',
    category: 'commitment',
    xp: 75,
    unlocked: false,
    condition: {
      type: 'writeStreak',
      threshold: 7
    }
  },
  {
    id: 'commitment-4',
    title: 'Unstoppable Author',
    description: 'Write for 14 days in a row',
    category: 'commitment',
    xp: 150,
    unlocked: false,
    condition: {
      type: 'writeStreak',
      threshold: 14
    }
  },
  {
    id: 'commitment-5',
    title: 'Writing Master',
    description: 'Write for 30 days in a row',
    category: 'commitment',
    xp: 300,
    unlocked: false,
    condition: {
      type: 'writeStreak',
      threshold: 30
    }
  }
];

// Utility functions

// Calculate level from XP
export function calculateLevelFromXP(xp: number): number {
  let level = 1;
  
  // Find the highest level the user has reached
  for (let i = 10; i >= 1; i--) {
    if (xp >= XP_LEVELS[i].xpRequired) {
      level = i;
      break;
    }
  }
  
  return level;
}

// Get XP required for a specific level
export function getExperienceForLevel(level: number): number {
  return XP_LEVELS[Math.min(Math.max(level, 1), 10)].xpRequired;
}

// Check if an achievement should be unlocked
export function checkAchievementUnlock(
  achievement: Achievement, 
  stats: UserStats
): { unlocked: boolean; progress: number; newlyUnlocked: boolean } {
  const { condition } = achievement;
  const statValue = stats[condition.type];
  const progress = Math.min(100, Math.floor((statValue / condition.threshold) * 100));
  const unlocked = statValue >= condition.threshold;
  
  // Check if newly unlocked (was locked before, is unlocked now)
  const newlyUnlocked = !achievement.unlocked && unlocked;
  
  return { unlocked, progress, newlyUnlocked };
}