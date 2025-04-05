import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { speakWord } from "@/lib/speechUtils";
import { Word } from "@shared/schema";

// Game configuration
const GAME_CONFIG = {
  baseSpeed: 10000, // Base speed for word sliding in ms
  speedIncrement: 500, // How much to decrease time per level
  minSpeed: 4000, // Minimum sliding speed
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
  const { data: words } = useQuery({
    queryKey: ['/api/words'],
    staleTime: Infinity,
  });
  
  useEffect(() => {
    if (words && words.length > 0) {
      wordsRef.current = words;
    }
  }, [words]);
  
  // Get a random word
  const getRandomWord = useCallback(() => {
    if (!wordsRef.current.length) return "";
    const randomIndex = Math.floor(Math.random() * wordsRef.current.length);
    return wordsRef.current[randomIndex].word;
  }, []);
  
  // Create the sliding word animation
  const createWordAnimation = useCallback(() => {
    if (!slidingWordRef.current) return;
    
    // Reset the element
    slidingWordRef.current.style.animation = 'none';
    slidingWordRef.current.offsetHeight; // Trigger reflow
    
    // Start new animation
    slidingWordRef.current.style.animation = `slide-left ${currentSpeed / 1000}s linear forwards`;
    
    // Get the animation object
    const animations = slidingWordRef.current.getAnimations();
    if (animations.length > 0) {
      animationRef.current = animations[0];
      
      // Set up animation end listener
      animationRef.current.onfinish = () => {
        if (isGameActive && !isGameOver) {
          endGame();
        }
      };
    }
    
    // Pronounce the word after a delay
    if (isSoundEnabled && currentWord) {
      setTimeout(() => {
        speakWord(currentWord);
      }, GAME_CONFIG.pronounceDelay);
    }
  }, [currentWord, currentSpeed, isGameActive, isGameOver, isSoundEnabled]);
  
  // Start a new word
  const startNewWord = useCallback(() => {
    const word = getRandomWord();
    setCurrentWord(word);
    
    // Schedule animation on next tick to ensure DOM is updated
    setTimeout(() => {
      createWordAnimation();
    }, 0);
  }, [getRandomWord, createWordAnimation]);
  
  // Handle word completion
  const handleWordCompletion = useCallback(() => {
    // Stop current animation
    if (animationRef.current) {
      animationRef.current.pause();
    }
    
    // Apply blow-away animation
    if (slidingWordRef.current) {
      slidingWordRef.current.style.animation = 'blow-away 0.5s ease-out forwards';
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
    
    // Start new word after animation
    setTimeout(() => {
      if (isGameActive && !isGameOver) {
        startNewWord();
      }
    }, 600);
  }, [currentWord, level, isGameActive, isGameOver, startNewWord]);
  
  // End the game
  const endGame = useCallback(() => {
    setIsGameActive(false);
    setIsGameOver(true);
    
    // Stop any ongoing animations
    if (animationRef.current) {
      animationRef.current.pause();
    }
  }, []);
  
  // Input handling
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();
    setUserInput(input);
    
    // Check if word is complete
    if (input === currentWord.toLowerCase()) {
      handleWordCompletion();
    }
  }, [currentWord, handleWordCompletion]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isGameActive && !isGameOver) {
        startGame();
      }
    }
  }, [isGameActive, isGameOver]);
  
  // Start the game
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
  
  // Restart the game
  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setTimeout(() => {
      startGame();
    }, 300);
  }, [startGame]);
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);
  
  // Pronunciate current word
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
