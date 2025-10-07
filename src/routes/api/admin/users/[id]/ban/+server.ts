import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

// Ban a user
export const POST: RequestHandler = async ({ params, request, platform, fetch }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return json({ success: false, error: 'Ban reason is required' }, { status: 400 });
    }

    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Update user status to banned
    const { error } = await supabase
      .from('users')
      .update({
        status: 'banned',
        banned_at: new Date().toISOString(),
        ban_reason: reason
      })
      .eq('id', id);

    if (error) {
      console.error('Error banning user:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true, message: 'User banned successfully' });
  } catch (err) {
    console.error('Ban user error:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
