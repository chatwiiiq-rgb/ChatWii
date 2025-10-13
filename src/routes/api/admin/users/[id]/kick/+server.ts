import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const POST: RequestHandler = async ({ params, request, platform, fetch }) => {
  try {
    const { id } = params;
    const { reason } = await request.json();

    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, nickname')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Send kick command via Realtime to the user's personal channel
    const channel = supabase.channel(`user:${id}`);

    // Subscribe to the channel first
    await new Promise((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          resolve(true);
        }
      });
    });

    // Send the broadcast
    await channel.send({
      type: 'broadcast',
      event: 'kick',
      payload: {
        reason: reason || 'No reason provided',
        timestamp: new Date().toISOString()
      }
    });

    // Wait a bit to ensure message is sent
    await new Promise(resolve => setTimeout(resolve, 500));

    // Unsubscribe after sending
    await channel.unsubscribe();

    return json({
      success: true,
      message: `Kick command sent to ${user.nickname}`
    });
  } catch (err) {
    console.error('Kick user error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
