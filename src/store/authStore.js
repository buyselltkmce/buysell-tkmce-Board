import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TEAM_MEMBERS } from "../data/constants";
import { supabase, isSupabaseConfigured } from "../services/supabase";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      loginError: null,
      isLoading: false,

      // ── Initialize Supabase Auth Session ─────────────────
      initAuth: async () => {
        if (!isSupabaseConfigured || !supabase) return;

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            get()._setAuthUser(session.user, session);
          }

          // Listen for auth state changes (login, logout, token refresh)
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              get()._setAuthUser(session.user, session);
            } else {
              set({ user: null, session: null, isAuthenticated: false });
            }
          });
        } catch (err) {
          console.error("Auth init error:", err);
        }
      },

      // Helper to map Supabase User / email to app profile
      _setAuthUser: (supabaseUser, session) => {
        const cleanEmail = supabaseUser.email?.toLowerCase() || "";
        const matchedMember = TEAM_MEMBERS.find(
          (m) => m.email?.toLowerCase() === cleanEmail
        );

        const userObj = matchedMember
          ? { ...matchedMember, email: supabaseUser.email, uid: supabaseUser.id }
          : {
              id: supabaseUser.id,
              uid: supabaseUser.id,
              name: cleanEmail.split("@")[0] || "User",
              email: supabaseUser.email,
              role: "Team Member (Admin)",
              avatar: (cleanEmail.slice(0, 2) || "US").toUpperCase(),
              color: "#2563EB",
            };

        set({
          user: userObj,
          session,
          isAuthenticated: true,
          loginError: null,
        });
      },

      // ── Login with Supabase ──────────────────────────────
      login: async (email, password) => {
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password) {
          set({ loginError: "Please enter both email and password." });
          return false;
        }

        set({ isLoading: true, loginError: null });

        if (isSupabaseConfigured && supabase) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });

            if (error) {
              set({ loginError: error.message, isLoading: false });
              return false;
            }

            if (data?.user) {
              get()._setAuthUser(data.user, data.session);
              set({ isLoading: false });
              return true;
            }
          } catch (err) {
            set({ loginError: err.message || "Failed to sign in.", isLoading: false });
            return false;
          }
        }

        // Fallback for local dev if Supabase is not configured
        const matchedMember = TEAM_MEMBERS.find(
          (m) => m.email?.toLowerCase() === cleanEmail
        );

        const userObj = matchedMember || {
          id: `u-${Date.now()}`,
          name: cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "Team Member (Admin)",
          avatar: cleanEmail.slice(0, 2).toUpperCase(),
          color: "#2563EB",
        };

        set({
          user: userObj,
          session: null,
          isAuthenticated: true,
          loginError: null,
          isLoading: false,
        });

        return true;
      },

      // ── Change Password via Supabase Backend ──────────────
      changePassword: async (newPassword) => {
        if (!newPassword || newPassword.length < 6) {
          return { success: false, error: "Password must be at least 6 characters." };
        }

        if (isSupabaseConfigured && supabase) {
          try {
            const { error } = await supabase.auth.updateUser({
              password: newPassword,
            });

            if (error) {
              return { success: false, error: error.message };
            }

            return { success: true };
          } catch (err) {
            return { success: false, error: err.message || "Failed to update password." };
          }
        }

        // Fallback for local demo
        return { success: true };
      },

      // ── Logout ────────────────────────────────────────────
      logout: async () => {
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.auth.signOut();
          } catch (err) {
            console.error("Sign out error:", err);
          }
        }
        set({ user: null, session: null, isAuthenticated: false, loginError: null });
      },

      clearError: () => set({ loginError: null }),
    }),
    {
      name: "buysell-auth-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
