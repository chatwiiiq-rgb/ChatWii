import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';
import { getRateLimit, isFeatureEnabled } from '$lib/server/settings';

export const POST: RequestHandler = async ({ request, getClientAddress, platform, fetch }) => {
  try {
    // Get env from Cloudflare platform or process.env fallback
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;

    // Debug logging
    console.log('Feedback API - Environment check:', {
      hasPlatform: !!platform,
      hasEnv: !!env,
      hasSupabaseUrl: !!env.PUBLIC_SUPABASE_URL,
      hasServiceKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
      urlValue: env.PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      keyValue: env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
    });

    // Ensure we have the required env vars
    if (!env.PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({
        success: false,
        error: 'Server configuration error: Missing Supabase credentials',
        debug: {
          hasUrl: !!env.PUBLIC_SUPABASE_URL,
          hasKey: !!env.SUPABASE_SERVICE_ROLE_KEY
        }
      }, { status: 500 });
    }

    // Create Supabase admin client for server-side (bypasses RLS)
    const supabase = createSupabaseAdminClient(fetch, env);

    // Check if feedback is enabled (fallback to true)
    const feedbackEnabled = await isFeatureEnabled(supabase, 'feedback');

    if (!feedbackEnabled) {
      return json({ success: false, error: 'Feedback submissions are currently disabled' }, { status: 403 });
    }

    // Get dynamic feedback cooldown from settings (fallback to 3 hours)
    const rateLimitHours = await getRateLimit(supabase, 'feedback_cooldown_hours');

    const { email, message } = await request.json();

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 400) {
      return json({ success: false, error: 'Message must be 400 characters or less' }, { status: 400 });
    }

    // Validate email if provided
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return json({ success: false, error: 'Invalid email address' }, { status: 400 });
      }
    }

    // Get client IP and user agent
    const ipAddress = getClientAddress();
    const userAgent = request.headers.get('user-agent') || '';

    // Note: Rate limiting is enforced by database constraints
    // The database will reject duplicate submissions from same IP within time window

    // Insert feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        email: email?.trim() || null,
        message: message.trim(),
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Feedback insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      });

      // Check if it's a rate limit violation from the trigger
      if (error.code === '23505' || error.message?.includes('rate_limit_exceeded')) {
        return json(
          {
            success: false,
            error: `Please wait ${rateLimitHours} hours between feedback submissions`,
            rateLimited: true,
          },
          { status: 429 }
        );
      }

      return json({
        success: false,
        error: 'Failed to submit feedback',
        debug: { code: error.code, message: error.message }
      }, { status: 500 });
    }

    return json({ success: true, data });
  } catch (error) {
    console.error('Feedback submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return json({
      success: false,
      error: errorMessage,
      debug: error instanceof Error ? { stack: error.stack } : { raw: String(error) }
    }, { status: 500 });
  }
};
