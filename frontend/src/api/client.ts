import type { ChatMessage, ChatSession, KnowledgeBaseFile, User } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

let csrfToken: string | null = null;

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function initializeCsrf(): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError("CSRF initialization failed", response.status);
  }

  const data: { token: string } = await response.json();
  csrfToken = data.token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const safeMethod = ["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

  if (!safeMethod) {
    await initializeCsrf();
  }

  const headers = new Headers(init.headers);

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (!safeMethod && csrfToken) {
    headers.set("X-XSRF-TOKEN", csrfToken);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent("eka:unauthorized"));
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new ApiError(
      message || `Request failed (${response.status})`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  initializeAuth: async (): Promise<User | null> => {
    await initializeCsrf();

    try {
      return await request<User>("/api/auth/me");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }

      throw error;
    }
  },

  loginWithGoogle: () => {
    window.location.href = `${API_BASE}${import.meta.env.VITE_GOOGLE_LOGIN_PATH}`;
  },

  logout: async () => {
    await request<void>("/api/auth/logout", {
      method: "POST",
    });
  },

  getSessions: async (): Promise<ChatSession[]> => {
    return request<ChatSession[]>("/api/chat/sessions");
  },

  createSession: async (): Promise<ChatSession> => {
    return request<ChatSession>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    return request<ChatMessage[]>(`/api/chat/sessions/${sessionId}/messages`);
  },

  sendMessage: async (
    sessionId: string,
    content: string,
  ): Promise<ChatMessage> => {
    return request<ChatMessage>(`/api/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  uploadKnowledge: async (files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    return request<KnowledgeBaseFile[]>("/api/admin/knowledge-base", {
      method: "POST",
      body: form,
    });
  },
};
