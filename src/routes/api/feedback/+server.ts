import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase';

const RATE_LIMIT_HOURS = 3;

export const POST: RequestHandler = async ({ request, getClientAddress, platform, fetch }) => {
  try {
    // Get env from Cloudflare platform or process.env fallback
    const env = (platform?.env as Record<string, string>) || process.env;

    // Create Supabase client for server-side
    const supabase = createSupabaseServerClient(fetch, env);

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

    // Get client IP and user agent for rate limiting
    const ipAddress = getClientAddress();
    const userAgent = request.headers.get('user-agent') || '';

    // Check rate limit - has this IP submitted in last N hours?
    const rateLimitTime = new Date();
    rateLimitTime.setHours(rateLimitTime.getHours() - RATE_LIMIT_HOURS);

    const { data: recentFeedback, error: checkError } = await supabase
      .from('feedback')
      .select('id')
      .eq('ip_address', ipAddress)
      .gte('created_at', rateLimitTime.toISOString())
      .limit(1);

    if (checkError) {
      console.error('Rate limit check error:', checkError);
      return json({ success: false, error: 'Failed to check rate limit' }, { status: 500 });
    }

    if (recentFeedback && recentFeedback.length > 0) {
      return json(
        {
          success: false,
          error: `Please wait ${RATE_LIMIT_HOURS} hours between feedback submissions`,
          rateLimited: true,
        },
        { status: 429 }
      );
    }

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
      console.error('Feedback insert error:', error);
      return json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
    }

    return json({ success: true, data });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
};
