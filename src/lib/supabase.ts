import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Database } from './types/database.types';

let _supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabase() {
  if (!_supabase && typeof window !== 'undefined') {
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

export function createSupabaseServerClient(fetch: typeof globalThis.fetch) {
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
