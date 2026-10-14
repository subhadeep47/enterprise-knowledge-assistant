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
  useEffect(() => { if (user) api.getSessions().then(setSessions).catch(() => setSessionError("History unavailable")); }, [user]);
  const newChat = async () => { try { const session = await api.createSession(); setSessions(current => [session, ...current]); navigate(`/chat?session=${session.id}`); } catch { setSessionError("Couldn't start a new chat"); } };
  const navClass = (active: boolean) => `flex items-center gap-3 border-l-2 px-3 py-3 text-sm transition ${active ? "border-[#C85A32] bg-[#E9E2D8] font-semibold text-[#171614]" : "border-transparent text-[#706B64] hover:border-[#D6CEC3] hover:bg-[#EEE8E0] hover:text-[#171614]"}`;
  return <aside className="flex w-[272px] shrink-0 flex-col border-r border-[#D6CEC3] bg-[#EEE8E0] max-md:w-[68px]">
    <div className="flex h-[76px] items-center gap-3 border-b border-[#D6CEC3] px-5 max-md:justify-center max-md:px-2"><div className="grid h-9 w-9 place-items-center bg-[#C85A32] text-[#F4F0EA]"><Bot size={19}/></div><div className="max-md:hidden"><div className="text-sm font-bold tracking-tight">Fieldnotes <span className="text-[#C85A32]">/ AI</span></div><div className="mono-label mt-1 text-[8px] text-[#706B64]">Knowledge system</div></div></div>
    <div className="flex-1 space-y-7 overflow-y-auto px-3 py-5 max-md:px-1.5"><button onClick={() => void newChat()} className="flex w-full items-center justify-center gap-2 bg-[#171614] px-3 py-3 text-sm font-semibold text-[#F4F0EA] transition hover:bg-[#C85A32]"><Plus size={16}/><span className="max-md:hidden">New conversation</span></button>
      <nav className="space-y-1"><NavLink to="/chat" title="Chat" className={({isActive}) => navClass(isActive && !location.search)}><MessageSquare size={16}/><span className="max-md:hidden">Assistant</span></NavLink>{user?.role === "ADMIN" && <NavLink to="/admin" title="Knowledge base" className={({isActive}) => navClass(isActive)}><FileUp size={16}/><span className="max-md:hidden">Knowledge base</span></NavLink>}</nav>
      <section className="max-md:hidden"><div className="mono-label mb-3 px-3 text-[9px] text-[#8A8177]">Recent conversations</div>{sessionError && <p className="px-3 text-xs text-[#C85A32]">{sessionError}</p>}{sessions.map(session => <button key={session.id} onClick={() => navigate(`/chat?session=${session.id}`)} title={session.title} className={`mb-1 flex w-full items-center gap-2 border-l-2 px-3 py-2.5 text-left text-xs transition ${location.search.includes(session.id) ? "border-[#C85A32] bg-[#F4F0EA] text-[#171614]" : "border-transparent text-[#706B64] hover:bg-[#F4F0EA] hover:text-[#171614]"}`}><MessageSquare size={13} className="shrink-0"/><span className="truncate">{session.title}</span></button>)}{!sessions.length && !sessionError && <p className="px-3 text-xs leading-5 text-[#8A8177]">Your conversations will appear here.</p>}</section>
    </div>
    <div className="border-t border-[#D6CEC3] p-3"><div className="mb-3 flex items-center gap-2 px-2 text-[10px] text-[#706B64] max-md:hidden"><ShieldCheck size={13}/>{user?.role === "ADMIN" ? "Administrator" : "Employee workspace"}</div><div className="flex items-center gap-2"><div className="grid h-9 w-9 shrink-0 place-items-center border border-[#D6CEC3] bg-[#F4F0EA] text-[10px] font-bold text-[#C85A32]">{user?.name?.split(" ").map(part => part[0]).slice(0,2).join("").toUpperCase() || "U"}</div><div className="min-w-0 flex-1 max-md:hidden"><div className="truncate text-xs font-semibold text-[#171614]">{user?.name}</div><div className="truncate text-[10px] text-[#706B64]">{user?.email}</div></div><button onClick={() => void logout()} title="Log out" aria-label="Log out" className="p-2 text-[#706B64] transition hover:bg-[#D6CEC3] hover:text-[#171614]"><LogOut size={15}/></button></div></div>
  </aside>;
}
