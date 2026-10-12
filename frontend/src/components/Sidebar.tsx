import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bot, FileUp, LogOut, MessageSquare, Plus, ShieldCheck, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { ChatSession } from "../api/types";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.getSessions().then(setSessions).catch(() => setSessionError("Couldn't load history"));
  }, [user]);

  const newChat = async () => {
    try {
      const session = await api.createSession();
      setSessions((current) => [session, ...current]);
      navigate(`/chat?session=${session.id}`);
    } catch {
      setSessionError("Couldn't start a new chat");
    }
  };

  const openSession = (session: ChatSession) => navigate(`/chat?session=${session.id}`);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><Bot size={19} strokeWidth={2.2} /></div>
        {!collapsed && <div className="brand-copy"><span>Knowledge</span><small>ASSISTANT</small></div>}
        <button className="icon-button collapse-button" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <div className="sidebar-main">
        <button className="new-chat-button" onClick={newChat} title="New chat">
          <Plus size={17} /> {!collapsed && <span>New chat</span>}
        </button>

        <div className="nav-links">
          <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive && !location.search ? "nav-link--active" : ""}`} title="Chat">
            <MessageSquare size={17} /> {!collapsed && <span>Chat</span>}
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "nav-link--active" : ""}`} title="Knowledge base">
              <FileUp size={17} /> {!collapsed && <span>Knowledge base</span>}
            </NavLink>
          )}
        </div>

        {!collapsed && (
          <div className="history-section">
            <div className="section-label">RECENT</div>
            {sessionError && <p className="sidebar-note">{sessionError}</p>}
            {sessions.map((session) => (
              <button key={session.id} className={`history-item ${location.search.includes(session.id) ? "history-item--active" : ""}`} onClick={() => openSession(session)} title={session.title}>
                <MessageSquare size={15} /><span>{session.title}</span>
              </button>
            ))}
            {!sessions.length && !sessionError && <p className="sidebar-note">Your conversations will appear here.</p>}
          </div>
        )}
      </div>

      <div className="sidebar-bottom">
        {user?.role === "ADMIN" && <div className="role-chip"><ShieldCheck size={14} /> {!collapsed && "Administrator"}</div>}
        <div className="profile-row">
          <div className="avatar">{user?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "U"}</div>
          {!collapsed && <div className="profile-details"><strong>{user?.name}</strong><span>{user?.email}</span></div>}
          <button className="icon-button logout-button" onClick={() => void logout()} aria-label="Log out" title="Log out"><LogOut size={17} /></button>
        </div>
      </div>
    </aside>
  );
}
