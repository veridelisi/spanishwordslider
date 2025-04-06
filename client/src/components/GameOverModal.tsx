import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GameSpeedSetting } from '@/hooks/useGameLogic';
import SpeedSelector from './SpeedSelector';

interface GameOverModalProps {
  isGameOver: boolean;
  score: number;
  onRestart: () => void;
  currentSpeed: GameSpeedSetting;
  onSpeedChange: (speed: GameSpeedSetting) => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ 
  isGameOver, 
  score, 
  onRestart,
  currentSpeed,
  onSpeedChange
}) => {
  return (
    <Dialog open={isGameOver} onOpenChange={() => onRestart()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Game Over</DialogTitle>
          <DialogDescription className="text-center">
            <div className="mt-4 mb-6">
              <p className="text-lg font-medium">Your Score</p>
              <p className="text-3xl font-bold text-indigo-600">{score}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <SpeedSelector 
              currentSpeed={currentSpeed}
              onChange={onSpeedChange}
              disabled={false}
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Adjust speed before starting a new game
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={onRestart}
              size="lg"
              className="w-full"
            >
              Play Again
            </Button>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <div className="w-full text-center text-sm text-slate-500">
            Practice makes perfect! Keep learning Spanish words.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameOverModal;