import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Spanish words with translations
const spanishWords = [
  { word: "hola", translation: "hello", difficulty: 1 },
  { word: "gracias", translation: "thank you", difficulty: 1 },
  { word: "buenos", translation: "good", difficulty: 1 },
  { word: "amigo", translation: "friend", difficulty: 1 },
  { word: "casa", translation: "house", difficulty: 1 },
  { word: "agua", translation: "water", difficulty: 1 },
  { word: "comida", translation: "food", difficulty: 1 },
  { word: "tiempo", translation: "time", difficulty: 2 },
  { word: "familia", translation: "family", difficulty: 1 },
  { word: "trabajo", translation: "work", difficulty: 2 },
  { word: "amor", translation: "love", difficulty: 1 },
  { word: "libro", translation: "book", difficulty: 1 },
  { word: "escuela", translation: "school", difficulty: 2 },
  { word: "perro", translation: "dog", difficulty: 1 },
  { word: "gato", translation: "cat", difficulty: 1 },
  { word: "ciudad", translation: "city", difficulty: 2 },
  { word: "fiesta", translation: "party", difficulty: 2 },
  { word: "bonito", translation: "beautiful", difficulty: 2 },
  { word: "feliz", translation: "happy", difficulty: 1 },
  { word: "vida", translation: "life", difficulty: 1 },
  { word: "bueno", translation: "good", difficulty: 1 },
  { word: "noche", translation: "night", difficulty: 1 },
  { word: "día", translation: "day", difficulty: 1 },
  { word: "sol", translation: "sun", difficulty: 1 },
  { word: "luna", translation: "moon", difficulty: 1 },
  { word: "azul", translation: "blue", difficulty: 1 },
  { word: "verde", translation: "green", difficulty: 1 },
  { word: "rojo", translation: "red", difficulty: 1 },
  { word: "negro", translation: "black", difficulty: 1 },
  { word: "blanco", translation: "white", difficulty: 1 }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize words in the memory storage
  for (const wordData of spanishWords) {
    await storage.addWord(wordData);
  }

  // API endpoint to get all available words
  app.get("/api/words", async (_req, res) => {
    try {
      const words = await storage.getAllWords();
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve words" });
    }
  });

  // API endpoint to get words by difficulty
  app.get("/api/words/difficulty/:level", async (req, res) => {
    try {
      const difficulty = parseInt(req.params.level);
      if (isNaN(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }
      
      const words = await storage.getWordsByDifficulty(difficulty);
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve words by difficulty" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
