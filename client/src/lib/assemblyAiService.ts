import axios from 'axios';

const ASSEMBLY_AI_API_KEY = 'a35df6d6a0694f779cd69f7a37b6cdd1';

// We'll use Google Translate Text-to-Speech API which works directly in browsers
// This is available without API keys through the Audio constructor and is compatible
// with Chrome's security restrictions

/**
 * Use Google Translate's TTS service which works in all browsers 
 * This is a fallback for Web Speech API
 * 
 * @param text The text to speak
 * @param lang The language code (e.g., 'es' for Spanish)
 * @returns Promise resolving to the audio element ready to play
 */
export async function getTextToSpeechAudio(text: string, lang: string = 'es'): Promise<HTMLAudioElement> {
  console.log(`Using Google TTS for: "${text}" in language: ${lang}`);
  
  // Create a URL for Google's TTS service
  const encodedText = encodeURIComponent(text);
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodedText}`;
  
  // Create an audio element
  const audio = new Audio();
  audio.src = audioUrl;
  audio.crossOrigin = "anonymous"; 
  
  // Pre-load the audio
  return new Promise((resolve, reject) => {
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = (e) => reject(new Error(`Failed to load audio: ${e}`));
    audio.load();
  });
}

/**
 * Play audio from an Audio element
 * 
 * @param audio HTMLAudioElement to play
 * @returns Promise that resolves when audio finishes playing, or rejects if it fails
 */
export function playAudio(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      resolve();
    };
    
    audio.onerror = (error) => {
      reject(error);
    };
    
    audio.play().catch(reject);
  });
}

/**
 * Speak text using the external TTS API
 * 
 * @param text Text to speak
 * @param lang Language code
 * @returns Promise that resolves when speaking finishes or rejects if it fails
 */
export async function speakTextWithExternalApi(text: string, lang: string = 'es'): Promise<void> {
  try {
    const audio = await getTextToSpeechAudio(text, lang);
    await playAudio(audio);
    return;
  } catch (error) {
    console.error('Error speaking with external API:', error);
    throw error;
  }
}