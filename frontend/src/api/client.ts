import type { ChatMessage, ChatSession, User, UserRole } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";
const STORAGE_KEY = "eka-demo-user";

function delay(ms = 350) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function demoUser(): User | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("eka:unauthorized"));
    }
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const demoSessions: ChatSession[] = [
  {
    id: "demo-1",
    title: "Annual leave policy",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Expense reimbursement",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "demo-3",
    title: "Getting started with VPN",
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const demoMessages: Record<string, ChatMessage[]> = {
  "demo-1": [
    {
      id: "m1",
      role: "user",
      content: "How many annual leave days do employees get?",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Employees receive annual leave according to their employment grade and local policy. Check the current People Handbook for your location; I can help you find the exact section once the knowledge base is connected.",
      createdAt: new Date().toISOString(),
      sources: [{ title: "People Handbook", page: 12 }],
    },
  ],
  "demo-2": [
    {
      id: "m3",
      role: "user",
      content: "How do I claim an expense?",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m4",
      role: "assistant",
      content:
        "Usually, you submit an expense claim through the company expense portal with the receipt and business purpose attached. Please verify the exact steps in your organisation's expense policy.",
      createdAt: new Date().toISOString(),
    },
  ],
  "demo-3": [
    {
      id: "m5",
      role: "user",
      content: "I can't connect to the VPN.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m6",
      role: "assistant",
      content:
        "Start by confirming your internet connection, then restart the VPN client and sign in with your company account. If the issue continues, contact IT support with the error message.",
      createdAt: new Date().toISOString(),
    },
  ],
};

export const api = {
  getCurrentUser: async (): Promise<User | null> => {
    if (DEMO_MODE) {
      await delay(180);
      return demoUser();
    }
    try {
      return await request<User>("/api/auth/me");
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) return null;
      return null;
    }
  },

  loginWithGoogle: (role: UserRole = "EMPLOYEE") => {
    if (DEMO_MODE) {
      const user: User =
        role === "ADMIN"
          ? {
              id: "demo-admin",
              name: "Taylor Morgan",
              email: "taylor.morgan@company.com",
              role: "ADMIN",
            }
          : {
              id: "demo-employee",
              name: "Alex Morgan",
              email: "alex.morgan@company.com",
              role: "EMPLOYEE",
            };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      window.location.href = role === "ADMIN" ? "/admin" : "/chat";
      return;
    }
    window.location.href = `${API_BASE}${import.meta.env.VITE_GOOGLE_LOGIN_PATH || "/oauth2/authorization/google"}`;
  },

  logout: async () => {
    if (DEMO_MODE) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    await request<void>("/api/auth/logout", { method: "POST" });
  },

  getSessions: async (): Promise<ChatSession[]> => {
    if (DEMO_MODE) {
      await delay();
      return demoSessions;
    }
    return request<ChatSession[]>("/api/chat/sessions");
  },

  createSession: async (): Promise<ChatSession> => {
    if (DEMO_MODE) {
      await delay(150);
      return {
        id: `demo-${Date.now()}`,
        title: "New conversation",
        updatedAt: new Date().toISOString(),
      };
    }
    return request<ChatSession>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    if (DEMO_MODE) {
      await delay(180);
      return demoMessages[sessionId] ?? [];
    }
    return request<ChatMessage[]>(`/api/chat/sessions/${sessionId}/messages`);
  },

  sendMessage: async (
    sessionId: string,
    content: string,
  ): Promise<ChatMessage> => {
    if (DEMO_MODE) {
      await delay(900);
      return {
        id: `reply-${Date.now()}`,
        role: "assistant",
        content: `This is a demo response to: “${content}”\n\nOnce the Spring AI backend is connected, this reply will be generated using the organisation's knowledge base and will include relevant source citations.`,
        createdAt: new Date().toISOString(),
        sources: [{ title: "Demo knowledge base", page: 1 }],
      };
    }
    return request<ChatMessage>(`/api/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  uploadKnowledge: async (files: File[]) => {
    if (DEMO_MODE) {
      await delay(1000);
      return { uploaded: files.length };
    }
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    return request<{ uploaded: number }>("/api/admin/knowledge-base", {
      method: "POST",
      body: form,
    });
  },
};
