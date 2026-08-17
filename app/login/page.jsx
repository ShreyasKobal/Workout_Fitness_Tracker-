'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AuthSection from '../../components/AuthSection';

// Minimal local copy of just the color helpers AuthSection needs, so this page
// doesn't have to import the whole app's theme system just to render a login form.
const t = {
  card:    (d) => d ? "bg-gray-900/60 border-white/10" : "bg-white/70 border-white/60",
  label:   (d) => d ? "text-gray-400" : "text-slate-400",
  value:   (d) => d ? "text-gray-100" : "text-slate-800",
  muted:   (d) => d ? "text-gray-500" : "text-slate-400",
  divider: (d) => d ? "border-gray-800" : "border-slate-50",
  input:   (d) => d ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 ring-accent" : "bg-white border-slate-200 text-slate-900 ring-accent",
};

// Same 3-theme palette as the main app, so this page's accent colour matches
// whichever theme the person last used (read from the same localStorage key
// pattern via window.storage would need the client shim; keeping this page
// simple and theme-agnostic with the default Slate Horizon accent).
const ACCENT = "#5D8AB3";
const ACCENT_HOVER = "#4C7699";

export default function LoginPage() {
  const [dark, setDark] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Once NextAuth reports a logged-in session (email/password or Google), leave
  // the login page and go back to the app — AuthSection itself doesn't redirect.
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/');
    }
  }, [status, session, router]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${dark ? "bg-gray-900" : "bg-slate-50"}`}
      style={{ "--accent": ACCENT, "--accent-hover": ACCENT_HOVER, "--accent-ring": "rgba(93,138,179,0.35)" }}
    >
      <style>{`
        .bg-accent{ background-color: var(--accent); }
        .bg-accent-hover:hover{ background-color: var(--accent-hover); }
        .ring-accent:focus{ box-shadow: 0 0 0 2px var(--accent-ring); outline: none; }
      `}</style>

      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🏋️</div>
          <h1 className={`text-lg font-bold tracking-tight ${dark ? "text-gray-100" : "text-slate-900"}`}>
            Workout Progress Tracker
          </h1>
          <p className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-slate-400"}`}>
            Sign in to see your workouts
          </p>
        </div>

        <AuthSection dark={dark} t={t} />

        <button
          onClick={() => setDark(d => !d)}
          className={`w-full text-xs mt-4 text-center ${dark ? "text-gray-500 hover:text-gray-300" : "text-slate-400 hover:text-slate-600"}`}
        >
          Switch to {dark ? "light" : "dark"} mode
        </button>
      </div>
    </div>
  );
}
