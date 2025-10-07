import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const POST: RequestHandler = async ({ request, platform, fetch }) => {
  try {
    const formData = await request.formData();
    const userId = formData.get('user_id') as string;

    if (!userId) {
      return json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Update user to offline
    await supabase
      .from('users')
      .update({
        is_online: false,
        last_seen: new Date().toISOString(),
      })
      .eq('id', userId);

    return json({ success: true });
  } catch (error) {
    console.error('Presence leave error:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
