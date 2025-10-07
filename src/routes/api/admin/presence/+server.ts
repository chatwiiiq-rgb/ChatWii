import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const GET: RequestHandler = async ({ platform, fetch }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Subscribe to the same presence channel that the chat uses
    const channel = supabase.channel('online-users');

    // Get the presence state
    const presenceState = await new Promise<any>((resolve) => {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          resolve(state);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Initial state after subscription
            const state = channel.presenceState();
            resolve(state);
          }
        });

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({});
      }, 5000);
    });

    // Cleanup
    await channel.unsubscribe();

    // Count online users from presence state
    const onlineUserIds = Object.keys(presenceState);
    const onlineCount = onlineUserIds.length;

    return json({
      success: true,
      online_count: onlineCount,
      online_user_ids: onlineUserIds
    });
  } catch (error) {
    console.error('Presence check error:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
