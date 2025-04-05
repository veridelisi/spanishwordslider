import React from 'react';
import { Button } from "@/components/ui/button";
import { GameSpeedSetting } from '@/hooks/useGameLogic';
import { RocketIcon, GaugeIcon, TimerIcon } from 'lucide-react';

interface SpeedSelectorProps {
  currentSpeed: GameSpeedSetting;
  onChange: (speed: GameSpeedSetting) => void;
  disabled?: boolean;
}

const SpeedSelector: React.FC<SpeedSelectorProps> = ({ 
  currentSpeed, 
  onChange,
  disabled = false
}) => {
  const speeds: { value: GameSpeedSetting; label: string; icon: React.ReactNode }[] = [
    { 
      value: 'slow', 
      label: 'Slow', 
      icon: <TimerIcon className="h-4 w-4 mr-1" /> 
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      icon: <GaugeIcon className="h-4 w-4 mr-1" /> 
    },
    { 
      value: 'fast', 
      label: 'Fast', 
      icon: <RocketIcon className="h-4 w-4 mr-1" /> 
    },
  ];
  
  return (
    <div className="speed-selector flex flex-col space-y-1 w-full">
      <label className="text-sm text-slate-500 mb-1">Game Speed:</label>
      <div className="flex space-x-2">
        {speeds.map(speed => (
          <Button
            key={speed.value}
            variant={currentSpeed === speed.value ? "default" : "outline"}
            size="sm"
            className="flex-1 flex items-center justify-center"
            onClick={() => onChange(speed.value)}
            disabled={disabled}
          >
            {speed.icon}
            {speed.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SpeedSelector;