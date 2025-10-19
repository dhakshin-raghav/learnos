import { GoogleGenAI } from "@google/genai";

// Blueprint reference: javascript_gemini
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
// do not change this unless explicitly requested by the user

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY must be set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate a chat response from Gemini
 */
export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  context?: string
): Promise<string> {
  try {
    const systemPrompt = context
      ? `You are an intelligent learning tutor. Help the user learn effectively. Here is relevant context from their notes and flashcards:\n\n${context}\n\nUse this context to provide better, more personalized responses.`
      : "You are an intelligent learning tutor. Help the user learn effectively, explain concepts clearly, and encourage active learning.";

    const formattedMessages = messages.map((msg) => msg.content).join("\n\n");
    const prompt = `${systemPrompt}\n\nConversation:\n${formattedMessages}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini chat error:", error);
    throw new Error("Failed to generate chat response");
  }
}

/**
 * Generate flashcards from text content
 */
export async function generateFlashcards(
  content: string
): Promise<Array<{ front: string; back: string; tags: string[] }>> {
  try {
    const systemPrompt = `You are an expert at creating effective learning flashcards. 
Generate flashcards from the given content. Each flashcard should:
- Have a clear, concise question on the front
- Have a complete, accurate answer on the back
- Include relevant tags for categorization

Respond with JSON in this format:
{
  "flashcards": [
    {
      "front": "question",
      "back": "answer",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["front", "back", "tags"],
              },
            },
          },
          required: ["flashcards"],
        },
      },
      contents: `Generate flashcards from this content:\n\n${content}`,
    });

    const result = JSON.parse(response.text || "{}");
    return result.flashcards || [];
  } catch (error) {
    console.error("Flashcard generation error:", error);
    throw new Error("Failed to generate flashcards");
  }
}

/**
 * Summarize text content
 */
export async function summarizeContent(content: string): Promise<string> {
  try {
    const prompt = `Summarize the following content concisely, maintaining key points and important details:\n\n${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Summary could not be generated.";
  } catch (error) {
    console.error("Summarization error:", error);
    throw new Error("Failed to summarize content");
  }
}

/**
 * Generate text embeddings for semantic search
 * Note: Gemini uses text-embedding-004 model for embeddings
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embed({
      model: "text-embedding-004",
      content: text,
    });

    return response.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
