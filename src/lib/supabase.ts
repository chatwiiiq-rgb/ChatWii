import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Database } from './types/database.types';

export const supabase = createBrowserClient<Database>(
  env.PUBLIC_SUPABASE_URL!,
  env.PUBLIC_SUPABASE_ANON_KEY!
);

export function createSupabaseServerClient(fetch: typeof globalThis.fetch) {
  return createServerClient<Database>(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_ANON_KEY!, {
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
