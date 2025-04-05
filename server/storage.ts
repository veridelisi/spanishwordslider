import { users, type User, type InsertUser, type Word, type InsertWord } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllWords(): Promise<Word[]>;
  getWordById(id: number): Promise<Word | undefined>;
  getWordsByDifficulty(difficulty: number): Promise<Word[]>;
  addWord(word: InsertWord): Promise<Word>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private words: Map<number, Word>;
  private userCurrentId: number;
  private wordCurrentId: number;

  constructor() {
    this.users = new Map();
    this.words = new Map();
    this.userCurrentId = 1;
    this.wordCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllWords(): Promise<Word[]> {
    return Array.from(this.words.values());
  }
  
  async getWordById(id: number): Promise<Word | undefined> {
    return this.words.get(id);
  }
  
  async getWordsByDifficulty(difficulty: number): Promise<Word[]> {
    return Array.from(this.words.values()).filter(
      (word) => word.difficulty === difficulty
    );
  }
  
  async addWord(insertWord: InsertWord): Promise<Word> {
    const id = this.wordCurrentId++;
    const word: Word = { ...insertWord, id };
    this.words.set(id, word);
    return word;
  }
}

export const storage = new MemStorage();
