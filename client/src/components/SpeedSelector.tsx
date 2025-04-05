import React from "react";
import { Button } from "@/components/ui/button";
import { GameSpeedSetting } from "@/hooks/useGameLogic";

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
  return (
    <div className="flex flex-wrap justify-center gap-2 my-4">
      <div className="w-full text-center mb-2 text-sm font-medium text-slate-600">
        Select Game Speed:
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          size="sm"
          variant={currentSpeed === "slow" ? "default" : "outline"}
          onClick={() => onChange("slow")}
          disabled={disabled}
          className={`${currentSpeed === "slow" ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700 hover:bg-green-50"}`}
        >
          Slow
        </Button>
        <Button
          size="sm"
          variant={currentSpeed === "medium" ? "default" : "outline"}
          onClick={() => onChange("medium")}
          disabled={disabled}
          className={`${currentSpeed === "medium" ? "bg-blue-600 hover:bg-blue-700" : "border-blue-300 text-blue-700 hover:bg-blue-50"}`}
        >
          Medium
        </Button>
        <Button
          size="sm"
          variant={currentSpeed === "fast" ? "default" : "outline"}
          onClick={() => onChange("fast")}
          disabled={disabled}
          className={`${currentSpeed === "fast" ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-700 hover:bg-red-50"}`}
        >
          Fast
        </Button>
      </div>
      <div className="w-full text-center mt-1 text-xs text-slate-500">
        {currentSpeed === "slow" && "Perfect for beginners - words move slower"}
        {currentSpeed === "medium" && "Standard speed - balanced difficulty"}
        {currentSpeed === "fast" && "Challenge mode - for advanced players"}
      </div>
    </div>
  );
};

export default SpeedSelector;