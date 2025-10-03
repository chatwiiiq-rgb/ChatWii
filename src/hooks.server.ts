import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get env from Cloudflare platform or process.env fallback
  const env = (event.platform?.env as Record<string, string>) || process.env;

  // Log for debugging
  console.log('Hook running, env keys:', Object.keys(env));
  console.log('Has SUPABASE_URL:', !!env.PUBLIC_SUPABASE_URL);

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
