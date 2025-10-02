// TypeScript types for Supabase Database
// Auto-generated types matching the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nickname: string
          role: 'standard'
          gender: 'male' | 'female'
          age: number
          country: string
          avatar_url: string | null
          status: 'active' | 'banned' | 'kicked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname: string
          role?: 'standard'
          gender: 'male' | 'female'
          age: number
          country: string
          avatar_url?: string | null
          status?: 'active' | 'banned' | 'kicked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          role?: 'standard'
          gender?: 'male' | 'female'
          age?: number
          country?: string
          avatar_url?: string | null
          status?: 'active' | 'banned' | 'kicked'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string | null
          receiver_id: string | null
          content: string
          message_type: 'text' | 'image'
          metadata: Json
          status: 'sending' | 'sent' | 'delivered' | 'failed'
          read: boolean
          created_at: string
          updated_at: string
          deleted: boolean
        }
        Insert: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          content: string
          message_type?: 'text' | 'image'
          metadata?: Json
          status?: 'sending' | 'sent' | 'delivered' | 'failed'
          read?: boolean
          created_at?: string
          updated_at?: string
          deleted?: boolean
        }
        Update: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          content?: string
          message_type?: 'text' | 'image'
          metadata?: Json
          status?: 'sending' | 'sent' | 'delivered' | 'failed'
          read?: boolean
          created_at?: string
          updated_at?: string
          deleted?: boolean
        }
      }
      user_presence: {
        Row: {
          user_id: string
          nickname: string
          last_seen: string
          created_at: string
        }
        Insert: {
          user_id: string
          nickname: string
          last_seen?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          nickname?: string
          last_seen?: string
          created_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: string
          details: string | null
          status: 'pending' | 'reviewed' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: string
          details?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          reason?: string
          details?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
      }
      photo_tracking: {
        Row: {
          id: string
          user_id: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          created_at?: string
        }
      }
      message_rate_limit: {
        Row: {
          id: string
          user_id: string
          message_count: number
          window_start: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_count?: number
          window_start?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_count?: number
          window_start?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_messages: {
        Args: Record<string, never>
        Returns: void
      }
      cleanup_stale_presence: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
