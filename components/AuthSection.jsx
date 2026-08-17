'use client';
import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthSection({ dark, t }) {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sign up failed');
        // After signup, sign in with next-auth
        await signIn('credentials', { email, password, redirect: false });
      } else {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (!result?.ok) throw new Error(result?.error || 'Login failed');
      }
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { redirect: false });
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
  };

  if (status === 'loading') {
    return (
      <div className={`rounded-2xl border shadow-sm p-5 space-y-3 ${t.card(dark)}`}>
        <p className={`text-sm ${t.muted(dark)}`}>Loading...</p>
      </div>
    );
  }

  if (session) {
    return (
      <div className={`rounded-2xl border shadow-sm p-5 space-y-3 ${t.card(dark)}`}>
        <h3 className={`text-sm font-semibold ${t.value(dark)}`}>Account</h3>
        <div className="space-y-2">
          <p className={`text-xs ${t.muted(dark)}`}>
            Logged in as: <span className="font-medium">{session.user?.email}</span>
          </p>
          {session.user?.image && (
            <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border shadow-sm p-5 space-y-3 ${t.card(dark)}`}>
      <h3 className={`text-sm font-semibold ${t.value(dark)}`}>Account</h3>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div>
          <label className={`text-xs font-medium ${t.label(dark)}`}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={`w-full px-3 py-2 rounded-lg border mt-1 ${t.input(dark)}`}
            required
          />
        </div>

        <div>
          <label className={`text-xs font-medium ${t.label(dark)}`}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full px-3 py-2 rounded-lg border mt-1 ${t.input(dark)}`}
            required
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 text-sm"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <div className={`border-t ${t.divider(dark)}`} />

      <button
        onClick={handleGoogleSignIn}
        className={`w-full px-3 py-2 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 ${
          dark
            ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700'
            : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError('');
        }}
        className={`w-full text-xs py-2 rounded-lg border ${
          dark
            ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
