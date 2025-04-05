import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface StatusBarProps {
  score: number;
  level: number;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ score, level, isSoundEnabled, toggleSound }) => {
  return (
    <div className="bg-indigo-50 px-6 py-3 flex justify-between items-center border-b border-indigo-100">
      <div className="flex items-center space-x-4">
        <div>
          <span className="text-sm text-slate-500">Score</span>
          <p className="font-bold text-indigo-600">{score}</p>
        </div>
        <div>
          <span className="text-sm text-slate-500">Level</span>
          <p className="font-bold text-indigo-600">{level}</p>
        </div>
      </div>
      <div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSound} 
          className="p-2 rounded-full hover:bg-indigo-100 transition-colors"
        >
          {isSoundEnabled ? (
            <Volume2 className="h-5 w-5 text-indigo-600" />
          ) : (
            <VolumeX className="h-5 w-5 text-indigo-400" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default StatusBar;
