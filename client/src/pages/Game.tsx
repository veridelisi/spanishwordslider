import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import GameInterface from "@/components/GameInterface";
import GameOverModal from "@/components/GameOverModal";
import useGameLogic from "@/hooks/useGameLogic";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

const Game: React.FC = () => {
  const {
    score,
    level,
    currentWord,
    userInput,
    isGameOver,
    isGameActive,
    isSoundEnabled,
    slidingWordRef,
    inputRef,
    gameSpeed,
    startNewGame,
    handleInputChange,
    handleKeyDown,
    toggleSound,
    pronunciateWord,
    changeGameSpeed,
  } = useGameLogic();

  // Focus the input when the game starts
  useEffect(() => {
    if (isGameActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isGameActive, inputRef]);

  return (
    <div className="game-page min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Spanish Word Game | Play and Learn</title>
      </Helmet>

      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-indigo-600">
            Spanish Word Game
          </h1>
          <p className="text-sm text-center text-slate-500 mt-1">
            Test your Spanish vocabulary and typing skills
          </p>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {!isGameActive && !isGameOver ? (
            <div className="text-center bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Welcome to Spanish Word Game!</h2>
              <p className="mb-6 text-slate-600">
                Type Spanish words before they slide off the screen. The faster you type, the higher your score!
              </p>
              
              <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Game Instructions:</p>
                <ul className="text-left text-sm space-y-2 text-slate-600">
                  <li>• Spanish words will slide across the screen from right to left</li>
                  <li>• Type the word correctly before it disappears</li>
                  <li>• Each correct letter turns green, incorrect letters turn red</li>
                  <li>• Click the sound icon to hear the word pronounced in Spanish</li>
                  <li>• Select your preferred game speed below</li>
                </ul>
              </div>
              
              <div className="mb-6">
                <GameInterface
                  score={score}
                  level={level}
                  currentWord=""
                  userInput=""
                  isGameActive={false}
                  isSoundEnabled={isSoundEnabled}
                  slidingWordRef={slidingWordRef}
                  inputRef={inputRef}
                  handleInputChange={handleInputChange}
                  handleKeyDown={handleKeyDown}
                  toggleSound={toggleSound}
                  pronunciateWord={pronunciateWord}
                  currentSpeed={gameSpeed}
                  onSpeedChange={changeGameSpeed}
                />
              </div>
              
              <Button 
                size="lg" 
                onClick={startNewGame}
                className="w-full sm:w-auto px-8 py-6 text-lg"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          ) : (
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
              currentSpeed={gameSpeed}
              onSpeedChange={changeGameSpeed}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-center text-slate-500">
            Spanish Word Game | Learn, Practice & Have Fun
          </p>
        </div>
      </footer>
      
      <GameOverModal
        isGameOver={isGameOver}
        score={score}
        onRestart={startNewGame}
        currentSpeed={gameSpeed}
        onSpeedChange={changeGameSpeed}
      />
    </div>
  );
};

export default Game;