# Enterprise Knowledge & Support Assistant — Frontend

Minimal React + TypeScript frontend for an enterprise knowledge assistant. Styling uses **Tailwind CSS v4 through the Vite plugin** (no hand-authored component stylesheet).

## Features

- Google sign-in entry point; backend owns the OAuth2 flow when demo mode is disabled.
- Protected application routes for `/chat` and `/admin`.
- Employee chat UI with recent sessions, suggested prompts, message history, and source references.
- Admin knowledge-base document upload UI (PDF, DOC/DOCX, TXT, MD).
- Logout action and `credentials: "include"` on API requests for cookie-based BFF authentication.
- Demo mode for previewing the frontend without a backend. The demo role selector is shown only in demo mode.
- Vite TypeScript environment types included in `src/vite-env.d.ts` to resolve `Property 'env' does not exist on type 'ImportMeta'`.

## Requirements

- Node.js 20.19+ or 22.12+ recommended for Vite 6.
- npm.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

## Connect the Spring Boot backend

Set the following in `.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_DEMO_MODE=false
VITE_GOOGLE_LOGIN_PATH=/oauth2/authorization/google
```

The frontend currently expects these backend routes:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/me` | Current authenticated user |
| `POST` | `/api/auth/logout` | Clear the server-side session/cookie |
| `GET` | `/api/chat/sessions` | List chat sessions |
| `POST` | `/api/chat/sessions` | Create a chat session |
| `GET` | `/api/chat/sessions/{sessionId}/messages` | Read a session's messages |
| `POST` | `/api/chat/sessions/{sessionId}/messages` | Send a message |
| `POST` | `/api/admin/knowledge-base` | Upload knowledge documents as multipart field `files` |

Expected current-user shape:

```json
{
  "id": "user-id",
  "name": "Alex Morgan",
  "email": "alex@company.com",
  "role": "EMPLOYEE"
}
```

`role` should be `EMPLOYEE` or `ADMIN`. The frontend sends requests with `credentials: "include"`, so the BFF should issue the application JWT in an HttpOnly cookie. Configure backend CORS to allow the Vite origin with credentials, or serve/proxy the frontend and backend through one origin. Do not expose tokens to browser JavaScript.

## Production build

```bash
npm run build
npm run preview
```

## Important scope note

This is a frontend scaffold. Demo mode uses mock data and browser local storage for preview convenience; it is not production authentication. In backend mode, Google OAuth, JWT validation, role assignment, cookie flags, CSRF strategy, and document ingestion must be implemented and secured by Spring Boot.
