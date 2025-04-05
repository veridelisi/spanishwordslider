/**
 * Speaks a word in Spanish using Web Speech API
 */
export function speakWord(word: string): void {
  if (!isSpeechSupported()) return;
  
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'es-ES';  // Spanish (Spain)
  utterance.rate = 0.8;      // Slightly slower than normal
  utterance.pitch = 1.0;     // Normal pitch
  
  // Find a Spanish voice if available
  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
  
  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

/**
 * Checks if speech synthesis is supported by the browser
 */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}