import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

// Unban a user
export const POST: RequestHandler = async ({ params, platform, fetch }) => {
  try {
    const { id } = params;

    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Update user status back to active
    const { error } = await supabase
      .from('users')
      .update({
        status: 'active',
        banned_at: null,
        banned_by: null,
        ban_reason: null
      })
      .eq('id', id);

    if (error) {
      console.error('Error unbanning user:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true, message: 'User unbanned successfully' });
  } catch (err) {
    console.error('Unban user error:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
