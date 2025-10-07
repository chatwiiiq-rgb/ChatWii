import type { Handle } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/supabase';
import { isMaintenanceMode } from '$lib/server/settings';
import { error } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get env from Cloudflare platform or process.env fallback
  const env = (event.platform?.env as Record<string, string>) || process.env;

  // Check maintenance mode (skip for admin dashboard and API access)
  const isAdminPath = event.url.pathname.startsWith('/dashboard-x9k2p7') ||
                      event.url.pathname.startsWith('/api/admin') ||
                      event.url.pathname.startsWith('/api/');

  if (!isAdminPath) {
    try {
      const supabase = createSupabaseAdminClient(fetch, env);
      const maintenanceMode = await isMaintenanceMode(supabase);

      if (maintenanceMode) {
        // Return maintenance page
        return new Response(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChatWii - Maintenance</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
    }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    p { font-size: 1.2rem; opacity: 0.9; line-height: 1.6; }
    .icon { font-size: 5rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>Under Maintenance</h1>
    <p>ChatWii is currently undergoing maintenance. We'll be back soon!</p>
  </div>
</body>
</html>`,
          {
            status: 503,
            headers: { 'Content-Type': 'text/html', 'Retry-After': '3600' }
          }
        );
      }
    } catch (err) {
      // If settings check fails, continue normally (fallback behavior)
      console.error('Maintenance mode check failed:', err);
    }
  }

  // Inject Cloudflare Pages environment variables into the page
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Inject before </head>
      return html.replace(
        '</head>',
        `<script>
          window.ENV = {
            PUBLIC_SUPABASE_URL: '${env.PUBLIC_SUPABASE_URL || ''}',
            PUBLIC_SUPABASE_ANON_KEY: '${env.PUBLIC_SUPABASE_ANON_KEY || ''}',
            PUBLIC_IMAGEKIT_PUBLIC_KEY: '${env.PUBLIC_IMAGEKIT_PUBLIC_KEY || ''}',
            PUBLIC_IMAGEKIT_URL_ENDPOINT: '${env.PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}',
            PUBLIC_CAPTCHA_SITE_KEY: '${env.PUBLIC_CAPTCHA_SITE_KEY || ''}'
          };
        </script></head>`
      );
    }
  });

  return response;
};
