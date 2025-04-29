import React, { useState } from 'react';
import { useGamification } from '@/hooks/use-gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { AchievementCategory } from '@/lib/gamification/types';

export default function Achievements() {
  const { achievements } = useGamification();
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter achievements by category and search query
  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    const matchesSearch = 
      achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Get stats for each category
  const categoryCounts = {
    writing: achievements.filter(a => a.category === 'writing' && a.unlocked).length,
    character: achievements.filter(a => a.category === 'character' && a.unlocked).length,
    world: achievements.filter(a => a.category === 'world' && a.unlocked).length,
    commitment: achievements.filter(a => a.category === 'commitment' && a.unlocked).length,
  };
  
  const totalUnlocked = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  const percentComplete = (totalUnlocked / totalAchievements) * 100;
  
  // Get color based on category
  const getCategoryColor = (category: AchievementCategory) => {
    switch (category) {
      case 'writing':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'character':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
      case 'world':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      case 'commitment':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Achievement Progress</CardTitle>
          <CardDescription>
            You've unlocked {totalUnlocked} of {totalAchievements} achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Overall Progress</span>
                <span>{Math.round(percentComplete)}%</span>
              </div>
              <Progress value={percentComplete} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-center">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Writing
                </div>
                <div className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">
                  {categoryCounts.writing}
                </div>
              </div>
              
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-3 text-center">
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Characters
                </div>
                <div className="text-2xl font-bold mt-1 text-purple-700 dark:text-purple-300">
                  {categoryCounts.character}
                </div>
              </div>
              
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-center">
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  World
                </div>
                <div className="text-2xl font-bold mt-1 text-green-700 dark:text-green-300">
                  {categoryCounts.world}
                </div>
              </div>
              
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 text-center">
                <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Commitment
                </div>
                <div className="text-2xl font-bold mt-1 text-amber-700 dark:text-amber-300">
                  {categoryCounts.commitment}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Achievement List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle>Achievements</CardTitle>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search achievements..."
                className="w-full rounded-md border border-input bg-transparent px-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as AchievementCategory | 'all')}
          >
            <TabsList className="mb-4 w-full grid grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="character">Characters</TabsTrigger>
              <TabsTrigger value="world">World</TabsTrigger>
              <TabsTrigger value="commitment">Commitment</TabsTrigger>
            </TabsList>
            
            <TabsContent value={categoryFilter} className="space-y-4">
              {filteredAchievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No achievements match your search criteria.
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        achievement.unlocked ? 'border-primary/50 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {achievement.title}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className={`${getCategoryColor(achievement.category)}`}
                            >
                              {achievement.category}
                            </Badge>
                            {achievement.unlocked && (
                              <Badge variant="outline" className="bg-primary text-primary-foreground">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          {!achievement.unlocked && achievement.condition && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{achievement.progress || 0}%</span>
                              </div>
                              <Progress 
                                value={achievement.progress || 0} 
                                className="h-1"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-sm font-medium">
                            +{achievement.xp} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}