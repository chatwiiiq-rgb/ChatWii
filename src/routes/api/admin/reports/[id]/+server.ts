import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

// Update report status (mark as reviewed/resolved)
export const PATCH: RequestHandler = async ({ params, request, platform, fetch }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, admin_notes } = body;

    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Update report
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating report:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Update report error:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};

// Delete report
export const DELETE: RequestHandler = async ({ params, platform, fetch }) => {
  try {
    const { id } = params;
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting report:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Delete report error:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
