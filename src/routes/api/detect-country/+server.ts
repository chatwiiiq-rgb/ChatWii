import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
  // Try to get country from Cloudflare headers
  const cfCountry = request.headers.get('cf-ipcountry');

  if (cfCountry && cfCountry !== 'XX') {
    return json({
      country: cfCountry.toLowerCase(),
      source: 'cloudflare'
    });
  }

  // Return null if not available, client will use IPAPI fallback
  return json({
    country: null,
    source: 'none'
  });
};
