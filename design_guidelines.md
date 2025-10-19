# Design Guidelines: AI Learning Ecosystem

## Design Approach

**Selected Approach:** Design System + Productivity References  
**Justification:** This is a utility-focused learning productivity tool requiring information density, clarity, and consistency for daily use. Drawing inspiration from Linear's clean typography, Notion's content organization, and modern productivity apps.

**Key Design Principles:**
- Clarity over decoration: Information should be instantly scannable
- Purposeful hierarchy: Visual weight guides attention to learning content
- Calm, focused environment: Minimize cognitive load for learning
- Progressive disclosure: Complex features revealed contextually

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 15% 8% (deep charcoal)
- Surface: 222 15% 12% (elevated panels)
- Surface Elevated: 222 15% 16% (cards, modals)
- Border: 222 10% 20% (subtle dividers)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%
- Text Muted: 0 0% 45%

**Brand Colors:**
- Primary: 264 70% 62% (vibrant purple - knowledge/learning)
- Primary Hover: 264 70% 58%
- Success: 142 76% 45% (correct answers, completed reviews)
- Warning: 38 92% 50% (review due)
- Danger: 0 72% 51% (incorrect answers)

**Light Mode:**
- Background: 0 0% 100%
- Surface: 0 0% 98%
- Surface Elevated: 0 0% 100% (with subtle shadow)
- Border: 220 13% 91%
- Text Primary: 222 47% 11%
- Text Secondary: 222 20% 35%
- Text Muted: 222 10% 55%

### B. Typography

**Font Stack:**
- Primary: 'Inter' (system UI, body text, chat)
- Monospace: 'JetBrains Mono' (code blocks, technical content)

**Scale:**
- Hero: text-5xl font-bold (dashboard greeting)
- H1: text-4xl font-semibold
- H2: text-2xl font-semibold
- H3: text-xl font-semibold
- Body: text-base font-normal
- Small: text-sm
- Caption: text-xs text-muted

### C. Layout System

**Spacing Primitives:** 2, 4, 6, 8, 12, 16, 24 (tight, controlled spacing)

**Grid Structure:**
- Main layout: Sidebar (280px) + Content area (flex-1)
- Dashboard: 12-column grid on desktop, single column on mobile
- Card spacing: gap-6 on desktop, gap-4 on mobile
- Section padding: p-8 on desktop, p-4 on mobile

### D. Component Library

**1. Chat Interface (Core Component):**
- Full-height panel with sticky input at bottom
- Message bubbles: User (right-aligned, primary bg), AI (left-aligned, surface bg)
- Streaming indicator: Subtle pulsing dot
- Input: Floating panel with shadow-lg, rounded-2xl
- Action triggers: Inline buttons within AI responses ("/flashcard", "/note", "/summarize")
- Suggested prompts: Pills below input when empty

**2. Flashcard Viewer:**
- Card-flip animation (perspective transform)
- Front: Large text, centered, min-height 200px
- Back: Answer with confidence buttons (Again, Hard, Good, Easy)
- Progress bar showing review queue position
- Keyboard shortcuts displayed subtly (Space, 1-4)

**3. Notes List:**
- Masonry grid layout (2-3 columns on desktop)
- Cards with: Title (font-semibold), preview text (2 lines, text-muted), tags (pills), timestamp
- Hover state: Lift effect (shadow-md to shadow-lg)
- Search bar: Prominent, with vector search indicator icon

**4. Dashboard:**
- Stats cards grid: 2x2 on tablet, 4 columns on desktop
- Each card: Icon (size-8), metric (text-3xl font-bold), label (text-sm text-muted)
- Learning streak: Calendar heatmap visualization
- Review queue: Stacked list with due dates and topic tags
- Knowledge graph: Interactive node visualization (D3.js style)

**5. Navigation:**
- Sidebar: Icons + labels, active state (primary bg with rounded)
- Top bar: Search (global), user menu, theme toggle
- Mobile: Bottom tab bar with 4 primary actions

**6. Forms & Inputs:**
- Consistent: rounded-lg, border, focus:ring-2 focus:ring-primary
- Dark backgrounds on inputs in dark mode
- Labels: text-sm font-medium mb-2
- Helper text: text-xs text-muted mt-1

### E. Interactions & Animations

**Minimal Animations (Use Sparingly):**
- Card flip: 300ms ease-in-out for flashcards
- Page transitions: 150ms fade
- Hover lifts: transform translateY(-2px) + shadow increase
- Loading states: Skeleton screens (not spinners)
- Streamed chat: Smooth text appearance

**No Animations:**
- Menu dropdowns (instant)
- Tabs switching
- List filtering/sorting

---

## Page-Specific Guidelines

### Landing Page (Marketing)

**Hero Section:**
- Height: 85vh
- Background: Gradient from 264 70% 62% to 220 70% 55%
- Headline: "Learn Smarter with AI-Powered Memory" (text-6xl font-bold)
- Subheadline: Feature description (text-xl text-white/80)
- CTA: Large primary button + secondary "See Demo" button
- Hero image: Screenshot of chat interface in perspective mockup (right side)

**Features Section:**
- 3-column grid
- Each feature: Icon (size-16, gradient bg), title, description
- Icons: Chat bubble, brain/memory, chart-line, calendar-check

**How It Works:**
- Vertical timeline layout (desktop), stacked (mobile)
- 4 steps with numbered badges
- Screenshots showing: Chat → Flashcard creation → Review → Dashboard

**Testimonials:**
- 2-column grid of cards
- Student photos (circular avatars), quote, name, role
- Star ratings prominent

**CTA Section:**
- Dark surface with primary gradient border
- "Start Learning Today" heading
- Email signup inline with submit button
- Social proof: "Join 10,000+ learners"

### Dashboard (App)

**Layout:**
- Sidebar navigation (left)
- Top bar with search and profile
- Main content: Grid of widgets

**Widgets:**
- Welcome card: Greeting + daily streak (full width)
- Review Queue: List of due flashcards with times (2/3 width)
- Stats Overview: 4 metric cards (grid)
- Recent Activity: Chat messages + notes created (1/3 width)
- Knowledge Graph: Interactive visualization (full width below)

### Chat Page

**Layout:**
- Centered column, max-w-4xl
- Messages: Full conversation history with infinite scroll
- Input panel: Fixed bottom, elevated with shadow

**Message Features:**
- Markdown rendering for AI responses
- Code blocks with syntax highlighting
- Inline action buttons appear on hover
- Timestamp on hover

### Flashcards Page

**List View:**
- Deck cards with: Name, card count, next review time, progress ring
- Grid layout: 3 columns on desktop

**Review Mode:**
- Single card centered, fullscreen-like experience
- Dark overlay behind card
- Exit button (top right)
- Progress indicator (bottom)

### Notes Page

**Layout:**
- Left: List/grid of note cards (2/3 width)
- Right: Selected note preview pane (1/3 width)
- Search bar above list with filters (by tag, date)

---

## Images

**Landing Page Hero:** 
Modern 3D illustration or screenshot of the chat interface in an iPhone/laptop mockup with subtle glow effects. Position: Right 50% of hero section. Style: Clean, premium, showing dark mode UI.

**Features Section:**
Three supporting images showing: 1) Chat conversation, 2) Flashcard review interface, 3) Dashboard analytics. Small, inset within feature cards.

**How It Works:**
Four sequential screenshots demonstrating the workflow. Style: Browser window mockups with slight perspective.

**Dashboard (App):**
No decorative images. Focus on data visualizations and content.