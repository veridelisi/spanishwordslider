import React from "react";
import GameHeader from "@/components/GameHeader";
import GameInterface from "@/components/GameInterface";
import GameOverModal from "@/components/GameOverModal";
import useGameLogic from "@/hooks/useGameLogic";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-[Open_Sans]">
      <GameHeader />
      
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
  );
};

export default Game;
