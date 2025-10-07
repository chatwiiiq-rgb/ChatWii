import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '$lib/supabase';
import { isFeatureEnabled } from '$lib/server/settings';

export const GET: RequestHandler = async ({ platform, getClientAddress, fetch }) => {
  try {
    // Get env from Cloudflare platform or process.env fallback
    const env = (platform?.env as Record<string, string>) || process.env;

    // Check if image sharing is enabled (fallback to true)
    const supabase = createSupabaseAdminClient(fetch, env);
    const imageEnabled = await isFeatureEnabled(supabase, 'image_sharing');

    if (!imageEnabled) {
      return json({ error: 'Image sharing is currently disabled' }, { status: 403 });
    }

    const privateKey = env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = env.PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey) {
      console.error('IMAGEKIT_PRIVATE_KEY not configured');
      console.error('Available env keys:', Object.keys(env));
      return json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate authentication parameters for ImageKit upload
    // Note: This endpoint is public since users are anonymous
    // Upload limits are enforced via daily photo tracking in the database
    const token = crypto.randomBytes(16).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return json({
      token,
      expire,
      signature,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return json({ error: 'Failed to generate authentication' }, { status: 500 });
  }
};
