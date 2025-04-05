import React from "react";
import StatusBar from "./StatusBar";
import GameViewport from "./GameViewport";
import GameInstructions from "./GameInstructions";

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
}) => {
  return (
    <main className="w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden">
      <StatusBar score={score} level={level} isSoundEnabled={isSoundEnabled} toggleSound={toggleSound} />
      
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
      
      <GameInstructions />
    </main>
  );
};

export default GameInterface;
