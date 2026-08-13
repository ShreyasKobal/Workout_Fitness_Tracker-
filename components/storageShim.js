// Polyfills `window.storage` for standalone deployment.
//
// App.jsx was originally built inside the Claude Artifacts sandbox, which
// injects a native `window.storage` (get/set/delete/list, all async,
// scoped per-user or shared). Outside that sandbox nothing provides this
// object, so every persistence call in App.jsx — notifications, the
// selected theme, dark mode — would throw or silently no-op.
//
// This shim backs the same API with localStorage, scoped to this browser
// only. IMPORTANT: this means data does NOT sync across devices or
// survive a cleared browser — it's local-only until a real backend
// (e.g. the upcoming multiuser login system) replaces it.

const NS = "wt:";

function scopeKey(key, shared) {
  return `${NS}${shared ? "shared" : "user"}:${key}`;
}

function safeParse(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw; // tolerate legacy non-JSON values
  }
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key, shared = false) {
      const raw = localStorage.getItem(scopeKey(key, shared));
      if (raw == null) return null;
      return { key, value: safeParse(raw), shared };
    },

    async set(key, value, shared = false) {
      localStorage.setItem(scopeKey(key, shared), JSON.stringify(value));
      return { key, value, shared };
    },

    async delete(key, shared = false) {
      localStorage.removeItem(scopeKey(key, shared));
      return { key, deleted: true, shared };
    },

    async list(prefix = "", shared = false) {
      const scopePrefix = scopeKey(prefix, shared);
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(scopePrefix)) {
          keys.push(k.slice(scopeKey("", shared).length));
        }
      }
      return { keys, prefix, shared };
    },
  };
}
