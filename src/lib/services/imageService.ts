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
 * Daily limit is dynamic from server settings (fallback to 15)
 */
export class ImageService {
  private imagekit: ImageKit | null = null;

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
   * Check if user can upload more images today (uses dynamic server-side limit)
   */
  async checkDailyLimit(userId: string): Promise<DailyLimitCheck> {
    try {
      // Call server-side API that checks against dynamic settings
      const response = await fetch('/api/images/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (!data.success) {
        return {
          allowed: false,
          count: data.count || 0,
          limit: data.limit || 15,
          error: data.error || 'Failed to check upload limit',
        };
      }

      return {
        allowed: data.allowed,
        count: data.count,
        limit: data.limit,
      };
    } catch (error) {
      console.error('Check daily limit error:', error);
      return {
        allowed: false,
        count: 0,
        limit: 15, // Fallback
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

      // Get dynamic max file size from server
      let maxSizeMB = 5; // Fallback
      try {
        const settingsResponse = await fetch('/api/images/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          maxSizeMB = settingsData.maxSizeMB;
        }
      } catch (err) {
        console.warn('Failed to fetch image settings, using default:', err);
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        return { success: false, error: `Image must be smaller than ${maxSizeMB}MB` };
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

      // Debug log to see what ImageKit returns
      console.log('ImageKit upload result:', uploadResult);

      // Extract the correct URL from ImageKit response
      // ImageKit returns: { url, thumbnailUrl, fileId, name, filePath, etc. }
      const imageUrl = uploadResult.url || uploadResult.thumbnailUrl;

      if (!imageUrl) {
        console.error('ImageKit did not return a URL. Full result:', uploadResult);
        return {
          success: false,
          error: 'Image uploaded but no URL returned from ImageKit',
        };
      }

      console.log('Extracted image URL:', imageUrl);

      return {
        success: true,
        imageUrl: imageUrl,
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
