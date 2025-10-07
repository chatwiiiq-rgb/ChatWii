import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const GET: RequestHandler = async ({ platform, fetch }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;

    // Create admin client
    const supabase = createSupabaseAdminClient(fetch, env);

    // First, fetch all reports
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return json({ success: false, error: reportsError.message }, { status: 500 });
    }

    if (!reports || reports.length === 0) {
      return json({ success: true, reports: [] });
    }

    // Get all unique user IDs
    const userIds = [...new Set([
      ...reports.map(r => r.reporter_id),
      ...reports.map(r => r.reported_id)
    ])].filter(Boolean);

    // Fetch user details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nickname, gender, age, country, status, banned_at, ban_reason')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return json({ success: false, error: usersError.message }, { status: 500 });
    }

    // Create user lookup map
    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    // Combine reports with user data
    const reportsWithUsers = reports.map(report => ({
      ...report,
      reporter: userMap.get(report.reporter_id) || null,
      reported: userMap.get(report.reported_id) || null
    }));

    return json({ success: true, reports: reportsWithUsers });
  } catch (err) {
    console.error('Admin reports error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
