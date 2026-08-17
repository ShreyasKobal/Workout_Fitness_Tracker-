'use client';
import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Settings, LogOut, Moon, Sun, Edit2 } from 'lucide-react';

// Simple MD5 hash for Gravatar URLs
function MD5(s) {
  function L(a, b) { return (a << b) | (a >>> (32 - b)); }
  function M(a, b) { return (((a + b) & 0xffffffff) >>> 0); }
  function P(a, b, c, d, x, s, t) {
    a = M(a, M(M(L(M(a, M(M(b & c) | ((~b) & d), x)), s), t)));
    return a;
  }
  var x = [];
  for (var i = 0; i < s.length; i += 2) x[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (0 << 16) + (0 << 24);
  x[s.length >> 2] |= 0x80 << (((s.length % 4) * 8));
  x[(((s.length + 8) >> 6) + 1) * 16 - 2] = s.length * 8;
  var B = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (var i = 0; i < x.length; i += 16) {
    var A = B[0]; var C = B[1]; var D = B[2]; var E = B[3];
    A = P(A, C, D, E, x[i], 7, 0xd76aa478); E = P(E, A, C, D, x[i + 1], 12, 0xe8c7b756);
    D = P(D, E, A, C, x[i + 2], 17, 0x242070db); C = P(C, D, E, A, x[i + 3], 22, 0xc1bdceee);
    A = P(A, C, D, E, x[i + 4], 7, 0xf57c0faf); E = P(E, A, C, D, x[i + 5], 12, 0x4787c62a);
    D = P(D, E, A, C, x[i + 6], 17, 0xa8304613); C = P(C, D, E, A, x[i + 7], 22, 0xfd469501);
    A = P(A, C, D, E, x[i + 8], 7, 0x698098d8); E = P(E, A, C, D, x[i + 9], 12, 0x8b44f7af);
    D = P(D, E, A, C, x[i + 10], 17, 0xffff5bb1); C = P(C, D, E, A, x[i + 11], 22, 0x895cd7be);
    A = P(A, C, D, E, x[i + 12], 7, 0x6b901122); E = P(E, A, C, D, x[i + 13], 12, 0xfd987193);
    D = P(D, E, A, C, x[i + 14], 17, 0xa679438e); C = P(C, D, E, A, x[i + 15], 22, 0x49b40821);
    B[0] = M(B[0], A); B[1] = M(B[1], C); B[2] = M(B[2], D); B[3] = M(B[3], E);
  }
  var t = ["a", "b", "c", "d", "e", "f"];
  var r = "";
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var q = (B[i] >> (j * 8 + 4)) & 0x0f;
      var k = (B[i] >> (j * 8)) & 0x0f;
      r += t[q] + t[k];
    }
  }
  return r;
}

// Props:
//  dark, setDark, t          — theme helpers, same as rest of the app
//  nickname                  — current nickname (string, may be '')
//  onNicknameChange(newVal)  — call this after a successful save so the header updates immediately
//  onGoToSettings()          — call this to switch the app's active tab to "settings"
export default function UserProfileMenu({ dark, setDark, t, nickname: nicknameProp, onNicknameChange, onGoToSettings }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState(nicknameProp || '');
  const [draftNickname, setDraftNickname] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef(null);

  // Keep local nickname in sync if the parent's copy changes (e.g. on first load)
  useEffect(() => {
    setNickname(nicknameProp || '');
  }, [nicknameProp]);

  // Extract a readable name from the email as a fallback when no nickname is set
  const getUserDisplayName = () => {
    if (nickname) return nickname;
    if (!session?.user?.email) return 'User';
    const namePart = session.user.email.split('@')[0];
    return namePart
      .replace(/[0-9]/g, '')
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSaveNickname = async () => {
    if (!draftNickname.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: draftNickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save nickname');
      const saved = data.nickname || draftNickname.trim();
      setNickname(saved);
      onNicknameChange && onNicknameChange(saved);
      setIsEditingNickname(false);
    } catch (err) {
      setError(err.message || 'Could not save nickname');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ redirect: false });
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsEditingNickname(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session) return null;

  const displayName = getUserDisplayName();
  const gravatarFallback = `https://www.gravatar.com/avatar/${MD5((session.user?.email || '').trim().toLowerCase())}?d=identicon&s=64`;
  // Prefer the real account photo (e.g. Google profile picture) that NextAuth already
  // gives us on the session; only fall back to a Gravatar identicon if no photo exists.
  const gravatar = session.user?.image || gravatarFallback;

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-2 transition-transform hover:scale-105 focus:outline-none ${
          dark ? 'ring-white ring-offset-gray-900' : 'ring-white ring-offset-slate-50'
        }`}
        title={session.user?.email}
      >
        <img
          src={gravatar}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = gravatarFallback; }}
        />
      </button>

      {/* Dropdown — solid background, no glass/blur, so text stays fully legible */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl z-50 overflow-hidden border ${
            dark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
          style={{ transformOrigin: 'top right' }}
        >
          {/* Profile header */}
          <div className={`px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <img
                src={gravatar}
                alt={displayName}
                className={`w-12 h-12 rounded-full ring-2 ring-white`}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = gravatarFallback; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm truncate ${dark ? 'text-gray-100' : 'text-slate-900'}`}>
                  {displayName}
                </h3>
                <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Nickname */}
          <div className={`px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-semibold ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Nickname</p>
              {!isEditingNickname && (
                <button
                  onClick={() => { setDraftNickname(nickname); setIsEditingNickname(true); setError(''); }}
                  className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${
                    dark ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>

            {isEditingNickname ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={draftNickname}
                  onChange={(e) => setDraftNickname(e.target.value)}
                  placeholder={displayName}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  autoFocus
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNickname}
                    disabled={loading}
                    className="flex-1 bg-accent text-white py-1.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
                  >
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setIsEditingNickname(false); setError(''); }}
                    className={`flex-1 border rounded-lg text-sm font-medium ${
                      dark ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-sm ${dark ? 'text-gray-100' : 'text-slate-900'}`}>
                {nickname || '(no nickname set)'}
              </p>
            )}
          </div>

          {/* Dark mode toggle */}
          <div className={`px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dark ? <Moon size={16} className="text-gray-400" /> : <Sun size={16} className="text-slate-500" />}
                <span className={`text-sm ${dark ? 'text-gray-100' : 'text-slate-900'}`}>
                  {dark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={() => setDark(!dark)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  dark ? 'bg-accent' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    dark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Settings — navigates the app's own Settings tab, no page reload */}
          <button
            onClick={() => {
              setIsOpen(false);
              onGoToSettings && onGoToSettings();
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-b ${
              dark ? 'border-gray-700 hover:bg-gray-700' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings size={16} className={dark ? 'text-gray-400' : 'text-slate-500'} />
            <span className={`text-sm ${dark ? 'text-gray-100' : 'text-slate-900'}`}>Settings</span>
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
