import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';

const RATE_LIMIT_HOURS = 3;

export const POST: RequestHandler = async ({ request, getClientAddress, platform, fetch }) => {
  try {
    // Get env from Cloudflare platform or process.env fallback
    const env = (platform?.env as Record<string, string>) || process.env;

    // Create Supabase admin client for server-side (bypasses RLS)
    const supabase = createSupabaseAdminClient(fetch, env);

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
      console.error('Feedback insert error:', error);

      // Check if it's a rate limit violation from the trigger
      if (error.code === '23505' || error.message?.includes('rate_limit_exceeded')) {
        return json(
          {
            success: false,
            error: `Please wait ${RATE_LIMIT_HOURS} hours between feedback submissions`,
            rateLimited: true,
          },
          { status: 429 }
        );
      }

      return json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
    }

    return json({ success: true, data });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
};
