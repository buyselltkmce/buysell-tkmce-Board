import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TEAM_MEMBERS } from "../data/constants";

// ── Simple deterministic hash (not cryptographic, but good enough for local auth) ──
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32-bit int
  }
  return hash.toString(36);
}

// Default credentials for each team member
// Password is stored as a hash. Default passwords: "buysell2026"
const DEFAULT_PASSWORD_HASH = simpleHash("buysell2026");

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loginError: null,
      // Map of email → password hash (persisted in localStorage)
      passwordStore: {},

      // ── Helper: get hash for an email ─────────────────────
      _getHash: (email) => {
        const store = get().passwordStore;
        return store[email.toLowerCase()] ?? DEFAULT_PASSWORD_HASH;
      },

      // ── Login ─────────────────────────────────────────────
      login: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password) {
          set({ loginError: "Please enter both email and password." });
          return false;
        }

        if (password.length < 4) {
          set({ loginError: "Password must be at least 4 characters long." });
          return false;
        }

        // Validate password against stored hash
        const expectedHash = get()._getHash(cleanEmail);
        const inputHash    = simpleHash(password);

        if (inputHash !== expectedHash) {
          set({ loginError: "Incorrect password. Please try again." });
          return false;
        }

        // Find matching team member
        const matchedMember = TEAM_MEMBERS.find(
          (m) => m.email?.toLowerCase() === cleanEmail
        );

        const userObj = matchedMember || {
          id:     `u-${Date.now()}`,
          name:   cleanEmail.split("@")[0],
          email:  cleanEmail,
          role:   "Team Member (Admin)",
          avatar: cleanEmail.slice(0, 2).toUpperCase(),
          color:  "#2563EB",
        };

        set({
          user: userObj,
          isAuthenticated: true,
          loginError: null,
        });

        return true;
      },

      // ── Change Password ───────────────────────────────────
      changePassword: (email, currentPassword, newPassword) => {
        const cleanEmail   = email.trim().toLowerCase();
        const expectedHash = get()._getHash(cleanEmail);
        const currentHash  = simpleHash(currentPassword);

        if (currentHash !== expectedHash) {
          return { success: false, error: "Current password is incorrect." };
        }

        if (newPassword === currentPassword) {
          return { success: false, error: "New password must be different from the current one." };
        }

        const newHash = simpleHash(newPassword);
        set((s) => ({
          passwordStore: { ...s.passwordStore, [cleanEmail]: newHash },
        }));

        return { success: true };
      },

      // ── Logout ────────────────────────────────────────────
      logout: () => {
        set({ user: null, isAuthenticated: false, loginError: null });
      },

      clearError: () => set({ loginError: null }),
    }),
    {
      name: "buysell-auth-v2",          // bumped version to reset old storage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:          state.user,
        isAuthenticated: state.isAuthenticated,
        passwordStore: state.passwordStore,
      }),
    }
  )
);
