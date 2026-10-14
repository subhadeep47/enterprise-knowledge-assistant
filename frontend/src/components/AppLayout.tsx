import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#F4F0EA] text-[#171614]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
