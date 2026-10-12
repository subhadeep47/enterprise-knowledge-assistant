export type UserRole = "EMPLOYEE" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

export interface SourceReference {
  title: string;
  page?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: SourceReference[];
}
