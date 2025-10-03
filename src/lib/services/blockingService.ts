import { supabase } from '$lib/supabase';

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

/**
 * Blocking Service
 * Handles directional blocking between users
 *
 * Blocking Rules:
 * - Blocker cannot see blocked user in online list
 * - Blocker cannot send messages to blocked user
 * - Blocker cannot receive messages from blocked user
 * - Blocked user sees no indication they are blocked (they can still send messages)
 * - Blocking is directional (A blocks B doesn't mean B blocks A)
 */
export class BlockingService {
  private blockedUsersCache: Set<string> = new Set();
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute

  /**
   * Block a user
   */
  async blockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Prevent self-blocking
      if (blockerId === blockedId) {
        return { success: false, error: 'Cannot block yourself' };
      }

      // Insert block record
      const { error } = await supabase
        .from('blocks')
        .insert({
          blocker_id: blockerId,
          blocked_id: blockedId,
        });

      if (error) {
        // Check if already blocked (unique constraint violation)
        if (error.code === '23505') {
          return { success: false, error: 'User is already blocked' };
        }
        console.error('Block user error:', error);
        return { success: false, error: 'Failed to block user' };
      }

      // Update cache
      this.blockedUsersCache.add(blockedId);

      return { success: true };
    } catch (error) {
      console.error('Block user error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);

      if (error) {
        console.error('Unblock user error:', error);
        return { success: false, error: 'Failed to unblock user' };
      }

      // Update cache
      this.blockedUsersCache.delete(blockedId);

      return { success: true };
    } catch (error) {
      console.error('Unblock user error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Check if a user is blocked by the current user
   */
  async isBlocked(blockerId: string, userId: string): Promise<boolean> {
    try {
      // Check cache first
      if (Date.now() < this.cacheExpiry && this.blockedUsersCache.has(userId)) {
        return true;
      }

      // Refresh cache if expired
      if (Date.now() >= this.cacheExpiry) {
        await this.refreshBlockedUsersCache(blockerId);
      }

      return this.blockedUsersCache.has(userId);
    } catch (error) {
      console.error('Is blocked check error:', error);
      return false;
    }
  }

  /**
   * Get all blocked users for a user
   */
  async getBlockedUsers(blockerId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', blockerId);

      if (error) {
        console.error('Get blocked users error:', error);
        return [];
      }

      return (data || []).map(block => block.blocked_id);
    } catch (error) {
      console.error('Get blocked users error:', error);
      return [];
    }
  }

  /**
   * Refresh the blocked users cache
   */
  async refreshBlockedUsersCache(blockerId: string): Promise<void> {
    try {
      const blockedIds = await this.getBlockedUsers(blockerId);
      this.blockedUsersCache = new Set(blockedIds);
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    } catch (error) {
      console.error('Refresh blocked users cache error:', error);
    }
  }

  /**
   * Check if blocker is blocked by another user (for preventing message delivery)
   */
  async isBlockedBy(userId: string, potentialBlockerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('id')
        .eq('blocker_id', potentialBlockerId)
        .eq('blocked_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Is blocked by check error:', error);
        return false;
      }

      return data !== null;
    } catch (error) {
      console.error('Is blocked by check error:', error);
      return false;
    }
  }

  /**
   * Clear cache (useful on sign out)
   */
  clearCache(): void {
    this.blockedUsersCache.clear();
    this.cacheExpiry = 0;
  }
}

// Export singleton instance
export const blockingService = new BlockingService();
