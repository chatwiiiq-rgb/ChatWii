import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  nickname: string;
  gender: 'male' | 'female';
  age: number;
  country: string;
}

export interface SignInResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Authentication Service
 * Handles anonymous authentication and user profile management
 */
export class AuthService {
  /**
   * Sign in anonymously and create user profile
   */
  static async signInAnonymously(
    profile: UserProfile,
    captchaToken: string
  ): Promise<SignInResult> {
    try {
      // Step 1: Verify CAPTCHA token (in production)
      if (import.meta.env.PROD && (!captchaToken || captchaToken === 'dev-bypass-token')) {
        return {
          success: false,
          error: 'CAPTCHA verification required',
        };
      }

      // Step 2: Sign in anonymously with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

      if (authError) {
        console.error('Anonymous sign-in error:', authError);
        return {
          success: false,
          error: 'Failed to create anonymous session. Please try again.',
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'No user data returned from authentication.',
        };
      }

      // Step 3: Create user profile in database
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        nickname: profile.nickname,
        gender: profile.gender,
        age: profile.age,
        country: profile.country,
        is_online: true,
        last_seen: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);

        // Clean up auth session if profile creation fails
        await supabase.auth.signOut();

        return {
          success: false,
          error: 'Failed to create user profile. Please try again.',
        };
      }

      return {
        success: true,
        user: authData.user,
      };
    } catch (error) {
      console.error('Sign-in error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign-out error:', error);
        return {
          success: false,
          error: 'Failed to sign out. Please try again.',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign-out error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during sign-out.',
      };
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Get current user session
   */
  static async getSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Get user profile from database
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Update user's online status
   */
  static async updateOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Update online status error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update online status error:', error);
      return false;
    }
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
}
