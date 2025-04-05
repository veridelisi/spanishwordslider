// Initialize voices - they load asynchronously
let voices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

// Load voices when available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Some browsers support voices right away
  voices = window.speechSynthesis.getVoices();
  
  // Handle async voice loading
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    voicesLoaded = true;
    console.log("Speech voices loaded:", voices.length);
  };
}

/**
 * Speaks a word in Spanish using Web Speech API
 */
export function speakWord(word: string): void {
  if (!isSpeechSupported()) {
    console.log("Speech synthesis not supported");
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'es-ES';  // Spanish (Spain)
  utterance.rate = 0.8;      // Slightly slower than normal
  utterance.pitch = 1.0;     // Normal pitch
  
  // Find a Spanish voice if available
  if (!voicesLoaded) {
    voices = window.speechSynthesis.getVoices();
  }
  
  const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
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
}

/**
 * Checks if speech synthesis is supported by the browser
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}