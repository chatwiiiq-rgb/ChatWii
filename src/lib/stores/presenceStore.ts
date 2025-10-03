import { writable, derived } from 'svelte/store';
import { presenceService, type PresenceUser } from '$lib/services/presenceService';

interface PresenceStoreState {
  users: PresenceUser[];
  loading: boolean;
  initialized: boolean;
}

function createPresenceStore() {
  const { subscribe, set, update } = writable<PresenceStoreState>({
    users: [],
    loading: false,
    initialized: false,
  });

  let unsubscribePresence: (() => void) | null = null;

  return {
    subscribe,

    /**
     * Initialize presence tracking for current user
     */
    async init(userId: string, nickname: string, gender: 'male' | 'female', age: number, country: string) {
      update((state) => ({ ...state, loading: true }));

      // Join presence channel
      const result = await presenceService.join(userId, nickname, gender, age, country);

      if (result.success) {
        // Get initial online users
        const users = presenceService.getOnlineUsers();
        update((state) => ({ ...state, users, loading: false, initialized: true }));

        // Subscribe to presence changes
        unsubscribePresence = presenceService.onPresenceChange((users) => {
          update((state) => ({ ...state, users }));
        });

        // Setup cleanup handlers
        presenceService.setupCleanupHandlers();
      } else {
        update((state) => ({ ...state, loading: false }));
      }
    },

    /**
     * Leave presence channel
     */
    async leave() {
      if (unsubscribePresence) {
        unsubscribePresence();
        unsubscribePresence = null;
      }

      await presenceService.leave();

      set({
        users: [],
        loading: false,
        initialized: false,
      });
    },

    /**
     * Manually refresh online users
     */
    refresh() {
      const users = presenceService.getOnlineUsers();
      update((state) => ({ ...state, users }));
    },
  };
}

export const presenceStore = createPresenceStore();

// Derived store for sorted users (by nickname)
export const sortedOnlineUsers = derived(presenceStore, ($presence) => {
  return [...$presence.users].sort((a, b) => a.nickname.localeCompare(b.nickname));
});

// Derived store for online user count
export const onlineUserCount = derived(presenceStore, ($presence) => {
  return $presence.users.length;
});

// Derived store for users by country
export const usersByCountry = derived(presenceStore, ($presence) => {
  const grouped: { [country: string]: PresenceUser[] } = {};

  $presence.users.forEach((user) => {
    if (!grouped[user.country]) {
      grouped[user.country] = [];
    }
    grouped[user.country].push(user);
  });

  return grouped;
});
