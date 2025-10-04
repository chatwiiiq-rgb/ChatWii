import { supabase } from '$lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image';
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  metadata?: any;
}

export interface SendMessageParams {
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image';
}

export interface SendMessageResult {
  success: boolean;
  message?: Message;
  error?: string;
  isBlocked?: boolean;
}

/**
 * Message Service
 * Handles real-time messaging using database-first pattern + Broadcast channels
 */
export class MessageService {
  private channel: RealtimeChannel | null = null;
  private currentUserId: string | null = null;

  /**
   * Initialize messaging for a user (subscribe to their private channel)
   */
  async init(userId: string) {
    try {
      this.currentUserId = userId;

      // Create private broadcast channel for this user
      this.channel = supabase.channel(`user:${userId}:messages`, {
        config: {
          broadcast: { self: true },
        },
      });

      // Subscribe to channel
      await this.channel.subscribe();

      return { success: true };
    } catch (error) {
      console.error('Failed to initialize messaging:', error);
      return { success: false, error };
    }
  }

  /**
   * Send a message (database-first, then broadcast)
   */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    try {
      const { senderId, receiverId, content, messageType = 'text' } = params;

      // Validate content length
      if (content.length > 160) {
        return { success: false, error: 'Message too long (max 160 characters)' };
      }

      if (content.trim().length === 0) {
        return { success: false, error: 'Message cannot be empty' };
      }

      // IMPORTANT: Check blocking BEFORE inserting into database
      // This prevents blocked messages from being stored
      const { data: blockCheck, error: blockError } = await supabase
        .from('blocks')
        .select('id')
        .or(`and(blocker_id.eq.${receiverId},blocked_id.eq.${senderId}),and(blocker_id.eq.${senderId},blocked_id.eq.${receiverId})`)
        .limit(1)
        .maybeSingle();

      if (blockError && blockError.code !== 'PGRST116') {
        console.error('Block check error:', blockError);
      }

      if (blockCheck) {
        // Return immediately without inserting into database
        return {
          success: false,
          error: 'You have been blocked by this user',
          isBlocked: true
        };
      }

      // Step 1: Insert into database (only if not blocked)
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
          message_type: messageType,
          status: 'sent',
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        return { success: false, error: 'Failed to send message' };
      }

      // Step 2: Broadcast to receiver's channel
      const receiverChannel = supabase.channel(`user:${receiverId}:messages`);
      await receiverChannel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: data,
      });

      // Step 3: Update message status to delivered (if receiver is online)
      // This will be handled by receiver's acknowledgment

      return { success: true, message: data as Message };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Subscribe to new messages
   */
  onNewMessage(callback: (message: Message) => void) {
    if (!this.channel) {
      console.warn('Message channel not initialized');
      return () => {};
    }

    this.channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
      callback(payload as Message);

      // Auto-update message status to delivered
      if (payload.id) {
        this.markAsDelivered(payload.id);
      }
    });

    return () => {
      // Cleanup handled by disconnect()
    };
  }

  /**
   * Load conversation history with a specific user
   */
  async loadConversation(userId: string, otherUserId: string, limit = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
        )
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Load conversation error:', error);
        return [];
      }

      return (data as Message[]) || [];
    } catch (error) {
      console.error('Load conversation error:', error);
      return [];
    }
  }

  /**
   * Mark message as delivered
   */
  async markAsDelivered(messageId: string) {
    try {
      await supabase
        .from('messages')
        .update({ status: 'delivered' })
        .eq('id', messageId)
        .eq('status', 'sent');
    } catch (error) {
      console.error('Mark as delivered error:', error);
    }
  }

  /**
   * Disconnect from messaging
   */
  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.unsubscribe();
        this.channel = null;
      }
      this.currentUserId = null;
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  /**
   * Get message count for rate limiting
   */
  async getMessageCount(userId: string, windowMinutes = 1): Promise<number> {
    try {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .gte('created_at', windowStart.toISOString());

      if (error) {
        console.error('Get message count error:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Get message count error:', error);
      return 0;
    }
  }

  /**
   * Check if user has reached rate limit (25 messages per minute)
   */
  async checkRateLimit(userId: string): Promise<{ allowed: boolean; count: number; limit: number }> {
    const count = await this.getMessageCount(userId, 1);
    const limit = 25;

    return {
      allowed: count < limit,
      count,
      limit,
    };
  }
}

// Export singleton instance
export const messageService = new MessageService();
