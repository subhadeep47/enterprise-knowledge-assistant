import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
export default function AppLayout() {
  return <div className="flex min-h-screen bg-white text-slate-800"><Sidebar /><main className="min-w-0 flex-1"> <Outlet /> </main></div>;
}
