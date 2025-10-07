import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';
import { getRateLimit } from '$lib/server/settings';

export const POST: RequestHandler = async ({ request, platform, fetch }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    const { user_id } = await request.json();

    if (!user_id) {
      return json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Get dynamic daily limit from settings (fallback to 15)
    const dailyLimit = await getRateLimit(supabase, 'images_per_day');

    // Get user's upload count for today
    const { data: count, error } = await supabase.rpc('get_daily_photo_count', {
      p_user_id: user_id,
    });

    if (error) {
      console.error('Check daily limit error:', error);
      return json(
        {
          success: false,
          error: 'Failed to check upload limit',
          allowed: false,
          count: 0,
          limit: dailyLimit,
        },
        { status: 500 }
      );
    }

    const uploadCount = (count as number) || 0;

    return json({
      success: true,
      allowed: uploadCount < dailyLimit,
      count: uploadCount,
      limit: dailyLimit,
    });
  } catch (err) {
    console.error('Check image limit error:', err);
    return json(
      {
        success: false,
        error: String(err),
        allowed: false,
        count: 0,
        limit: 15, // Fallback
      },
      { status: 500 }
    );
  }
};
