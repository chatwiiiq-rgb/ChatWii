import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const DELETE: RequestHandler = async ({ params, platform, fetch }) => {
  try {
    const { id } = params;

    if (!id) {
      return json({ success: false, error: 'Feedback ID is required' }, { status: 400 });
    }

    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;

    // Create admin client
    const supabase = createSupabaseAdminClient(fetch, env);

    // Delete the feedback
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting feedback:', error);
      return json({ success: false, error: 'Failed to delete feedback' }, { status: 500 });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Admin feedback delete error:', err);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
