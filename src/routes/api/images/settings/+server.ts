import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';
import { getRateLimit } from '$lib/server/settings';

export const GET: RequestHandler = async ({ platform, fetch }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Get dynamic image settings (with fallbacks)
    const maxSizeMB = await getRateLimit(supabase, 'image_upload_size_mb');

    return json({
      success: true,
      maxSizeMB,
    });
  } catch (err) {
    console.error('Get image settings error:', err);
    return json(
      {
        success: false,
        maxSizeMB: 5, // Fallback
      },
      { status: 500 }
    );
  }
};
