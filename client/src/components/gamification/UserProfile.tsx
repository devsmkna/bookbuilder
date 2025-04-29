import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Award, BookOpen, Map, Users, Star, Trophy } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';

export default function UserProfile() {
  const { 
    level, 
    experience, 
    experienceToNextLevel, 
    achievements, 
    stats,
    percentToNextLevel,
    recentAchievements
  } = useGamification();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Writer Profile</CardTitle>
            <CardDescription>Track your writing progress</CardDescription>
          </div>
          <Badge className="text-lg px-3 py-1">Level {level}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Experience</span>
            <span>{experience} / {experienceToNextLevel} XP</span>
          </div>
          <Progress value={percentToNextLevel} className="h-2" />
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <BookOpen className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Words</span>
            <span className="font-medium">{stats.wordCount}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <Users className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Characters</span>
            <span className="font-medium">{stats.characterCount}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <Map className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Places</span>
            <span className="font-medium">{stats.placeCount}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <Trophy className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Achievements</span>
            <span className="font-medium">{achievements.filter(a => a.unlocked).length} / {achievements.length}</span>
          </div>
        </div>

        {recentAchievements.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2">Recent Achievements</h3>
            <div className="space-y-2">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center p-2 bg-accent/10 rounded-md">
                  <div className="h-8 w-8 mr-3 flex items-center justify-center rounded-full bg-accent/20">
                    <Award className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  <span className="text-xs font-medium text-accent">+{achievement.xp} XP</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}