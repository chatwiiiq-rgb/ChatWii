import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const GET: RequestHandler = async ({ platform, fetch, url }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Get query parameters
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Get real-time presence state from Supabase Realtime
    const channel = supabase.channel('online-users');
    const presenceState = await new Promise<any>((resolve) => {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          resolve(state);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const state = channel.presenceState();
            resolve(state);
          }
        });

      // Timeout after 3 seconds
      setTimeout(() => {
        resolve({});
      }, 3000);
    });

    // Extract online user IDs from presence state
    const onlineUserIds = new Set(Object.keys(presenceState));

    // Cleanup channel
    await channel.unsubscribe();

    // Build query
    let query = supabase
      .from('users')
      .select('id, nickname, gender, age, country, status, role, last_seen, created_at, banned_at, ban_reason', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`nickname.ilike.%${search}%,country.ilike.%${search}%`);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    // Get message counts for each user
    const userIds = users?.map(u => u.id) || [];

    let messageCounts: Record<string, number> = {};

    if (userIds.length > 0) {
      // Get message counts
      const { data: messages } = await supabase
        .from('messages')
        .select('sender_id')
        .in('sender_id', userIds);

      // Count messages per user
      messages?.forEach(m => {
        messageCounts[m.sender_id] = (messageCounts[m.sender_id] || 0) + 1;
      });
    }

    // Add message counts and real-time online status to users
    const usersWithStats = users?.map(user => ({
      ...user,
      is_online: onlineUserIds.has(user.id),
      message_count: messageCounts[user.id] || 0
    }));

    return json({ success: true, users: usersWithStats, total: count });
  } catch (err) {
    console.error('Admin users error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
