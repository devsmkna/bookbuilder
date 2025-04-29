import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { Confetti } from '@/components/ui/confetti';
import { XP_LEVELS } from '@/lib/gamification/constants';

interface LevelUpNotificationProps {
  level: number;
  onClose: () => void;
  open: boolean;
}

export function LevelUpNotification({ level, onClose, open }: LevelUpNotificationProps) {
  const levelInfo = XP_LEVELS[level] || { unlockedFeatures: [] };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {open && <Confetti />}
        
        <DialogHeader>
          <DialogTitle className="text-center flex flex-col items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">Level Up!</div>
              <div className="text-4xl font-extrabold text-primary">Level {level}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="text-center">
            <p className="text-lg font-medium">
              Congratulations on reaching Level {level}!
            </p>
            <p className="text-muted-foreground mt-2">
              You've unlocked new features and abilities.
            </p>
          </div>
          
          {levelInfo.unlockedFeatures.length > 0 && (
            <div className="w-full bg-accent/10 rounded-lg p-4">
              <h3 className="font-medium mb-2">Newly Unlocked:</h3>
              <ul className="space-y-1">
                {levelInfo.unlockedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">•</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Keep writing and creating to earn more experience!</p>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}