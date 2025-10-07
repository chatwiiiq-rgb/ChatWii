import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

export const GET: RequestHandler = async ({ platform, fetch, url }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    const timeRange = url.searchParams.get('range') || '30'; // days
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get total counts
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    const { count: totalFeedback } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true });

    const { count: bannedUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'banned');

    // Get user registrations over time
    const { data: userRegistrations } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get messages over time
    const { data: messagesOverTime } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get demographics - country distribution
    const { data: countryData } = await supabase
      .from('users')
      .select('country');

    const countryDistribution: Record<string, number> = {};
    countryData?.forEach(user => {
      countryDistribution[user.country] = (countryDistribution[user.country] || 0) + 1;
    });

    // Get demographics - gender distribution
    const { data: genderData } = await supabase
      .from('users')
      .select('gender');

    const genderDistribution: Record<string, number> = {};
    genderData?.forEach(user => {
      genderDistribution[user.gender] = (genderDistribution[user.gender] || 0) + 1;
    });

    // Get demographics - age distribution
    const { data: ageData } = await supabase
      .from('users')
      .select('age');

    const ageDistribution = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };

    ageData?.forEach(user => {
      if (user.age >= 18 && user.age <= 24) ageDistribution['18-24']++;
      else if (user.age >= 25 && user.age <= 34) ageDistribution['25-34']++;
      else if (user.age >= 35 && user.age <= 44) ageDistribution['35-44']++;
      else if (user.age >= 45 && user.age <= 54) ageDistribution['45-54']++;
      else if (user.age >= 55) ageDistribution['55+']++;
    });

    // Get report statistics by reason
    const { data: reportData } = await supabase
      .from('reports')
      .select('reason, status');

    const reportsByReason: Record<string, number> = {};
    const reportsByStatus: Record<string, number> = {};

    reportData?.forEach(report => {
      reportsByReason[report.reason] = (reportsByReason[report.reason] || 0) + 1;
      reportsByStatus[report.status] = (reportsByStatus[report.status] || 0) + 1;
    });

    // Process time-series data for charts
    const registrationsByDate: Record<string, number> = {};
    userRegistrations?.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
    });

    const messagesByDate: Record<string, number> = {};
    messagesOverTime?.forEach(msg => {
      const date = new Date(msg.created_at).toISOString().split('T')[0];
      messagesByDate[date] = (messagesByDate[date] || 0) + 1;
    });

    // Get recent growth (last 7 days vs previous 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const previous7Days = new Date();
    previous7Days.setDate(previous7Days.getDate() - 14);

    const { count: usersLast7Days } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days.toISOString());

    const { count: usersPrevious7Days } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previous7Days.toISOString())
      .lt('created_at', last7Days.toISOString());

    const { count: messagesLast7Days } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days.toISOString());

    const { count: messagesPrevious7Days } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previous7Days.toISOString())
      .lt('created_at', last7Days.toISOString());

    return json({
      success: true,
      analytics: {
        overview: {
          totalUsers: totalUsers || 0,
          totalMessages: totalMessages || 0,
          totalReports: totalReports || 0,
          totalFeedback: totalFeedback || 0,
          bannedUsers: bannedUsers || 0,
          usersLast7Days: usersLast7Days || 0,
          usersPrevious7Days: usersPrevious7Days || 0,
          messagesLast7Days: messagesLast7Days || 0,
          messagesPrevious7Days: messagesPrevious7Days || 0
        },
        timeSeries: {
          registrationsByDate,
          messagesByDate
        },
        demographics: {
          countryDistribution,
          genderDistribution,
          ageDistribution
        },
        reports: {
          byReason: reportsByReason,
          byStatus: reportsByStatus
        }
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
