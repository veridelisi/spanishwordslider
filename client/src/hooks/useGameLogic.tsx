import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { speakWord } from "@/lib/speechUtils";
import { Word } from "@shared/schema";

// Game configuration
const GAME_CONFIG = {
  baseSpeed: 15000, // Base speed for word sliding in ms - slower for better gameplay
  speedIncrement: 500, // How much to decrease time per level
  minSpeed: 6000, // Minimum sliding speed - keep it slower
  wordsPerLevel: 5, // Words to complete before level up
  pronounceDelay: 500, // Delay before pronunciation in ms
};

export default function useGameLogic() {
  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(GAME_CONFIG.baseSpeed);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // Refs
  const slidingWordRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const wordsRef = useRef<Word[]>([]);
  
  // Fetch words from API
  const { data: words } = useQuery<Word[]>({
    queryKey: ['/api/words'],
    staleTime: Infinity,
  });
  
  useEffect(() => {
    if (words && Array.isArray(words) && words.length > 0) {
      wordsRef.current = words;
    }
  }, [words]);
  
  // Get a random word
  const getRandomWord = useCallback(() => {
    if (!wordsRef.current.length) return "";
    const randomIndex = Math.floor(Math.random() * wordsRef.current.length);
    return wordsRef.current[randomIndex].word;
  }, []);

  // Create word animation - defined here to avoid circular dependencies
  function createAnimation() {
    if (!slidingWordRef.current) return;
    
    // Reset the element - remove any existing inline styles
    slidingWordRef.current.style.animation = 'none';
    slidingWordRef.current.offsetHeight; // Trigger reflow
    
    // Clear existing animation style
    slidingWordRef.current.style.animation = '';
    
    // Use CSS-based animation with inline custom duration
    slidingWordRef.current.style.animationName = 'slideLeft';
    slidingWordRef.current.style.animationDuration = `${currentSpeed / 1000}s`;
    slidingWordRef.current.style.animationTimingFunction = 'linear';
    slidingWordRef.current.style.animationFillMode = 'forwards';
    
    // Get the animation object
    setTimeout(() => { // Add a small delay to ensure animation is registered
      const animations = slidingWordRef.current?.getAnimations() || [];
      if (animations.length > 0) {
        animationRef.current = animations[0];
        
        // Set up animation end listener
        animationRef.current.onfinish = () => {
          if (isGameActive && !isGameOver) {
            // End the game when animation finishes
            setIsGameActive(false);
            setIsGameOver(true);
            
            // Stop any ongoing animations
            if (animationRef.current) {
              animationRef.current.pause();
            }
          }
        };
      }
    }, 50);
    
    // Pronounce the word after a delay
    if (isSoundEnabled && currentWord) {
      setTimeout(() => {
        speakWord(currentWord);
      }, GAME_CONFIG.pronounceDelay);
    }
  }
  
  // Start a new word function
  function startNew() {
    const word = getRandomWord();
    setCurrentWord(word);
    
    // Schedule animation on next tick to ensure DOM is updated
    setTimeout(() => {
      createAnimation();
    }, 0);
  }
  
  // Complete current word
  function completeWord() {
    // Stop current animation
    if (animationRef.current) {
      animationRef.current.pause();
    }
    
    // Apply blow-away animation
    if (slidingWordRef.current) {
      slidingWordRef.current.style.animation = 'blowAway 0.5s ease-out forwards';
    }
    
    // Update score and progress
    const wordScore = currentWord.length * level;
    setScore(prevScore => prevScore + wordScore);
    setWordsCompleted(prev => {
      const newCount = prev + 1;
      
      // Check for level up
      if (newCount >= GAME_CONFIG.wordsPerLevel) {
        setLevel(prevLevel => {
          const newLevel = prevLevel + 1;
          // Increase speed with level
          setCurrentSpeed(Math.max(
            GAME_CONFIG.minSpeed, 
            GAME_CONFIG.baseSpeed - (newLevel - 1) * GAME_CONFIG.speedIncrement
          ));
          return newLevel;
        });
        return 0; // Reset words completed
      }
      
      return newCount;
    });
    
    // Reset input
    setUserInput("");
    
    // Flag to track if startNewWord was called
    let newWordStarted = false;
    
    // Start new word after animation with a reliable timeout
    setTimeout(() => {
      if (isGameActive && !isGameOver && !newWordStarted) {
        newWordStarted = true;
        startNew();
      }
    }, 800); // Slightly longer delay to ensure word appears
    
    // Backup timer in case the first one fails
    setTimeout(() => {
      if (isGameActive && !isGameOver && currentWord === "") {
        startNew();
      }
    }, 2000);
  }
  
  // Expose callbacks with proper memoization
  const startNewWord = useCallback(startNew, [getRandomWord, isGameActive, isGameOver, currentSpeed, isSoundEnabled, currentWord]);
  
  const handleWordCompletion = useCallback(completeWord, [currentWord, level, isGameActive, isGameOver, startNewWord]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();
    setUserInput(input);
    
    // Function to normalize strings for comparison (removing accents)
    const normalizeString = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    // Check if word is complete - using direct comparison first
    if (input === currentWord.toLowerCase()) {
      handleWordCompletion();
    } 
    // Then check with normalized strings (without accents)
    else if (normalizeString(input) === normalizeString(currentWord.toLowerCase())) {
      handleWordCompletion();
    }
  }, [currentWord, handleWordCompletion]);
  
  const startGame = useCallback(() => {
    // Reset game state
    setScore(0);
    setLevel(1);
    setWordsCompleted(0);
    setCurrentWord("");
    setUserInput("");
    setIsGameActive(true);
    setIsGameOver(false);
    setCurrentSpeed(GAME_CONFIG.baseSpeed);
    
    // Focus input and start first word
    if (inputRef.current) {
      inputRef.current.focus();
    }
    startNewWord();
  }, [startNewWord]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isGameActive && !isGameOver) {
        startGame();
      }
    }
  }, [isGameActive, isGameOver, startGame]);
  
  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setTimeout(() => {
      startGame();
    }, 300);
  }, [startGame]);
  
  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);
  
  const pronunciateWord = useCallback(() => {
    if (currentWord && isSoundEnabled) {
      speakWord(currentWord);
    }
  }, [currentWord, isSoundEnabled]);
  
  return {
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
  };
}