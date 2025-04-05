import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface GameViewportProps {
  currentWord: string;
  userInput: string;
  isGameActive: boolean;
  slidingWordRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  pronunciateWord: () => void;
}

const GameViewport: React.FC<GameViewportProps> = ({
  currentWord,
  userInput,
  isGameActive,
  slidingWordRef,
  inputRef,
  handleInputChange,
  handleKeyDown,
  pronunciateWord,
}) => {
  return (
    <div className="game-container p-6 relative">
      {/* Sliding Word Area */}
      <div className="word-container h-32 flex items-center justify-center rounded-lg bg-slate-100 mb-6 relative shadow-inner perspective-1000 w-full overflow-hidden">
        <div 
          ref={slidingWordRef}
          className={`absolute font-[Poppins] text-3xl font-semibold tracking-wide flex items-center h-full ${
            !currentWord ? "hidden" : "animate-slide-left"
          }`}
        >
          {currentWord.split("").map((char, index) => {
            let className = "spanish-word-char px-1 text-slate-700";
            
            // Normalize function for Spanish characters
            const normalizeChar = (c: string) => {
              return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            };
            
            if (index < userInput.length) {
              const normalizedUserChar = userInput[index] ? normalizeChar(userInput[index].toLowerCase()) : '';
              const normalizedWordChar = normalizeChar(char.toLowerCase());
              
              if (userInput[index].toLowerCase() === char.toLowerCase() || 
                  normalizedUserChar === normalizedWordChar) {
                className = "spanish-word-char px-1 text-green-500 font-bold scale-110";
              } else {
                className = "spanish-word-char px-1 text-red-500";
              }
            }
            
            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Game Start Prompt - now handled in the Game component */}
      </div>

      {/* Input Area */}
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-md mx-auto">
          <input
            type="text"
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 text-xl border-2 border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-[Poppins] transition-all"
            placeholder="Type the word here..."
            autoComplete="off"
            autoCapitalize="none"
            disabled={!isGameActive}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={pronunciateWord}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600 p-2 rounded-full transition-colors"
            disabled={!isGameActive || !currentWord}
          >
            <Volume2 className="h-6 w-6" />
          </Button>
        </div>
        <p className="text-sm text-slate-500 mt-3 text-center">
          Type the complete word before it slides off the screen
        </p>
      </div>
    </div>
  );
};

export default GameViewport;
