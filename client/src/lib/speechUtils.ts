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

// Start loading voices immediately
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
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
 */
export async function speakWord(word: string): Promise<void> {
  // If external API is preferred, use it directly
  if (useExternalApiFlag) {
    try {
      console.log("Using external TTS API for:", word);
      await speakTextWithExternalApi(word, 'es');
      return;
    } catch (error) {
      console.error("External TTS API failed, trying Web Speech API:", error);
      // Fall through to Web Speech API as last resort
    }
  }

  // Try Web Speech API
  if (!isSpeechSupported()) {
    console.log("Speech synthesis not supported");
    return;
  }
  
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Ensure voices are loaded before speaking
    const availableVoices = await loadVoices();
    
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
 * Preload speech synthesis
 * Call this early in your application to ensure the speech system is ready
 */
export function preloadSpeechSynthesis(): void {
  if (isSpeechSupported()) {
    loadVoices().then(voices => {
      console.log("Speech synthesis preloaded with", voices.length, "voices");
    });
  } else {
    console.log("Speech synthesis not supported, will use external API");
    useExternalApiFlag = true;
  }
}

/**
 * Force the use of external API for all speech
 */
export function forceExternalApi(): void {
  useExternalApiFlag = true;
  console.log("Forced use of external API for speech");
}