import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Check, Lock } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Achievements() {
  const { achievements } = useGamification();
  
  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);
  
  // Get categories
  const categories = Object.keys(achievementsByCategory);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Achievements
        </CardTitle>
        <CardDescription>Complete goals to earn XP and level up</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="pt-4">
              <div className="space-y-3">
                {achievementsByCategory[category].map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-3 border rounded-lg flex items-center ${
                      achievement.unlocked ? 'bg-accent/10 border-accent/20' : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      achievement.unlocked ? 'bg-accent/20' : 'bg-muted'
                    }`}>
                      {achievement.unlocked ? (
                        <Check className="h-5 w-5 text-accent" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium">{achievement.title}</h3>
                        {achievement.unlocked && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            +{achievement.xp} XP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      
                      {achievement.progress !== undefined && achievement.progress < 100 && !achievement.unlocked && (
                        <div className="w-full h-1 bg-muted mt-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent" 
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}