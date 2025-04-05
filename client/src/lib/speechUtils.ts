/**
 * Speaks a word in Spanish using Web Speech API
 */
export function speakWord(word: string): void {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'es-ES'; // Spanish language
  utterance.rate = 0.9;     // Slightly slower rate for learning
  
  window.speechSynthesis.speak(utterance);
}

/**
 * Checks if speech synthesis is supported by the browser
 */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}
