// Initialize speech synthesis
let voices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
let voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Load and cache available voices, handling the asynchronous nature of voice loading
 */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  // If we already have a promise, return it
  if (voicesLoadedPromise) return voicesLoadedPromise;
  
  voicesLoadedPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.log("Speech synthesis not supported in this environment");
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
  });
  
  return voicesLoadedPromise;
}

// Start loading voices immediately
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
}

/**
 * Speaks a word in Spanish using Web Speech API with retries
 */
export function speakWord(word: string): void {
  if (!isSpeechSupported()) {
    console.log("Speech synthesis not supported");
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Ensure voices are loaded before speaking
  loadVoices().then((availableVoices) => {
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
    
    // Add event listeners to track speech status
    utterance.onstart = () => console.log("Speaking:", word);
    utterance.onend = () => console.log("Finished speaking:", word);
    utterance.onerror = (event) => console.error("Speech error:", event.error);
    
    // Speak the word
    window.speechSynthesis.speak(utterance);
  }).catch(error => {
    console.error("Error loading voices:", error);
  });
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
  }
}