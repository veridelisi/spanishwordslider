import React from "react";
import StatusBar from "./StatusBar";
import GameViewport from "./GameViewport";
import { GameSpeedSetting } from "@/hooks/useGameLogic";
import SpeedSelector from "./SpeedSelector";

interface GameInterfaceProps {
  score: number;
  level: number;
  currentWord: string;
  userInput: string;
  isGameActive: boolean;
  isSoundEnabled: boolean;
  slidingWordRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  toggleSound: () => void;
  pronunciateWord: () => void;
  currentSpeed: GameSpeedSetting;
  onSpeedChange: (speed: GameSpeedSetting) => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  score,
  level,
  currentWord,
  userInput,
  isGameActive,
  isSoundEnabled,
  slidingWordRef,
  inputRef,
  handleInputChange,
  handleKeyDown,
  toggleSound,
  pronunciateWord,
  currentSpeed,
  onSpeedChange,
}) => {
  return (
    <div className="game-interface w-full max-w-3xl mx-auto flex flex-col px-4 sm:px-6">
      <StatusBar
        score={score}
        level={level}
        isSoundEnabled={isSoundEnabled}
        toggleSound={toggleSound}
      />
      
      <GameViewport
        currentWord={currentWord}
        userInput={userInput}
        isGameActive={isGameActive}
        slidingWordRef={slidingWordRef}
        inputRef={inputRef}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        pronunciateWord={pronunciateWord}
      />
      
      <div className="mt-4 sm:mt-6">
        <SpeedSelector 
          currentSpeed={currentSpeed}
          onChange={onSpeedChange}
          disabled={!isGameActive} 
        />
      </div>
    </div>
  );
};

export default GameInterface;