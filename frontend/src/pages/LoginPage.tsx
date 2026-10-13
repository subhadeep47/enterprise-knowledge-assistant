import { useState } from "react";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import type { UserRole } from "../api/types";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";
export default function LoginPage() {
  const { login } = useAuth();
  const [demoRole, setDemoRole] = useState<UserRole>("EMPLOYEE");
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-12 text-slate-900">
      <div className="pointer-events-none absolute -left-28 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-2xl shadow-black/20 sm:p-10">
        <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
          <Bot size={26} />
        </div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold tracking-[.14em] text-blue-700">
          <Sparkles size={13} /> YOUR WORK KNOWLEDGE, CONNECTED
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
          Good work starts with good answers.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Ask questions, find trusted company knowledge, and get back to what
          matters.
        </p>
        <button
          onClick={() => login(demoRole)}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:shadow"
        >
          <GoogleMark />
          <span>Continue with Google</span>
        </button>
        {DEMO_MODE && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-3 text-xs text-amber-900">
            <div>
              <div className="font-semibold">Preview role</div>
              <div className="mt-0.5 text-amber-700">Demo mode only</div>
            </div>
            <select
              aria-label="Demo role"
              value={demoRole}
              onChange={(e) => setDemoRole(e.target.value as UserRole)}
              className="rounded-lg border border-amber-200 bg-white px-2.5 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        )}
        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={15} className="text-emerald-600" />
          Secure sign-in for your organisation
        </div>
      </section>
      <footer className="absolute bottom-5 px-4 text-center text-[10px] font-semibold tracking-[.2em] text-slate-500">
        ENTERPRISE KNOWLEDGE ASSISTANT <span className="px-1.5">·</span> BUILT
        FOR BETTER WORK
      </footer>
    </main>
  );
}
function GoogleMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
        transform="translate(0 4)"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.02 46.98 31.8 46.98 24.55Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
        transform="translate(0 4)"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
        transform="translate(0 -2)"
      />
    </svg>
  );
}
