import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';
import { isFeatureEnabled, getRateLimit } from '$lib/server/settings';

export const POST: RequestHandler = async ({ request, platform, fetch, locals }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Check if reporting is enabled (fallback to true)
    const reportingEnabled = await isFeatureEnabled(supabase, 'reporting');
    if (!reportingEnabled) {
      return json({ success: false, error: 'Reporting is currently disabled' }, { status: 403 });
    }

    const { reporter_id, reported_id, reason, description } = await request.json();

    // Validate required fields
    if (!reporter_id || !reported_id || !reason) {
      return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is trying to report themselves
    if (reporter_id === reported_id) {
      return json({ success: false, error: 'You cannot report yourself' }, { status: 400 });
    }

    // Get dynamic max reports per day (fallback to 10)
    const maxReportsPerDay = await getRateLimit(supabase, 'max_reports_per_day');

    // Check daily report limit
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count: reportsToday, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('reporter_id', reporter_id)
      .gte('created_at', oneDayAgo.toISOString());

    if (countError) {
      console.error('Error checking report count:', countError);
    }

    if (reportsToday !== null && reportsToday >= maxReportsPerDay) {
      return json(
        {
          success: false,
          error: `You have reached the daily report limit (${maxReportsPerDay} reports per day)`,
        },
        { status: 429 }
      );
    }

    // Check if user already reported this person today (prevent spam)
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reporter_id)
      .eq('reported_id', reported_id)
      .gte('created_at', oneDayAgo.toISOString())
      .maybeSingle();

    if (existingReport) {
      return json(
        { success: false, error: 'You have already reported this user today' },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons = [
      'inappropriate_content',
      'spam',
      'harassment',
      'fake_profile',
      'underage',
      'other',
    ];

    if (!validReasons.includes(reason)) {
      return json({ success: false, error: 'Invalid report reason' }, { status: 400 });
    }

    // Insert report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id,
        reported_id,
        reason,
        details: description?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return json({ success: false, error: 'Failed to submit report' }, { status: 500 });
    }

    return json({ success: true, data });
  } catch (err) {
    console.error('Report submission error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
