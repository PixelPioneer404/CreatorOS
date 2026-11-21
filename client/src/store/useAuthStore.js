import { create } from 'zustand';
import { AuthService } from '../services/auth.service.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const session = await AuthService.getSession();
      if (session) {
        set({
          session,
          user: session.user,
          isLoading: false,
        });
      } else {
        set({ session: null, user: null, isLoading: false });
      }

      // Listen to Supabase Auth state changes if configured
      if (isSupabaseConfigured) {
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session) {
            set({ session, user: session.user, isLoading: false });
          } else {
            set({ session: null, user: null, isLoading: false });
          }
        });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthService.signUp(email, password, displayName);
      if (data.user) {
        set({
          user: data.user,
          session: data.session || null,
          isLoading: false,
        });
      }
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthService.signIn(email, password);
      set({
        user: data.user,
        session: data.session,
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await AuthService.signOut();
      set({ user: null, session: null, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
