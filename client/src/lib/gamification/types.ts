export type AchievementCategory = 'writing' | 'character' | 'world' | 'commitment';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xp: number;
  unlocked: boolean;
  progress?: number;  // 0-100
  condition: {
    type: 'wordCount' | 'characterCount' | 'placeCount' | 'sessionsCompleted' | 'wordsPerDay' | 'writeStreak';
    threshold: number;
  };
}

export interface LevelDefinition {
  level: number;
  xpRequired: number;
  unlockedFeatures: string[];
}

export interface UserStats {
  wordCount: number;
  characterCount: number;
  placeCount: number;
  sessionsCompleted: number;
  wordsPerDay: number;
  writeStreak: number;
  longestWriteStreak: number;
}