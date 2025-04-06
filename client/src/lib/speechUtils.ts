import { speakTextWithExternalApi } from './assemblyAiService';

// Initialize speech synthesis
let voices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
let voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let useExternalApiFlag = false; // Flag to use external API

/**
 * Load and cache available voices, handling the asynchronous nature of voice loading
 */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  // If we already have a promise, return it
  if (voicesLoadedPromise) return voicesLoadedPromise;
  
  voicesLoadedPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.log("Speech synthesis not supported in this environment");
      useExternalApiFlag = true; // Use external API as fallback
      resolve([]);
      return;
    }
    
    // Try to get voices immediately (works in some browsers)
    const availableVoices = window.speechSynthesis.getVoices();
    
    if (availableVoices && availableVoices.length > 0) {
      console.log("Voices available immediately:", availableVoices.length);
      voices = availableVoices;
      voicesLoaded = true;
      resolve(availableVoices);
      return;
    }
    
    // Otherwise wait for the voices to be loaded
    console.log("Waiting for voices to load...");
    window.speechSynthesis.onvoiceschanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      console.log("Speech voices loaded:", loadedVoices.length);
      voices = loadedVoices;
      voicesLoaded = true;
      resolve(loadedVoices);
    };
    
    // Set a timeout to switch to external API if voices don't load in 3 seconds
    setTimeout(() => {
      if (!voicesLoaded) {
        console.log("Voice loading timed out, will try external API");
        useExternalApiFlag = true;
        resolve([]);
      }
    }, 3000);
  });
  
  return voicesLoadedPromise;
}

// Initialize voice loading with user interaction (Solution 1)
if (typeof window !== 'undefined') {
  // Force voices to load after user interaction (more reliable approach)
  document.addEventListener('click', function() {
    console.log("User interaction detected, forcing voices to load");
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices(); // Force voices to load after user interaction
    }
  }, { once: true });
  
  // Also start loading immediately as a backup approach
  if ('speechSynthesis' in window) {
    loadVoices();
  } else {
    useExternalApiFlag = true;
  }
} else {
  useExternalApiFlag = true;
}

/**
 * Set whether to use the external API for speech
 */
export function setUseExternalApi(value: boolean): void {
  useExternalApiFlag = value;
}

/**
 * Get current flag for using external API
 */
export function getUseExternalApi(): boolean {
  return useExternalApiFlag;
}

/**
 * Speaks a word in Spanish using Web Speech API with external API fallback
 * Enhanced with Solution 1 for better voice loading reliability
 */
export async function speakWord(word: string): Promise<void> {
  // Cancel any ongoing speech first
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  // Try Web Speech API first if not flagged for external
  if (!useExternalApiFlag) {
    try {
      if (!isSpeechSupported()) {
        throw new Error("Speech synthesis not supported");
      }
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
        await new Promise<void>((resolve, reject) => {
          utterance.onend = () => resolve();
          utterance.onerror = () => {
            useExternalApiFlag = true;
            reject(new Error("Speech synthesis failed"));
          };
          window.speechSynthesis.speak(utterance);
        });
        return;
      }
    } catch (error) {
      console.log("Web Speech API failed, switching to external API");
      useExternalApiFlag = true;
    }
  }

  // Use external API as fallback
  try {
    console.log("Using external TTS API for:", word);
    await speakTextWithExternalApi(word, 'es');
  } catch (error) {
    console.error("All speech methods failed:", error);
    // Reset the flag to try Web Speech API again next time
    useExternalApiFlag = false;
  }

  // Try Web Speech API
  if (!isSpeechSupported()) {
    console.log("Speech synthesis not supported");
    return;
  }
  
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Get current voices
    let availableVoices = window.speechSynthesis.getVoices();
    
    // If no voices available, try to force load them
    if (availableVoices.length === 0) {
      console.log("No voices available, setting up onvoiceschanged listener");
      
      // Wait for voices to become available
      availableVoices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const voiceChangedHandler = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            window.speechSynthesis.onvoiceschanged = null; // Remove listener
            resolve(voices);
          }
        };
        
        // Set up the listener
        window.speechSynthesis.onvoiceschanged = voiceChangedHandler;
        
        // Try to trigger voice loading
        window.speechSynthesis.getVoices();
        
        // Fallback if voices never load
        setTimeout(() => {
          const voices = window.speechSynthesis.getVoices();
          resolve(voices || []);
        }, 1000);
      });
      
      // If we still have no voices, use external API
      if (availableVoices.length === 0) {
        console.log("Could not load voices, using external API");
        useExternalApiFlag = true;
        await speakTextWithExternalApi(word, 'es');
        return;
      }
    }
    
    // Create the utterance
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'es-ES';  // Spanish (Spain)
    utterance.rate = 0.8;      // Slightly slower than normal
    utterance.pitch = 1.0;     // Normal pitch
    
    // Find a Spanish voice if available
    const spanishVoice = availableVoices.find(voice => voice.lang.startsWith('es'));
    console.log("Using Spanish voice:", spanishVoice ? spanishVoice.name : "None available, using default");
    
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    // Wrap in a promise to catch errors
    await new Promise<void>((resolve, reject) => {
      // Add event listeners to track speech status
      utterance.onstart = () => console.log("Speaking:", word);
      utterance.onend = () => {
        console.log("Finished speaking:", word);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
        reject(new Error(`Speech error: ${event.error}`));
      };
      
      // Speak the word
      window.speechSynthesis.speak(utterance);
      
      // Safety timeout in case onend never fires
      setTimeout(() => resolve(), 5000);
    });
  } catch (error) {
    console.error("Error in speech synthesis:", error);
    
    // Attempt to use external API as fallback if Web Speech API fails
    if (!useExternalApiFlag) {
      try {
        console.log("Web Speech API failed, trying external API");
        await speakTextWithExternalApi(word, 'es');
      } catch (fallbackError) {
        console.error("External API fallback also failed:", fallbackError);
      }
    }
  }
}

/**
 * Checks if speech synthesis is supported by the browser
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Detect browser type for custom speech handling
 * Based on Solution 4 approach
 */
export function detectBrowser(): { 
  type: 'native' | 'chrome' | 'fallback',
  isMobile: boolean,
  isChrome: boolean,
  isSafari: boolean 
} {
  if (typeof window === 'undefined') {
    return { type: 'fallback', isMobile: false, isChrome: false, isSafari: false };
  }
  
  // Detect browser
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = /chrome/i.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  let type: 'native' | 'chrome' | 'fallback' = 'fallback';
  
  if (isMobile) {
    // Mobile usually works well with native speech synthesis
    type = 'native';
  } else if (isChrome) {
    // Chrome needs special handling
    type = 'chrome';
  } else {
    // For other browsers, use fallback
    type = 'fallback';
  }
  
  return { type, isMobile, isChrome, isSafari };
}

/**
 * Preload speech synthesis with browser-specific optimizations
 * Call this early in your application to ensure the speech system is ready
 */
export function preloadSpeechSynthesis(): void {
  if (!isSpeechSupported()) {
    console.log("Speech synthesis not supported, will use external API");
    useExternalApiFlag = true;
    return;
  }
  
  const browserInfo = detectBrowser();
  console.log("Browser detection:", browserInfo);
  
  if (browserInfo.type === 'chrome') {
    // Chrome-specific handling
    console.log("Chrome detected, using special voice loading strategy");
    window.speechSynthesis.onvoiceschanged = function() {
      // Store voices when they become available
      voices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      console.log("Chrome voices loaded:", voices.length);
    };
    // Trigger voice loading
    window.speechSynthesis.getVoices();
  } else if (browserInfo.type === 'fallback') {
    // For browsers that may have issues, pre-set to use external API
    console.log("Using fallback strategy for this browser");
    useExternalApiFlag = true;
  } else {
    // For mobile and other browsers that work well
    loadVoices().then(voices => {
      console.log("Speech synthesis preloaded with", voices.length, "voices");
    });
  }
}

/**
 * Force the use of external API for all speech
 */
export function forceExternalApi(): void {
  useExternalApiFlag = true;
  console.log("Forced use of external API for speech");
}