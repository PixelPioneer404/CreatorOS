# Creator OS

**Creator OS** is an AI-powered operating system for content creators, centralizing research, idea generation, scripting, content planning, publishing, analytics, audience intelligence, and brand sponsorships into one unified workspace.

## Version 1: Foundation

Version 1 establishes the rock-solid application foundation:
- **Authentication**: Email/Password Sign-up, Sign-in, Session persistence, Password recovery via Supabase Auth.
- **Multi-Tenancy & Workspaces**: Workspace creation, owner assignment, membership verification, and strict cross-workspace isolation.
- **Creator Onboarding**: Progressive profiling flow collecting niche, platforms, goals, audience, and creator preferences. Resumable at any stage.
- **Creator Profile Management**: Edit creator identity, bio, niches, and audience with real-time feedback and persistence.
- **Dashboard Shell**: Minimalist, dark-first dashboard showcasing real profile data with upcoming module placeholders.
- **Design System**: Reusable, accessible UI components built with Tailwind CSS v4 and Radix UI primitives.
- **AI Adapter Foundation**: Provider-independent AI abstraction ready for future models (Gemini, Anthropic, OpenAI).
- **Security & Quality**: Comprehensive backend integration tests (Vitest + Supertest) and frontend component tests.

## Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Supabase account (free tier)

### 2. Environment Setup

Create `.env` files in both `server/` and `client/`:

```bash
# In server/
cp server/.env.example server/.env

# In client/
cp client/.env.example client/.env
```

Fill in your Supabase project credentials in both `.env` files.

### 3. Database Migration

Run the Drizzle database migration:

```bash
npm --workspace=server run db:migrate
```

### 4. Running the Development Servers

```bash
# In one terminal, start the backend:
npm run server:dev

# In another terminal, start the frontend:
npm run client:dev
```

Open `http://localhost:5173` in your browser.

### 5. Running Tests

```bash
# Run all automated tests:
npm run test
```
