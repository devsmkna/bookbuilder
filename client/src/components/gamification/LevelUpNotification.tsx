import React, { useEffect, useState } from 'react';
import { Confetti } from '@/components/ui/confetti';
import { XP_LEVELS } from '@/lib/gamification/constants';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Award, Star, TrendingUp } from 'lucide-react';

interface LevelUpNotificationProps {
  level: number;
  onClose: () => void;
  open: boolean;
}

export function LevelUpNotification({ level, onClose, open }: LevelUpNotificationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open]);

  // Get unlocked features for this level
  const unlockedFeatures = XP_LEVELS[level]?.unlockedFeatures || [];

  return (
    <>
      {showConfetti && <Confetti />}
      
      <Dialog open={open} onOpenChange={(value) => {
        if (!value) onClose();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-center text-2xl">Level Up!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              You've reached Level {level}
            </DialogDescription>
          </DialogHeader>
          
          {unlockedFeatures.length > 0 && (
            <div className="space-y-4 my-4">
              <h3 className="text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-1 text-accent" />
                New Features Unlocked
              </h3>
              <div className="space-y-2">
                {unlockedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center p-2 rounded-md bg-muted">
                    <Award className="h-4 w-4 mr-2 text-accent" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Button onClick={onClose}>Continue Writing</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}