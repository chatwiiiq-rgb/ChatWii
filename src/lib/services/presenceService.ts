import { supabase } from '$lib/supabase';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

export interface PresenceUser {
  user_id: string;
  nickname: string;
  gender: 'male' | 'female';
  age: number;
  country: string;
  online_at: string;
}

export interface PresenceState {
  [key: string]: PresenceUser[];
}

/**
 * Presence Manager Service
 * Manages real-time user presence using Supabase Realtime Presence
 */
export class PresenceService {
  private channel: RealtimeChannel | null = null;
  private heartbeatInterval: number | null = null;
  private currentUserId: string | null = null;

  /**
   * Join the presence channel
   */
  async join(userId: string, nickname: string, gender: 'male' | 'female', age: number, country: string) {
    try {
      this.currentUserId = userId;

      // Create presence channel
      this.channel = supabase.channel('online-users', {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Track user presence
      const presenceData: PresenceUser = {
        user_id: userId,
        nickname,
        gender,
        age,
        country,
        online_at: new Date().toISOString(),
      };

      // Subscribe to channel and track presence
      await this.channel
        .on('presence', { event: 'sync' }, () => {
          // Presence state synced
          console.log('Presence synced');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track presence
            await this.channel?.track(presenceData);

            // Start heartbeat to update database backup
            this.startHeartbeat(userId);
          }
        });

      // Update database online status
      await supabase
        .from('users')
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      return { success: true };
    } catch (error) {
      console.error('Failed to join presence:', error);
      return { success: false, error };
    }
  }

  /**
   * Leave the presence channel
   */
  async leave() {
    try {
      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Untrack presence
      if (this.channel) {
        await this.channel.untrack();
        await this.channel.unsubscribe();
        this.channel = null;
      }

      // Update database online status
      if (this.currentUserId) {
        await supabase
          .from('users')
          .update({
            is_online: false,
            last_seen: new Date().toISOString(),
          })
          .eq('id', this.currentUserId);
      }

      this.currentUserId = null;

      return { success: true };
    } catch (error) {
      console.error('Failed to leave presence:', error);
      return { success: false, error };
    }
  }

  /**
   * Get current presence state (all online users)
   */
  getPresenceState(): PresenceState {
    if (!this.channel) return {};

    const state = this.channel.presenceState() as RealtimePresenceState<PresenceUser>;
    return state;
  }

  /**
   * Get array of online users
   */
  getOnlineUsers(): PresenceUser[] {
    const state = this.getPresenceState();
    const users: PresenceUser[] = [];

    Object.values(state).forEach((presences) => {
      if (presences && presences.length > 0) {
        users.push(presences[0]);
      }
    });

    return users;
  }

  /**
   * Subscribe to presence changes
   */
  onPresenceChange(callback: (users: PresenceUser[]) => void) {
    if (!this.channel) return () => {};

    const syncHandler = () => {
      const users = this.getOnlineUsers();
      callback(users);
    };

    this.channel.on('presence', { event: 'sync' }, syncHandler);
    this.channel.on('presence', { event: 'join' }, syncHandler);
    this.channel.on('presence', { event: 'leave' }, syncHandler);

    // Return empty unsubscribe function (channel unsubscribe handles cleanup)
    return () => {
      // Cleanup happens in leave() method when channel is unsubscribed
    };
  }

  /**
   * Start heartbeat to update database backup every 30 seconds
   */
  private startHeartbeat(userId: string) {
    this.heartbeatInterval = window.setInterval(async () => {
      try {
        await supabase
          .from('users')
          .update({
            last_seen: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log('Heartbeat sent');
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 30000); // 30 seconds
  }

  /**
   * Cleanup on page unload
   */
  setupCleanupHandlers() {
    // Cleanup on page unload only (not on tab visibility change)
    window.addEventListener('beforeunload', () => {
      if (this.currentUserId) {
        // Use sendBeacon for reliable cleanup on page unload
        const data = new FormData();
        data.append('user_id', this.currentUserId);
        navigator.sendBeacon('/api/presence/leave', data);
      }
    });

    // Note: Removed visibilitychange handler
    // Users stay online even when tab is hidden/alt-tabbed
    // They only go offline after 3 minutes of inactivity (handled by heartbeat)
    // or when they close the tab (handled by beforeunload)
  }
}

// Export singleton instance
export const presenceService = new PresenceService();
