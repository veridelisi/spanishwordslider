import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import ExplosionEffect from "./ExplosionEffect";
import VirtualKeyboard from "./VirtualKeyboard";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [prevUserInput, setPrevUserInput] = useState("");
  const [explosions, setExplosions] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [explosionCounter, setExplosionCounter] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isMobile = useIsMobile();
  
  // Enhanced pronunciateWord function with visual feedback
  const handlePronunciateWord = () => {
    setIsSpeaking(true);
    pronunciateWord();
    
    // Reset speaking state after a short delay
    setTimeout(() => {
      setIsSpeaking(false);
    }, 1500);
  };
  
  // Handle virtual keyboard key press
  const handleVirtualKeyPress = (key: string) => {
    if (!isGameActive || !inputRef.current) return;
    
    // Create a synthetic event for the input change
    const newValue = userInput + key;
    const syntheticEvent = {
      target: { value: newValue },
      preventDefault: () => {},
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    
    // Keep focus on the input field after clicking the virtual keyboard
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle virtual keyboard backspace
  const handleVirtualBackspace = () => {
    if (!isGameActive || !inputRef.current) return;
    
    // Remove the last character
    const newValue = userInput.slice(0, -1);
    const syntheticEvent = {
      target: { value: newValue },
      preventDefault: () => {},
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    
    // Keep focus on the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle virtual keyboard space
  const handleVirtualSpace = () => {
    if (!isGameActive || !inputRef.current) return;
    
    // Add a space
    const newValue = userInput + " ";
    const syntheticEvent = {
      target: { value: newValue },
      preventDefault: () => {},
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    
    // Keep focus on the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Track user input to detect word completion
  useEffect(() => {
    // If the user input was reset after being the same length as current word,
    // that means a word was completed successfully
    if (prevUserInput.length === currentWord.length && userInput === "" && currentWord !== "") {
      // Get the position of the word for explosion effect
      if (slidingWordRef.current) {
        const rect = slidingWordRef.current.getBoundingClientRect();
        // Create explosion at the center of the word
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Add new explosion with unique ID
        setExplosions(prev => [...prev, {
          id: explosionCounter,
          x: centerX,
          y: centerY
        }]);
        setExplosionCounter(prev => prev + 1);
      }
    }
    
    setPrevUserInput(userInput);
  }, [userInput, currentWord, prevUserInput, slidingWordRef, explosionCounter]);

  // Remove explosion after animation completes
  const handleExplosionComplete = (id: number) => {
    setExplosions(prev => prev.filter(exp => exp.id !== id));
  };

  // Render word characters with appropriate styling based on user input
  const renderWordCharacters = () => {
    if (!currentWord) return null;
    
    return currentWord.split("").map((char, index) => {
      let className = "spanish-word-char px-1 text-slate-800 transition-all duration-300";
      
      // Enhanced normalize function for Spanish characters
      const normalizeChar = (c: string) => {
        // First normalize using NFD (decomposition)
        const normalized = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Special case for ñ/Ñ which should normalize to n/N
        if (c === 'ñ' || c === 'Ñ') {
          return 'n';
        }
        
        return normalized.toLowerCase();
      };
      
      if (index < userInput.length) {
        const normalizedUserChar = userInput[index] ? normalizeChar(userInput[index].toLowerCase()) : '';
        const normalizedWordChar = normalizeChar(char.toLowerCase());
        
        if (userInput[index].toLowerCase() === char.toLowerCase() || 
            normalizedUserChar === normalizedWordChar) {
          className = "spanish-word-char px-1 text-green-500 font-bold transform scale-110 transition-all duration-300";
        } else {
          className = "spanish-word-char px-1 text-red-500 transition-all duration-300";
        }
      }
      
      return (
        <span key={index} className={className} style={{textShadow: "1px 1px 2px rgba(0,0,0,0.1)"}}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="game-container p-3 sm:p-6 relative w-full">
      {/* Sliding Word Area */}
      <div className="word-container h-36 sm:h-48 md:h-60 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 mb-4 sm:mb-8 relative shadow-lg perspective-1000 w-full overflow-hidden border border-indigo-100">
        <div 
          ref={slidingWordRef}
          className={`absolute font-[Poppins] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-wider flex items-center h-full ${
            !currentWord ? "hidden" : "animate-slide-left"
          }`}
          style={currentWord ? { animation: `slideLeft ${isGameActive ? '10000ms' : '0s'} linear forwards` } : {}}
        >
          {renderWordCharacters()}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex flex-col items-center w-full">
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
          <input
            type="text"
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-lg sm:text-xl border-2 border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-[Poppins] transition-all"
            placeholder="Type the word here..."
            autoComplete="off"
            autoCapitalize="none"
            disabled={!isGameActive}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handlePronunciateWord}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
              isSpeaking 
                ? "text-white bg-indigo-600 border-indigo-700 animate-pulse" 
                : "text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
            }`}
            disabled={!isGameActive || !currentWord}
            title="Click to hear pronunciation"
          >
            <Volume2 className="h-6 w-6" />
            <span className="sr-only">Hear pronunciation</span>
          </Button>
        </div>
        <p className="text-sm text-slate-500 mt-3 text-center">
          Type the complete word before it slides off the screen
        </p>
      </div>
      
      {/* Render explosion effects */}
      {explosions.map(explosion => (
        <ExplosionEffect
          key={explosion.id}
          position={{ x: explosion.x, y: explosion.y }}
          onAnimationComplete={() => handleExplosionComplete(explosion.id)}
        />
      ))}
      
      {/* Virtual Keyboard for mobile devices */}
      {isMobile && (
        <div className="mt-4 sm:mt-6">
          <VirtualKeyboard
            onKeyPress={handleVirtualKeyPress}
            onBackspace={handleVirtualBackspace}
            onSpace={handleVirtualSpace}
            disabled={!isGameActive}
          />
        </div>
      )}
    </div>
  );
};

export default GameViewport;
