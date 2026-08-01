import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TEAM_MEMBERS } from "../data/constants";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loginError: null,

      login: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        
        // Find matching team member or default to user
        const matchedMember = TEAM_MEMBERS.find(
          (m) => m.email?.toLowerCase() === cleanEmail
        );

        if (!cleanEmail || !password) {
          set({ loginError: "Please enter both email and password." });
          return false;
        }

        if (password.length < 4) {
          set({ loginError: "Password must be at least 4 characters long." });
          return false;
        }

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
          isAuthenticated: true,
          loginError: null,
        });

        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, loginError: null });
      },

      clearError: () => set({ loginError: null }),
    }),
    {
      name: "buysell-auth-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
