import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Verify user is authenticated
    const session = await locals.supabase.auth.getSession();
    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      console.error('ImageKit credentials not configured');
      return json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate authentication parameters for ImageKit upload
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
