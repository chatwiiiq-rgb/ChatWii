import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';
import { getSetting } from '$lib/server/settings';

export const GET: RequestHandler = async ({ platform, fetch }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Get announcement settings (with fallbacks)
    const enabled = await getSetting(supabase, 'announcement_enabled');
    const message = await getSetting(supabase, 'announcement_message');
    const type = await getSetting(supabase, 'announcement_type');

    return json({
      success: true,
      enabled,
      message,
      type,
    });
  } catch (err) {
    console.error('Announcement fetch error:', err);
    return json({ success: false, enabled: false }, { status: 500 });
  }
};
