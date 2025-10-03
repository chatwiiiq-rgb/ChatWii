import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { Database } from './types/database.types';

// Extend window to include ENV
declare global {
  interface Window {
    ENV?: {
      PUBLIC_SUPABASE_URL: string;
      PUBLIC_SUPABASE_ANON_KEY: string;
      PUBLIC_IMAGEKIT_PUBLIC_KEY: string;
      PUBLIC_IMAGEKIT_URL_ENDPOINT: string;
      PUBLIC_CAPTCHA_SITE_KEY: string;
    };
  }
}

let _supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabase() {
  if (!_supabase && typeof window !== 'undefined') {
    const env = window.ENV || {};
    _supabase = createBrowserClient<Database>(
      env.PUBLIC_SUPABASE_URL || '',
      env.PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }
  return _supabase!;
}

// For backwards compatibility
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(target, prop) {
    return getSupabase()[prop as keyof typeof target];
  }
});

export function createSupabaseServerClient(fetch: typeof globalThis.fetch, platformEnv?: Record<string, string>) {
  const env = platformEnv || process.env;
  const url = env.PUBLIC_SUPABASE_URL || '';
  const key = env.PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    console.error('Supabase env vars missing:', { url: !!url, key: !!key });
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet) {
        // Handle cookies in SvelteKit server-side
      },
    },
    global: {
      fetch,
    },
  });
}
