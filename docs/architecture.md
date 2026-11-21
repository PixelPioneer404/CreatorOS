# Creator OS Architecture

## 1. Overview
Creator OS is built as a **modular monolith** with a strict separation between frontend and backend services.

- **Frontend**: React (Vite) single-page application using modern ES modules, Tailwind CSS v4 for styling, Lucide icons, and Radix UI accessible headless components.
- **Backend**: Node.js and Express RESTful API server using ES modules, structured error handling, Pino logging, and rate limiting.
- **Database**: PostgreSQL hosted via Supabase, accessed via Drizzle ORM.
- **Authentication**: Managed via Supabase Auth. The client authenticates against Supabase and passes standard Bearer JWT tokens to the backend for verification.
- **Multi-Tenancy**: Tenant isolation boundary enforced by `workspace_id`. Every private query and operation validates that the authenticated user belongs to the target workspace.

## 2. Directory Structure

```
creator-os/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── app/                 # Router and app shell
│   │   ├── components/
│   │   │   ├── ui/              # Reusable design system primitives (Button, Input, Card, etc.)
│   │   │   ├── layout/          # Sidebar, Navbar, PageHeader, Shell
│   │   │   └── shared/          # Shared complex components (EmptyState, ErrorBoundary, etc.)
│   │   ├── features/
│   │   │   ├── auth/            # Sign In, Sign Up, Password Reset
│   │   │   ├── onboarding/      # Creator Onboarding wizard
│   │   │   ├── dashboard/       # Main dashboard shell & summaries
│   │   │   └── settings/        # Creator profile settings & editor
│   │   ├── hooks/               # Custom React hooks (useAuth, useWorkspace, useTheme)
│   │   ├── lib/                 # Utilities (supabase client, api client, cn helper)
│   │   ├── services/            # API client service wrappers
│   │   ├── store/               # Zustand client state (auth, workspace)
│   │   ├── styles/              # Global styling & Tailwind v4 config
│   │   └── main.jsx             # React entry point
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/              # Environment & service config validation (Zod)
│   │   ├── middleware/          # Auth, workspace guard, error handler, logger, rate-limiter
│   │   ├── modules/
│   │   │   ├── auth/            # Auth verification helpers
│   │   │   ├── users/           # User profile endpoints
│   │   │   ├── workspaces/      # Workspace provisioning & membership management
│   │   │   ├── creator/         # Creator profile & onboarding data management
│   │   │   └── ai/              # Provider-agnostic AI adapter foundation
│   │   ├── db/
│   │   │   ├── schema/          # Drizzle ORM schemas (users, workspaces, creator_profiles)
│   │   │   ├── migrations/      # SQL migration files
│   │   │   └── index.js         # Database client connection
│   │   ├── utils/               # ApiResponse, ApiError, AsyncHandler helpers
│   │   ├── app.js               # Express application initialization
│   │   └── server.js            # Express server listener
│   └── package.json
│
├── docs/                        # Architecture, database, api, env docs
├── .gitignore
├── README.md
└── package.json
```

## 3. Security Model

1. **Least-Privilege & Zero-Trust Workspace Access**:
   - The backend never trusts a client-supplied `workspaceId` without cross-checking the `workspace_members` table for the authenticated `user_id`.
   - Access to another user's workspace resources is strictly rejected with `403 FORBIDDEN`.
2. **Token Verification**:
   - Every protected API route passes through `requireAuth` middleware which validates the Supabase JWT.
3. **Input Validation**:
   - All request bodies, parameters, and query strings are validated against strict Zod schemas. Unexpected or dangerous properties are stripped or rejected.
4. **Resilience without AI Key**:
   - The AI adapter is completely isolated. Missing AI API keys will gracefully disable AI tasks rather than halting application startup.
