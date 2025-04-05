import axios from 'axios';

const ASSEMBLY_AI_API_KEY = 'a35df6d6a0694f779cd69f7a37b6cdd1';

// Since AssemblyAI doesn't directly offer TTS in their JavaScript client,
// we'll use another compatible free TTS API (Libretranslate) that can work in the browser
// This is a fallback solution when Web Speech API doesn't work

const LIBRE_TRANSLATE_API = 'https://libretranslate.com/api/tts';

/**
 * Use LibreTranslate's TTS API to speak text
 * This is a fallback for Web Speech API
 * 
 * @param text The text to speak
 * @param lang The language code (e.g., 'es' for Spanish)
 * @returns Promise resolving to the audio URL, or null if it failed
 */
export async function getTextToSpeechAudio(text: string, lang: string = 'es'): Promise<string | null> {
  try {
    // Create a URL with the necessary parameters
    const params = new URLSearchParams({
      q: text,
      lang: lang
    });

    // For monitoring only - not using AssemblyAI API key in request
    console.log(`Using external TTS for: "${text}" in language: ${lang}`);

    // Request text-to-speech from LibreTranslate
    const response = await axios.get(`${LIBRE_TRANSLATE_API}?${params.toString()}`, {
      responseType: 'blob',  // Get response as a blob
      headers: {
        'Accept': 'audio/mp3',
      }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get TTS: ${response.status}`);
    }

    // Create an object URL from the audio blob
    const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error) {
    console.error('Error getting TTS audio:', error);
    return null;
  }
}

/**
 * Play audio from a URL
 * 
 * @param audioUrl URL of the audio to play
 * @returns Promise that resolves when audio finishes playing, or rejects if it fails
 */
export function playAudio(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      // Clean up object URL to avoid memory leaks
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    
    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
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
    const audioUrl = await getTextToSpeechAudio(text, lang);
    if (audioUrl) {
      await playAudio(audioUrl);
      return;
    }
    throw new Error('Failed to get audio URL');
  } catch (error) {
    console.error('Error speaking with external API:', error);
    throw error;
  }
}