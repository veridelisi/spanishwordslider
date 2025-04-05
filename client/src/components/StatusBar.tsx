import React from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface StatusBarProps {
  score: number;
  level: number;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  score, 
  level, 
  isSoundEnabled, 
  toggleSound 
}) => {
  return (
    <div className="status-bar w-full bg-white p-3 rounded-lg shadow-sm mb-4 flex items-center justify-between border border-slate-100">
      <div className="flex space-x-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Score</span>
          <span className="font-bold text-indigo-600">{score}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Level</span>
          <span className="font-bold text-indigo-600">{level}</span>
        </div>
      </div>
      
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className="rounded-full h-8 w-8 p-0"
          title={isSoundEnabled ? "Mute sound" : "Enable sound"}
        >
          {isSoundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default StatusBar;