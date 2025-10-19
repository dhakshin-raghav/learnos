import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, generateFlashcards, generateEmbedding, cosineSimilarity } from "./gemini";
import type { ChatMessage } from "@shared/schema";

// For demo purposes, storing user ID in app context
// In production, this would come from authenticated sessions
let DEMO_USER_ID: string;

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure demo user exists and capture the ID
  try {
    let user = await storage.getUserByUsername("demo");
    if (!user) {
      user = await storage.createUser({
        username: "demo",
        password: "demo-password-not-for-production", // In production, use proper hashing
      });
    }
    DEMO_USER_ID = user.id;
    console.log("Demo user initialized with ID:", DEMO_USER_ID);
  } catch (error) {
    console.error("Failed to initialize demo user:", error);
    throw error;
  }

  // Get all messages for chat
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByUserId(DEMO_USER_ID);
      const chatMessages: ChatMessage[] = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      }));
      res.json(chatMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a chat message and get AI response
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Save user message
      await storage.createMessage({
        userId: DEMO_USER_ID,
        role: "user",
        content: message,
      });

      // Get conversation history for context
      const history = await storage.getMessagesByUserId(DEMO_USER_ID);
      const conversationContext = history.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get semantic context from notes and flashcards
      let semanticContext = "";
      try {
        const queryEmbedding = await generateEmbedding(message);
        const userNotes = await storage.getNotesByUserId(DEMO_USER_ID);
        const userFlashcards = await storage.getFlashcardsByUserId(DEMO_USER_ID);

        // Find most relevant notes
        const relevantNotes = userNotes
          .filter((note) => note.embedding && note.embedding.length > 0)
          .map((note) => ({
            ...note,
            similarity: cosineSimilarity(queryEmbedding, note.embedding as number[]),
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3);

        if (relevantNotes.length > 0 && relevantNotes[0].similarity > 0.3) {
          semanticContext = "Relevant notes:\n" + relevantNotes
            .map((n) => `- ${n.title}: ${n.content.substring(0, 200)}`)
            .join("\n");
        }
      } catch (error) {
        console.error("Error getting semantic context:", error);
        // Continue without semantic context
      }

      // Generate AI response
      const aiResponse = await generateChatResponse(conversationContext, semanticContext);

      // Save AI response
      await storage.createMessage({
        userId: DEMO_USER_ID,
        role: "assistant",
        content: aiResponse,
      });

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get all flashcards
  app.get("/api/flashcards", async (req, res) => {
    try {
      const flashcards = await storage.getFlashcardsByUserId(DEMO_USER_ID);
      res.json(flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  });

  // Create a new flashcard
  app.post("/api/flashcards", async (req, res) => {
    try {
      const { front, back, tags = [] } = req.body;

      if (!front || !back) {
        return res.status(400).json({ error: "Front and back are required" });
      }

      const flashcard = await storage.createFlashcard({
        userId: DEMO_USER_ID,
        front,
        back,
        tags: Array.isArray(tags) ? tags : [],
      });

      res.json(flashcard);
    } catch (error) {
      console.error("Error creating flashcard:", error);
      res.status(500).json({ error: "Failed to create flashcard" });
    }
  });

  // Review a flashcard (SM-2 algorithm)
  app.post("/api/flashcards/review", async (req, res) => {
    try {
      const { flashcardId, quality } = req.body;

      if (!flashcardId || quality === undefined) {
        return res.status(400).json({ error: "Flashcard ID and quality are required" });
      }

      const flashcard = await storage.getFlashcard(flashcardId);
      if (!flashcard) {
        return res.status(404).json({ error: "Flashcard not found" });
      }

      // SM-2 Algorithm implementation
      let { easeFactor, interval, repetitions } = flashcard;
      const q = Number(quality); // Quality: 0-5

      if (q >= 3) {
        // Correct response
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
      } else {
        // Incorrect response - restart
        repetitions = 0;
        interval = 1;
      }

      // Update ease factor
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

      // Calculate next review date
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      // Update flashcard
      const updated = await storage.updateFlashcard(flashcardId, {
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastReviewed: new Date(),
      });

      // Record review
      await storage.createReview({
        flashcardId,
        userId: DEMO_USER_ID,
        quality: q,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error reviewing flashcard:", error);
      res.status(500).json({ error: "Failed to review flashcard" });
    }
  });

  // Get all notes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotesByUserId(DEMO_USER_ID);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  // Create a new note
  app.post("/api/notes", async (req, res) => {
    try {
      const { title, content, tags = [] } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      const note = await storage.createNote({
        userId: DEMO_USER_ID,
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
      });

      // Generate and store embedding asynchronously
      try {
        const embedding = await generateEmbedding(`${title} ${content}`);
        await storage.updateNoteEmbedding(note.id, embedding);
      } catch (error) {
        console.error("Error generating embedding:", error);
        // Continue without embedding
      }

      res.json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(DEMO_USER_ID);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Semantic search across notes and flashcards
  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const queryEmbedding = await generateEmbedding(query);
      const notes = await storage.getNotesByUserId(DEMO_USER_ID);

      // Search notes using vector similarity
      const results = notes
        .filter((note) => note.embedding && note.embedding.length > 0)
        .map((note) => ({
          id: note.id,
          type: "note" as const,
          title: note.title,
          content: note.content,
          similarity: cosineSimilarity(queryEmbedding, note.embedding as number[]),
          tags: note.tags,
        }))
        .filter((result) => result.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10);

      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
