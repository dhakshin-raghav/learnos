# LearnAI - AI-Powered Learning Ecosystem

## Overview
LearnAI is a comprehensive AI-driven learning platform that helps users learn more effectively through intelligent chat interactions, automatic flashcard generation, note-taking with semantic search, and spaced repetition reviews.

## Purpose
Create an intelligent learning ecosystem where users can:
- Chat with an AI tutor (powered by Gemini) for learning any topic
- Automatically generate flashcards from chat conversations
- Create and organize notes with AI-powered semantic search
- Review flashcards using scientifically-proven spaced repetition
- Track learning progress with comprehensive analytics

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with pgvector for semantic search
- **AI**: Google Gemini (gemini-2.5-flash, gemini-2.5-pro)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **ORM**: Drizzle ORM

## Architecture

### Data Models
- **Users**: User accounts and authentication
- **Messages**: Chat conversation history
- **Notes**: User notes with embeddings for semantic search
- **Flashcards**: Learning cards with spaced repetition metadata
- **Reviews**: Flashcard review history and performance tracking

### Key Features
1. **Chat Interface**: Real-time AI conversations with Gemini
2. **Flashcard System**: SM-2 spaced repetition algorithm
3. **Note Management**: Semantic search using vector embeddings
4. **Dashboard**: Learning analytics and progress tracking
5. **Theme Support**: Dark/Light mode with system preference

## API Endpoints
- `GET /api/messages` - Fetch chat history
- `POST /api/chat` - Send message and get AI response
- `GET /api/flashcards` - List all flashcards
- `POST /api/flashcards` - Create new flashcard
- `POST /api/flashcards/review` - Record flashcard review
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create new note
- `GET /api/dashboard/stats` - Get dashboard statistics
- `POST /api/search` - Semantic search across notes and flashcards

## Spaced Repetition Algorithm
Uses the SM-2 algorithm with quality ratings:
- 0 (Again): Complete blackout, <1 minute
- 3 (Hard): Correct with difficulty, <6 minutes
- 4 (Good): Correct with hesitation, <10 minutes
- 5 (Easy): Perfect recall, 4+ days

## User Preferences
- Default theme: Dark mode
- Design system follows design_guidelines.md
- Clean, modern, productivity-focused interface
- Emphasis on clarity and information density

## Recent Changes
- Initial project setup with complete schema
- All frontend components built with exceptional polish
- Sidebar navigation with theme toggle
- Dashboard with stats cards
- Chat interface with streaming support (to be implemented)
- Flashcard review system with flip animations
- Notes management with search
- Create dialogs for manual content creation

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Dashboard, Chat, etc.)
│   │   └── lib/            # Utilities and helpers
├── server/
│   ├── routes.ts           # API route handlers
│   ├── storage.ts          # Data access layer
│   └── db.ts               # Database connection
└── shared/
    └── schema.ts           # Shared TypeScript types and schemas
```

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `SESSION_SECRET`: Session encryption key

## Development Notes
- Using pgvector extension for vector similarity search
- Embeddings generated via Gemini embedding model
- All components follow accessibility best practices
- Responsive design for mobile and desktop
- Loading and error states throughout

## Next Steps (Future Phases)
- n8n automation workflows for external syncing
- Knowledge graph visualization
- Batch content upload and processing
- Mobile-optimized flashcard review interface
- Multi-user support with authentication
