# CLAUDE.md — UIGen

AI-powered React component generator with live preview.

## Quick Reference

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run setup        # Install deps + Prisma generate + migrate
npm run test         # Run tests (Vitest)
npm run lint         # ESLint
npm run db:reset     # Reset database
```

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19**, **TypeScript**
- **Tailwind CSS v4** (PostCSS, no CSS modules)
- **Prisma** with SQLite (`prisma/dev.db`)
- **Anthropic Claude** via `@ai-sdk/anthropic` + Vercel AI SDK (`ai`)
- **Monaco Editor** for code editing
- **Babel Standalone** for in-browser JSX compilation
- **Radix UI** primitives (shadcn/ui pattern)
- **jose** for JWT auth, **bcrypt** for password hashing
- **Vitest** + React Testing Library for tests

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Home — anonymous or redirect to project
│   ├── [projectId]/page.tsx     # Project view (protected)
│   ├── api/chat/route.ts        # Streaming AI chat endpoint
│   ├── main-content.tsx         # 3-panel layout (chat + preview + editor)
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Tailwind imports
├── actions/
│   ├── index.ts                 # Auth actions (signUp, signIn, signOut, getUser)
│   ├── create-project.ts
│   ├── get-project.ts
│   └── get-projects.ts
├── components/
│   ├── auth/                    # AuthDialog, SignInForm, SignUpForm
│   ├── chat/                    # ChatInterface, MessageList, MessageInput, MarkdownRenderer
│   ├── editor/                  # CodeEditor (Monaco), FileTree
│   ├── preview/                 # PreviewFrame (sandboxed iframe)
│   ├── ui/                      # shadcn/ui primitives (button, dialog, tabs, etc.)
│   └── HeaderActions.tsx        # Project switcher, nav
├── lib/
│   ├── auth.ts                  # JWT session (create, get, delete, verify)
│   ├── prisma.ts                # Singleton Prisma client
│   ├── provider.ts              # AI model setup (Anthropic or MockLanguageModel)
│   ├── file-system.ts           # VirtualFileSystem (in-memory, Map-based)
│   ├── utils.ts                 # cn() helper
│   ├── contexts/
│   │   ├── chat-context.tsx     # Chat state + useChat integration
│   │   └── file-system-context.tsx  # File system state + tool call handling
│   ├── tools/
│   │   ├── str-replace.ts       # AI tool: view, create, str_replace, insert
│   │   └── file-manager.ts      # AI tool: rename, delete
│   ├── transform/
│   │   └── jsx-transformer.ts   # Babel JSX compilation + import maps + blob URLs
│   └── prompts/
│       └── generation.tsx       # System prompt for AI generation
├── hooks/
│   └── use-auth.ts
├── generated/prisma/            # Generated Prisma client
└── middleware.ts                 # JWT verification for /api/projects/*, /api/filesystem/*
prisma/
├── schema.prisma                # User + Project models (SQLite)
├── dev.db                       # SQLite database
└── migrations/
```

## Architecture

### AI Generation Flow

1. User sends message via `ChatInterface`
2. `POST /api/chat` receives `{ messages, files, projectId }`
3. System prompt + serialized virtual file system injected
4. Vercel AI SDK `streamText` with Claude Haiku 4.5 (or mock if no API key)
5. AI calls tools: `str_replace_editor` (create/edit files), `file_manager` (rename/delete)
6. Tool results applied to `VirtualFileSystem` on the client
7. Preview updates via Babel compilation in sandboxed iframe
8. On completion: messages + file system state saved to DB (authenticated users only)

### Virtual File System

All files are in-memory (`VirtualFileSystem` class). No files written to disk. Root is `/`. Entry point is always `/App.jsx`. Supports serialize/deserialize for DB persistence.

### Authentication

- JWT tokens in httpOnly cookies (7-day expiry)
- Anonymous users can use the app but work is not persisted
- Server actions handle signUp/signIn/signOut
- Middleware protects API routes

### State Management

- React Context API: `ChatContext` (chat + AI), `FileSystemContext` (files + tools)
- No external state libraries

## Database

Schema is defined in `prisma/schema.prisma` — reference it anytime you need to understand the data structure.

Two models: `User` (id, email, password) and `Project` (id, name, userId, messages as JSON, data as JSON serialized file system).

## Environment Variables

```
ANTHROPIC_API_KEY=...   # Optional — falls back to mock mode with static responses
JWT_SECRET=...          # Optional — defaults to "development-secret-key"
```

## Conventions

- Components: PascalCase files, grouped by feature
- Utilities: camelCase files
- Server actions: `"use server"` in `src/actions/`
- Styling: Tailwind only, no inline styles or CSS modules
- UI primitives: shadcn/ui pattern with Radix UI
- Tests: colocated in `__tests__/` folders, Vitest + JSDOM
- AI tool params validated with Zod
- Generated components must use Tailwind CSS and `@/` import alias
- Use comments sparingly. Only comment complex code.
