import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '@supabase/supabase-js';
import { AuthService } from '$lib/services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  return {
    subscribe,

    /**
     * Initialize auth state and listen for changes
     */
    init: async () => {
      if (!browser) return;

      // Get initial session
      const user = await AuthService.getCurrentUser();
      set({ user, loading: false, initialized: true });

      // Listen for auth changes
      AuthService.onAuthStateChange((user) => {
        update((state) => ({ ...state, user }));
      });
    },

    /**
     * Set loading state
     */
    setLoading: (loading: boolean) => {
      update((state) => ({ ...state, loading }));
    },

    /**
     * Clear auth state on sign out
     */
    clear: () => {
      set({ user: null, loading: false, initialized: true });
    },
  };
}

export const authStore = createAuthStore();
