import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const GET: RequestHandler = async ({ request, platform, fetch, cookies }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;

    // Create admin client
    const supabase = createSupabaseAdminClient(fetch, env);

    // Get all feedback, ordered by created_at descending
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching feedback:', error);
      return json({ success: false, error: 'Failed to fetch feedback', feedbacks: [] }, { status: 500 });
    }

    return json({ success: true, feedbacks: feedbacks || [] });
  } catch (err) {
    console.error('Admin feedback fetch error:', err);
    return json({ success: false, error: 'Internal server error', feedbacks: [] }, { status: 500 });
  }
};
