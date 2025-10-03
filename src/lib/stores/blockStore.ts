import { writable, derived } from 'svelte/store';
import { blockingService } from '$lib/services/blockingService';

export interface BlockState {
  blockedUsers: Set<string>;
  loading: boolean;
  initialized: boolean;
}

function createBlockStore() {
  const { subscribe, set, update } = writable<BlockState>({
    blockedUsers: new Set(),
    loading: false,
    initialized: false,
  });

  return {
    subscribe,

    /**
     * Initialize blocked users for current user
     */
    async init(userId: string) {
      update(state => ({ ...state, loading: true }));

      try {
        const blockedIds = await blockingService.getBlockedUsers(userId);
        set({
          blockedUsers: new Set(blockedIds),
          loading: false,
          initialized: true,
        });
      } catch (error) {
        console.error('Failed to initialize block store:', error);
        set({
          blockedUsers: new Set(),
          loading: false,
          initialized: false,
        });
      }
    },

    /**
     * Block a user
     */
    async blockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; error?: string }> {
      const result = await blockingService.blockUser(blockerId, blockedId);

      if (result.success) {
        update(state => ({
          ...state,
          blockedUsers: new Set([...state.blockedUsers, blockedId]),
        }));
      }

      return result;
    },

    /**
     * Unblock a user
     */
    async unblockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; error?: string }> {
      const result = await blockingService.unblockUser(blockerId, blockedId);

      if (result.success) {
        update(state => {
          const newBlocked = new Set(state.blockedUsers);
          newBlocked.delete(blockedId);
          return { ...state, blockedUsers: newBlocked };
        });
      }

      return result;
    },

    /**
     * Check if a user is blocked
     */
    isBlocked(userId: string): boolean {
      let blocked = false;
      subscribe(state => {
        blocked = state.blockedUsers.has(userId);
      })();
      return blocked;
    },

    /**
     * Clear the store (on sign out)
     */
    clear() {
      set({
        blockedUsers: new Set(),
        loading: false,
        initialized: false,
      });
      blockingService.clearCache();
    },
  };
}

export const blockStore = createBlockStore();

/**
 * Derived store: Array of blocked user IDs
 */
export const blockedUserIds = derived(
  blockStore,
  $blockStore => Array.from($blockStore.blockedUsers)
);
