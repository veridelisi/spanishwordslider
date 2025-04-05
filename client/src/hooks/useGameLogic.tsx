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
    if (!isGameActive) return;
    
    const newWord = getRandomWord();
    console.log("New word selected:", newWord);
    setCurrentWord(newWord);
    setUsedWords(prev => [...prev, newWord]);
    setUserInput('');
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Apply animation to the word - with a slight delay to ensure DOM update
    setTimeout(() => {
      if (slidingWordRef.current) {
        console.log("Setting animation for word:", newWord);
        slidingWordRef.current.style.animation = 'none';
        void slidingWordRef.current.offsetWidth; // Trigger reflow
        slidingWordRef.current.style.animation = `slideLeft ${gameSpeeds[gameSpeed]}ms linear forwards`;
      }
      
      // Speak the word if sound is enabled
      if (isSoundEnabled) {
        speakWord(newWord);
      }
      
      createAnimation();
    }, 50);
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
    setTimeout(() => {
      startNewWord();
      console.log("Starting new word:", currentWord);
    }, 100);
  }, [startNewWord, currentWord]);
  
  // Handle completing a word
  const completeWord = useCallback(() => {
    // Cancel the animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Update score and level
    setScore(prev => prev + (currentWord.length * 10));
    
    // Increase level every 5 words
    if (score > 0 && score % 100 === 0) {
      setLevel(prev => prev + 1);
    }
    
    // Clear the input and current word (triggers the explosion effect)
    setUserInput('');
    setCurrentWord('');
    
    // Start a new word after a short delay
    setTimeout(() => {
      startNewWord();
    }, 800);
  }, [currentWord, score, startNewWord]);
  
  // Check if the word is completed
  useEffect(() => {
    if (currentWord && userInput.toLowerCase() === currentWord.toLowerCase()) {
      completeWord();
    }
  }, [userInput, currentWord, completeWord]);
  
  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  }, []);
  
  // Handle key down events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Check if the current word is completed
      if (userInput.toLowerCase() === currentWord.toLowerCase()) {
        completeWord();
      }
    }
  }, [userInput, currentWord, completeWord]);
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);
  
  // Pronounce the current word
  const pronunciateWord = useCallback(() => {
    if (currentWord && isSpeechSupported()) {
      speakWord(currentWord);
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