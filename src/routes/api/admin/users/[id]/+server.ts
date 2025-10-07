import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

// Delete user
export const DELETE: RequestHandler = async ({ params, platform, fetch }) => {
  try {
    const { id } = params;
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Delete user from auth.users (cascade will handle the rest)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return json({ success: false, error: authError.message }, { status: 500 });
    }

    return json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
