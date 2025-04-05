import { useState, useEffect, useRef, useCallback } from 'react';
import { speakWord, isSpeechSupported } from '@/lib/speechUtils';

// Sample Spanish words for testing
const words = [
  "hola", "adiós", "gracias", "por favor", "buenos días",
  "buenas tardes", "buenas noches", "mañana", "tarde", "noche",
  "agua", "comida", "libro", "teléfono", "computadora",
  "casa", "familia", "amigo", "tiempo", "trabajo",
  "escuela", "universidad", "profesor", "estudiante", "niño",
  "perro", "gato", "animal", "ciudad", "país",
  "año", "mes", "semana", "día", "hora",
  "minuto", "segundo", "rojo", "azul", "verde",
  "negro", "blanco", "amarillo", "naranja", "morado",
  "grande", "pequeño", "alto", "bajo", "feliz"
];

export type GameSpeedSetting = 'slow' | 'medium' | 'fast';

// Game speeds in milliseconds for animation duration
const gameSpeeds = {
  slow: 15000,     // 15 seconds to cross the screen
  medium: 10000,   // 10 seconds to cross the screen
  fast: 7000       // 7 seconds to cross the screen
};

// Add simple debugging
function logDebug(message: string, ...args: any[]) {
  console.log(message, ...args);
}

export default function useGameLogic() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [gameSpeed, setGameSpeed] = useState<GameSpeedSetting>('medium');
  
  const slidingWordRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Get a random word that hasn't been used yet
  const getRandomWord = useCallback(() => {
    const availableWords = words.filter(word => !usedWords.includes(word));
    if (availableWords.length === 0) {
      // Reset used words if all words have been used
      setUsedWords([]);
      return words[Math.floor(Math.random() * words.length)];
    }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }, [usedWords]);
  
  // Start a new word
  const startNewWord = useCallback(() => {
    logDebug("startNewWord called, isGameActive:", isGameActive);
    if (!isGameActive) {
      logDebug("Game not active, not starting word");
      return;
    }
    
    const newWord = getRandomWord();
    logDebug("New word selected:", newWord);
    
    // First set the word in state
    setCurrentWord(newWord);
    setUsedWords(prev => [...prev, newWord]);
    setUserInput('');
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Apply animation to the word - with a longer delay to ensure DOM update is complete
    setTimeout(() => {
      logDebug("Setting up animation for word:", newWord);
      if (slidingWordRef.current) {
        // Reset animation before setting new one
        slidingWordRef.current.style.animation = 'none';
        // Force a reflow to ensure animation reset is applied
        void slidingWordRef.current.offsetWidth;
        
        // Apply the animation with the selected speed
        const duration = gameSpeeds[gameSpeed];
        logDebug("Animation duration:", duration);
        slidingWordRef.current.style.animation = `slideLeft ${duration}ms linear forwards`;
        
        // Speak the word if sound is enabled
        if (isSoundEnabled && newWord) {
          logDebug("Speaking word:", newWord);
          speakWord(newWord);
        }
        
        // Start tracking the animation for game over condition
        createAnimation();
      } else {
        logDebug("slidingWordRef is null, cannot apply animation");
      }
    }, 150); // Longer delay to ensure DOM updates completely
  }, [isGameActive, getRandomWord, isSoundEnabled, gameSpeed]);
  
  // Create the sliding animation and handle game over
  function createAnimation() {
    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const startTime = Date.now();
    const duration = gameSpeeds[gameSpeed];
    
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime >= duration) {
        // Word reached the end, game over
        setIsGameOver(true);
        setIsGameActive(false);
        return;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }
  
  // Start a new game
  const startNewGame = useCallback(() => {
    logDebug("Starting a new game");
    setScore(0);
    setLevel(1);
    setCurrentWord('');
    setUserInput('');
    setIsGameOver(false);
    setIsGameActive(true);
    setUsedWords([]);
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Start the first word after a short delay to ensure DOM is ready
    // We need to use a standard function for the setTimeout to maintain the correct isGameActive value
    setTimeout(function() {
      const newWord = getRandomWord();
      logDebug("Starting with word:", newWord);
      
      // Set the current word state
      setCurrentWord(newWord);
      setUsedWords(prev => [...prev, newWord]);
      
      // Apply animation in a nested timeout to ensure state updates
      setTimeout(() => {
        if (slidingWordRef.current) {
          slidingWordRef.current.style.animation = 'none';
          void slidingWordRef.current.offsetWidth; // Trigger reflow
          slidingWordRef.current.style.animation = `slideLeft ${gameSpeeds[gameSpeed]}ms linear forwards`;
          
          // Always attempt to speak the word initially for better user experience
          // Add a short delay to ensure animation has started before speaking
          setTimeout(() => {
            try {
              // Cancel any previous speech
              if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              
              speakWord(newWord);
              logDebug("Speaking new word:", newWord);
            } catch (err) {
              console.error("Error speaking word:", err);
            }
          }, 300); // Small delay to ensure animation has started
          
          // Start animation tracking
          createAnimation();
        }
      }, 100);
    }, 300);
  }, [getRandomWord, gameSpeed, isSoundEnabled]);
  
  // Handle completing a word
  const completeWord = useCallback(() => {
    logDebug("Word completed correctly:", currentWord);
    
    // Cancel the animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Update score and level
    const wordPoints = currentWord.length * 10;
    logDebug("Adding points:", wordPoints);
    setScore(prev => prev + wordPoints);
    
    // Increase level every 5 words
    if (score > 0 && score % 100 === 0) {
      logDebug("Leveling up!");
      setLevel(prev => prev + 1);
    }
    
    // Clear the input first to trigger explosion effect in GameViewport component
    setUserInput('');
    
    // Short delay before clearing current word to ensure explosion triggers
    setTimeout(() => {
      logDebug("Clearing current word for explosion effect");
      setCurrentWord('');
      
      // Start a new word after a delay to allow for explosion animation
      setTimeout(() => {
        logDebug("Starting next word after explosion");
        // Use our direct word generation approach instead of startNewWord to avoid isGameActive issues
        const newWord = getRandomWord();
        logDebug("New word selected:", newWord);
        setCurrentWord(newWord);
        setUsedWords(prev => [...prev, newWord]);
        
        // Apply animation after a short delay to ensure DOM updates
        setTimeout(() => {
          if (slidingWordRef.current) {
            slidingWordRef.current.style.animation = 'none';
            void slidingWordRef.current.offsetWidth; // Trigger reflow
            slidingWordRef.current.style.animation = `slideLeft ${gameSpeeds[gameSpeed]}ms linear forwards`;
            
            // Always attempt to speak the word initially for better user experience
            // Add a short delay to ensure animation has started before speaking
            setTimeout(() => {
              try {
                // Cancel any previous speech
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                
                speakWord(newWord);
                logDebug("Speaking next word after completion:", newWord);
              } catch (err) {
                console.error("Error speaking word:", err);
              }
            }, 300); // Small delay to ensure animation has started
            
            createAnimation();
          }
        }, 100);
      }, 800); // Delay to allow explosion animation to complete
    }, 50);
  }, [currentWord, score, getRandomWord, gameSpeed, isSoundEnabled]);
  
  // Normalize function for Spanish characters
  const normalizeSpanishText = useCallback((text: string) => {
    // First normalize using NFD (decomposition)
    const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Special case for ñ/Ñ which should normalize to n/N
    return normalized.toLowerCase().replace(/[ñÑ]/g, 'n');
  }, []);
  
  // Check if the word is completed (with Spanish character normalization)
  useEffect(() => {
    if (!currentWord || !userInput) return;
    
    const normalizedInput = normalizeSpanishText(userInput);
    const normalizedWord = normalizeSpanishText(currentWord);
    
    // Check exact match or normalized match
    if (userInput.toLowerCase() === currentWord.toLowerCase() || 
        normalizedInput === normalizedWord) {
      logDebug("Word completed (normalized):", userInput, "=", currentWord);
      completeWord();
    }
  }, [userInput, currentWord, completeWord, normalizeSpanishText]);
  
  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  }, []);
  
  // Handle key down events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Check if the current word is completed using same normalization logic
      if (!currentWord || !userInput) return;
      
      const normalizedInput = normalizeSpanishText(userInput);
      const normalizedWord = normalizeSpanishText(currentWord);
      
      if (userInput.toLowerCase() === currentWord.toLowerCase() || 
          normalizedInput === normalizedWord) {
        completeWord();
      }
    }
  }, [userInput, currentWord, completeWord, normalizeSpanishText]);
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);
  
  // Pronounce the current word on demand
  const pronunciateWord = useCallback(() => {
    if (currentWord && isSpeechSupported()) {
      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Small delay to ensure UI updates before speaking
      setTimeout(() => {
        logDebug("User clicked to pronounce:", currentWord);
        speakWord(currentWord);
      }, 100);
    }
  }, [currentWord]);
  
  // Change game speed
  const changeGameSpeed = useCallback((speed: GameSpeedSetting) => {
    setGameSpeed(speed);
    
    // Update animation duration if a word is already active
    if (slidingWordRef.current && currentWord) {
      slidingWordRef.current.style.animationDuration = `${gameSpeeds[speed]}ms`;
      
      // Reset the animation
      slidingWordRef.current.style.animation = 'none';
      void slidingWordRef.current.offsetWidth; // Trigger reflow
      slidingWordRef.current.style.animation = `slideLeft ${gameSpeeds[speed]}ms linear forwards`;
      
      // Re-create the animation timer
      createAnimation();
    }
  }, [currentWord]);
  
  // Stop all animations when the component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return {
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
  };
}