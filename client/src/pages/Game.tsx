import React from "react";
import GameHeader from "@/components/GameHeader";
import GameInterface from "@/components/GameInterface";
import GameOverModal from "@/components/GameOverModal";
import useGameLogic from "@/hooks/useGameLogic";
import { Button } from "@/components/ui/button";

const Game: React.FC = () => {
  const {
    score,
    level,
    currentWord,
    userInput,
    isGameActive,
    isGameOver,
    isSoundEnabled,
    slidingWordRef,
    inputRef,
    handleInputChange,
    handleKeyDown,
    toggleSound,
    pronunciateWord,
    startGame,
    restartGame,
  } = useGameLogic();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50 to-blue-100 font-[Open_Sans]">
      <div className="w-full max-w-6xl">
        <GameHeader />
        
        {!isGameActive && !isGameOver && (
          <div className="mb-6 flex flex-col items-center">
            <Button 
              onClick={startGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md text-xl"
            >
              Start Game
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              or press Enter to begin
            </p>
          </div>
        )}
        
        <GameInterface
          score={score}
          level={level}
          currentWord={currentWord}
          userInput={userInput}
          isGameActive={isGameActive}
          isSoundEnabled={isSoundEnabled}
          slidingWordRef={slidingWordRef}
          inputRef={inputRef}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          toggleSound={toggleSound}
          pronunciateWord={pronunciateWord}
        />
        
        <GameOverModal
          isGameOver={isGameOver}
          score={score}
          onRestart={restartGame}
        />
      </div>
    </div>
  );
};

export default Game;
