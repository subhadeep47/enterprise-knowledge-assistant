# Enterprise Knowledge Assistant — Frontend

A minimal React + TypeScript + Vite frontend with:
- Google-only login entry point
- Protected application layout
- Employee chat screen with conversation history
- Admin knowledge-base upload screen
- Logout
- Responsive sidebar and clean minimal styling

## Requirements
- Node.js 20+
- npm
- Spring Boot backend for real authentication and API calls

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

The project defaults to `VITE_DEMO_MODE=true` so you can explore the UI before the backend is ready. Demo mode uses mock sessions and a mock admin/employee identity. **Do not enable demo mode in production.**

To connect the backend:
1. Set `VITE_DEMO_MODE=false`.
2. Set `VITE_API_BASE_URL` if your backend is on a separate origin, or configure the Vite proxy in `vite.config.ts`.
3. Ensure Spring Security exposes `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/chat/sessions`, `GET /api/chat/sessions/:id/messages`, `POST /api/chat/sessions`, `POST /api/chat/sessions/:id/messages`, and `POST /api/admin/knowledge-base`.
4. Configure Spring OAuth2 login at `/oauth2/authorization/google`.
5. Use a secure HttpOnly session cookie (recommended) and configure CORS/CSRF appropriately for your deployment.

### Demo role switching
In demo mode, the login screen includes a small role selector for previewing employee/admin layouts. This selector is intentionally hidden when demo mode is disabled. In a real system, the role must come from the authenticated backend identity; never trust a role supplied by the browser.

## Suggested API contract

`GET /api/auth/me`
```json
{ "id": "u-123", "name": "Alex Morgan", "email": "alex@company.com", "role": "EMPLOYEE" }
```

`GET /api/chat/sessions`
```json
[{ "id": "s-1", "title": "Expense policy", "updatedAt": "2026-10-12T09:00:00Z" }]
```

`GET /api/chat/sessions/:id/messages`
```json
[{ "id": "m-1", "role": "assistant", "content": "Here is the policy summary.", "createdAt": "2026-10-12T09:00:00Z" }]
```

`POST /api/chat/sessions/:id/messages`
```json
{ "content": "How do I submit expenses?" }
```
Expected response:
```json
{ "id": "m-2", "role": "assistant", "content": "You can submit expenses from ...", "createdAt": "2026-10-12T09:01:00Z", "sources": [{ "title": "Expense Policy.pdf", "page": 4 }] }
```

`POST /api/admin/knowledge-base` should accept `multipart/form-data` with one or more files in a `files` field. Adjust the client if your backend contract differs.

## Project structure

```text
src/
  api/              API client and types
  auth/              Auth context and protected route
  components/        Shared app layout and sidebar
  pages/             Login, chat, admin upload pages
  styles/            Global CSS
```

## Notes
- API routes are centralized in `src/api/client.ts`.
- Chat requests use a simple loading state and display source references when returned.
- Upload progress is represented with a busy state; production progress can be added once the backend supports it.
- Frontend route protection improves UX but is not a security boundary. Enforce roles and access on the backend too.
