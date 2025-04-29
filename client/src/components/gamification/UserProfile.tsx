import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/use-gamification';
import { XP_LEVELS } from '@/lib/gamification/constants';
import { Trophy, Star, Book, Calendar } from 'lucide-react';

export default function UserProfile() {
  const { 
    level, 
    experience, 
    experienceToNextLevel, 
    percentToNextLevel,
    stats 
  } = useGamification();
  
  const currentLevelInfo = XP_LEVELS[level] || { unlockedFeatures: [] };
  const nextLevelInfo = level < 10 ? XP_LEVELS[level + 1] : null;
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Level and XP Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Writer Level
          </CardTitle>
          <CardDescription>
            Your current writing progress and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">Level {level}</p>
                <p className="text-sm text-muted-foreground">
                  {experience} XP total
                </p>
              </div>
              
              {nextLevelInfo && (
                <div className="text-right">
                  <p className="text-sm font-medium">Next Level</p>
                  <p className="text-sm text-muted-foreground">
                    {experienceToNextLevel} XP needed
                  </p>
                </div>
              )}
            </div>
            
            {nextLevelInfo && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Progress to Level {level + 1}</span>
                  <span>{Math.round(percentToNextLevel)}%</span>
                </div>
                <Progress value={percentToNextLevel} className="h-2" />
              </div>
            )}
            
            {/* Current Level Features */}
            <div className="mt-4 rounded-lg bg-accent/10 p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                Current Abilities
              </h4>
              <ul className="space-y-1">
                {currentLevelInfo.unlockedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">•</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Next Level Features */}
            {nextLevelInfo && (
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  Next Level Abilities
                </h4>
                <ul className="space-y-1">
                  {nextLevelInfo.unlockedFeatures
                    .filter(feature => !currentLevelInfo.unlockedFeatures.includes(feature))
                    .map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>•</span> {feature}
                      </li>
                    ))
                  }
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Writing Statistics
          </CardTitle>
          <CardDescription>
            Your writing activity and accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Words Written</p>
              <p className="text-2xl font-bold">{stats.wordCount}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Characters Created</p>
              <p className="text-2xl font-bold">{stats.characterCount}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Places Created</p>
              <p className="text-2xl font-bold">{stats.placeCount}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{stats.writeStreak} days</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Writing Consistency
            </p>
            <div className="h-16 flex items-end gap-1">
              {/* This would be replaced with actual daily data in a real implementation */}
              {Array.from({ length: 7 }).map((_, i) => {
                const randomHeight = 20 + Math.floor(Math.random() * 80);
                return (
                  <div 
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t"
                    style={{ height: `${randomHeight}%` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}