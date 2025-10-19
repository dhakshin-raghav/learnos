import {
  users,
  messages,
  notes,
  flashcards,
  reviews,
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Note,
  type InsertNote,
  type Flashcard,
  type InsertFlashcard,
  type Review,
  type InsertReview,
  type DashboardStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, desc, sql } from "drizzle-orm";

// Blueprint reference: javascript_database

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Messages
  getMessagesByUserId(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Notes
  getNotesByUserId(userId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNoteEmbedding(noteId: string, embedding: number[]): Promise<void>;

  // Flashcards
  getFlashcardsByUserId(userId: string): Promise<Flashcard[]>;
  getFlashcard(id: string): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByUserId(userId: string, limit?: number): Promise<Review[]>;

  // Dashboard
  getDashboardStats(userId: string): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Messages
  async getMessagesByUserId(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Notes
  async getNotesByUserId(userId: string): Promise<Note[]> {
    return db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async updateNoteEmbedding(noteId: string, embedding: number[]): Promise<void> {
    await db
      .update(notes)
      .set({ embedding })
      .where(eq(notes.id, noteId));
  }

  // Flashcards
  async getFlashcardsByUserId(userId: string): Promise<Flashcard[]> {
    return db
      .select()
      .from(flashcards)
      .where(eq(flashcards.userId, userId))
      .orderBy(flashcards.nextReview);
  }

  async getFlashcard(id: string): Promise<Flashcard | undefined> {
    const [flashcard] = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.id, id));
    return flashcard || undefined;
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const [flashcard] = await db
      .insert(flashcards)
      .values(insertFlashcard)
      .returning();
    return flashcard;
  }

  async updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard> {
    const [flashcard] = await db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.id, id))
      .returning();
    return flashcard;
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getReviewsByUserId(userId: string, limit = 100): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.reviewedAt))
      .limit(limit);
  }

  // Dashboard
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get total flashcards
    const flashcardCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashcards)
      .where(eq(flashcards.userId, userId));

    // Get flashcards due today
    const now = new Date();
    const dueCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashcards)
      .where(
        and(
          eq(flashcards.userId, userId),
          lte(flashcards.nextReview, now)
        )
      );

    // Get total notes
    const noteCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(notes)
      .where(eq(notes.userId, userId));

    // Calculate review streak (simplified: days with at least one review)
    const recentReviews = await db
      .select({
        date: sql<string>`DATE(${reviews.reviewedAt})`,
      })
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.reviewedAt))
      .limit(30);

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const uniqueDates = [...new Set(recentReviews.map(r => r.date))];

    if (uniqueDates.length > 0 && uniqueDates[0] === today) {
      streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Get weekly reviews (last 7 days)
    const weeklyReviews: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = recentReviews.filter(r => r.date === dateStr).length;
      weeklyReviews.push(count);
    }

    return {
      totalFlashcards: Number(flashcardCount[0]?.count || 0),
      flashcardsDueToday: Number(dueCount[0]?.count || 0),
      totalNotes: Number(noteCount[0]?.count || 0),
      reviewStreak: streak,
      weeklyReviews,
    };
  }
}

export const storage = new DatabaseStorage();
