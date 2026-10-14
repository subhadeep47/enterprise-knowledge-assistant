import { useState } from "react";
import { ArrowUpRight, Bot, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import type { UserRole } from "../api/types";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

export default function LoginPage() {
  const { login } = useAuth();
  const [demoRole, setDemoRole] = useState<UserRole>("EMPLOYEE");
  return (
    <main className="paper-grid min-h-screen bg-[#F4F0EA] p-4 text-[#171614] sm:p-7 lg:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1440px] grid-cols-1 border border-[#171614] bg-[#F4F0EA] lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.45fr_.8fr]">
        <section className="relative flex min-h-[520px] flex-col justify-between overflow-hidden border-b border-[#171614] p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-14 xl:p-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center bg-[#C85A32] text-[#F4F0EA]">
                <Bot size={21} />
              </span>
              <span className="text-sm font-bold tracking-tight">
                Fieldnotes<span className="text-[#C85A32]"> / AI</span>
              </span>
            </div>
            <span className="mono-label hidden text-[10px] text-[#706B64] sm:block">
              Knowledge, put to work
            </span>
          </div>
          <div className="relative z-10 my-16 max-w-3xl lg:my-20">
            <p className="mono-label mb-7 flex items-center gap-3 text-[10px] text-[#C85A32]">
              <span className="h-px w-9 bg-[#C85A32]" />
              Internal knowledge system · 01
            </p>
            <h1 className="display-font max-w-4xl text-[clamp(4rem,8vw,8.7rem)] leading-[.84] tracking-[-.045em]">
              Good answers
              <br />
              <em className="text-[#C85A32]">live here.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-[#706B64] sm:text-lg">
              A calmer way to find the policies, processes and expertise already
              inside your organisation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-[#D6CEC3] pt-5 sm:grid-cols-3">
            <div>
              <p className="mono-label text-[9px] text-[#706B64]">
                01 / Search
              </p>
              <p className="mt-2 text-sm font-semibold">Find the signal</p>
            </div>
            <div>
              <p className="mono-label text-[9px] text-[#706B64]">
                02 / Ground
              </p>
              <p className="mt-2 text-sm font-semibold">Trust the source</p>
            </div>
            <div className="hidden sm:block">
              <p className="mono-label text-[9px] text-[#706B64]">03 / Move</p>
              <p className="mt-2 text-sm font-semibold">Get back to work</p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-[-2rem] hidden select-none display-font text-[18rem] leading-none text-[#E9E2D8] xl:block"
          >
            F.
          </div>
        </section>
        <section className="flex flex-col justify-between p-7 sm:p-10 lg:p-12 xl:p-16">
          <div className="flex justify-between">
            <span className="mono-label text-[10px] text-[#706B64]">
              Workspace access
            </span>
            <span className="mono-label text-[10px] text-[#706B64]">v 1.0</span>
          </div>
          <div className="mx-auto my-14 w-full max-w-sm lg:my-0">
            <p className="mono-label mb-4 text-[10px] text-[#C85A32]">
              Welcome back
            </p>
            <h2 className="display-font text-5xl leading-[.98] sm:text-6xl">
              Your work,
              <br />
              within reach.
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#706B64]">
              Sign in with your organisation's Google account to continue.
            </p>
            <button
              onClick={() => login(demoRole)}
              className="group mt-9 flex w-full items-center justify-between border border-[#171614] bg-[#171614] px-5 py-4 text-left text-sm font-semibold text-[#F4F0EA] transition hover:bg-[#C85A32] hover:border-[#C85A32]"
            >
              <span className="flex items-center gap-3">
                <GoogleMark />
                Continue with Google
              </span>
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
            {DEMO_MODE && (
              <div className="mt-4 border border-[#D6CEC3] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mono-label text-[9px] text-[#706B64]">
                      Preview environment
                    </p>
                    <p className="mt-1 text-xs">Choose a demo role</p>
                  </div>
                  <select
                    aria-label="Demo role"
                    value={demoRole}
                    onChange={(e) => setDemoRole(e.target.value as UserRole)}
                    className="max-w-[140px] border border-[#D6CEC3] bg-transparent px-2 py-2 text-xs outline-none focus:border-[#C85A32]"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            )}
            <p className="mt-6 flex items-center gap-2 text-xs text-[#706B64]">
              <ShieldCheck size={15} className="text-[#C85A32]" />
              Secure access for your organisation
            </p>
          </div>
          <div className="flex items-end justify-between border-t border-[#D6CEC3] pt-4">
            <span className="mono-label text-[9px] text-[#706B64]">
              Private by design
            </span>
            <span className="display-font text-2xl italic text-[#C85A32]">
              Make knowledge useful.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
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
