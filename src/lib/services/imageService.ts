import { supabase } from '$lib/supabase';
import ImageKit from 'imagekit-javascript';

export interface PhotoUploadResult {
  success: boolean;
  imageUrl?: string;
  fileId?: string;
  error?: string;
}

export interface DailyLimitCheck {
  allowed: boolean;
  count: number;
  limit: number;
  error?: string;
}

/**
 * Image Service
 * Handles image uploads via ImageKit.io with daily limits
 * Users can upload max 15 images per 24 hours
 */
export class ImageService {
  private imagekit: ImageKit | null = null;
  private readonly DAILY_LIMIT = 15;

  constructor() {
    // Initialize ImageKit client
    // Note: Public key is safe to expose in frontend
    // Try window.ENV first (injected by hooks.server.ts), then fall back to import.meta.env
    const publicKey = (typeof window !== 'undefined' && window.ENV?.PUBLIC_IMAGEKIT_PUBLIC_KEY) || import.meta.env.PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = (typeof window !== 'undefined' && window.ENV?.PUBLIC_IMAGEKIT_URL_ENDPOINT) || import.meta.env.PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (publicKey && urlEndpoint) {
      this.imagekit = new ImageKit({
        publicKey,
        urlEndpoint,
      });
    }
  }

  /**
   * Check if user can upload more images today
   */
  async checkDailyLimit(userId: string): Promise<DailyLimitCheck> {
    try {
      const { data, error } = await supabase.rpc('get_daily_photo_count', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Check daily limit error:', error);
        return {
          allowed: false,
          count: 0,
          limit: this.DAILY_LIMIT,
          error: 'Failed to check upload limit',
        };
      }

      const count = data as number;
      return {
        allowed: count < this.DAILY_LIMIT,
        count,
        limit: this.DAILY_LIMIT,
      };
    } catch (error) {
      console.error('Check daily limit error:', error);
      return {
        allowed: false,
        count: 0,
        limit: this.DAILY_LIMIT,
        error: 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get authentication parameters for ImageKit upload
   */
  async getAuthParams(): Promise<{ signature: string; expire: number; token: string } | null> {
    try {
      const response = await fetch('/api/imagekit-auth');
      if (!response.ok) {
        throw new Error('Failed to get authentication parameters');
      }
      return await response.json();
    } catch (error) {
      console.error('Get auth params error:', error);
      return null;
    }
  }

  /**
   * Upload an image to ImageKit
   */
  async uploadImage(
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<PhotoUploadResult> {
    try {
      // Check daily limit first
      const limitCheck = await this.checkDailyLimit(userId);
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: `Daily upload limit reached (${limitCheck.limit} images per day). Try again tomorrow.`,
        };
      }

      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'File must be an image' };
      }

      // Max file size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Image must be smaller than 5MB' };
      }

      if (!this.imagekit) {
        return { success: false, error: 'ImageKit is not configured' };
      }

      // Get auth parameters
      const authParams = await this.getAuthParams();
      if (!authParams) {
        return { success: false, error: 'Failed to authenticate upload' };
      }

      // Upload to ImageKit
      const uploadResult = await new Promise<any>((resolve, reject) => {
        this.imagekit!.upload(
          {
            file,
            fileName: `${userId}_${Date.now()}_${file.name}`,
            signature: authParams.signature,
            expire: authParams.expire,
            token: authParams.token,
            folder: '/chatwii',
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
          {
            onUploadProgress: (e: ProgressEvent) => {
              if (onProgress && e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                onProgress(progress);
              }
            },
          }
        );
      });

      // Track upload in database
      const { error: dbError } = await supabase.from('photo_tracking').insert({
        user_id: userId,
        image_url: uploadResult.url,
        imagekit_file_id: uploadResult.fileId,
      });

      if (dbError) {
        console.error('Track photo error:', dbError);
        // Continue anyway - upload succeeded
      }

      return {
        success: true,
        imageUrl: uploadResult.url,
        fileId: uploadResult.fileId,
      };
    } catch (error) {
      console.error('Upload image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      };
    }
  }

  /**
   * Get user's upload count for today
   */
  async getTodayUploadCount(userId: string): Promise<number> {
    const limitCheck = await this.checkDailyLimit(userId);
    return limitCheck.count;
  }
}

// Export singleton instance
export const imageService = new ImageService();
