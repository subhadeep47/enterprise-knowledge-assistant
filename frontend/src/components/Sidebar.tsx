import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bot, FileUp, LogOut, MessageSquare, Plus, ShieldCheck } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { ChatSession } from "../api/types";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionError, setSessionError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { if (user) api.getSessions().then(setSessions).catch(() => setSessionError("Couldn't load history")); }, [user]);
  const newChat = async () => { try { const session = await api.createSession(); setSessions(current => [session, ...current]); navigate(`/chat?session=${session.id}`); } catch { setSessionError("Couldn't start a new chat"); } };
  return <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 max-md:w-20">
    <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-5 max-md:justify-center max-md:px-2"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><Bot size={21}/></div><div className="max-md:hidden"><div className="font-semibold tracking-tight text-slate-900">Knowledge</div><div className="text-[10px] font-semibold tracking-[.2em] text-slate-500">ASSISTANT</div></div></div>
    <div className="flex-1 space-y-6 overflow-y-auto p-4 max-md:px-2"><button onClick={() => void newChat()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"><Plus size={17}/><span className="max-md:hidden">New chat</span></button>
      <nav className="space-y-1"><NavLink to="/chat" className={({isActive}) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive && !location.search ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}><MessageSquare size={17}/><span className="max-md:hidden">Chat</span></NavLink>{user?.role === "ADMIN" && <NavLink to="/admin" className={({isActive}) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}><FileUp size={17}/><span className="max-md:hidden">Knowledge base</span></NavLink>}</nav>
      <section className="max-md:hidden"><div className="mb-2 px-2 text-[10px] font-bold tracking-[.18em] text-slate-400">RECENT CONVERSATIONS</div>{sessionError && <p className="px-2 text-xs text-rose-600">{sessionError}</p>}{sessions.map(session => <button key={session.id} onClick={() => navigate(`/chat?session=${session.id}`)} title={session.title} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${location.search.includes(session.id) ? "bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}><MessageSquare size={14} className="shrink-0 text-slate-400"/><span className="truncate">{session.title}</span></button>)}{!sessions.length && !sessionError && <p className="px-2 text-xs leading-5 text-slate-400">Your conversations will appear here.</p>}</section>
    </div>
    <div className="border-t border-slate-200 p-3"><div className="mb-3 flex items-center gap-2 px-2 text-xs text-slate-500 max-md:hidden"><ShieldCheck size={14}/>{user?.role === "ADMIN" ? "Administrator" : "Employee workspace"}</div><div className="flex items-center gap-2"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{user?.name?.split(" ").map(part => part[0]).slice(0,2).join("").toUpperCase() || "U"}</div><div className="min-w-0 flex-1 max-md:hidden"><div className="truncate text-xs font-semibold text-slate-800">{user?.name}</div><div className="truncate text-[11px] text-slate-500">{user?.email}</div></div><button onClick={() => void logout()} title="Log out" aria-label="Log out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"><LogOut size={16}/></button></div></div>
  </aside>;
}
