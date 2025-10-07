import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase';

export const GET: RequestHandler = async ({ cookies, platform, fetch, request }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;

    // Create Supabase client - it will handle auth cookies automatically
    const supabase = createSupabaseServerClient(fetch, env);

    // Get the current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('Session check:', { hasSession: !!session, sessionError, userId: session?.user?.id });

    if (sessionError || !session?.user) {
      console.log('No valid session found');
      return json({ isAdmin: false, debug: { hasSession: false, error: sessionError?.message } });
    }

    const userId = session.user.id;

    // Check if user has admin role
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    console.log('User role check:', { userId, user, error });

    if (error || !user) {
      console.log('User not found or error:', error);
      return json({ isAdmin: false, debug: { userFound: false, error: error?.message } });
    }

    const isAdmin = user.role === 'admin';
    console.log('Is admin:', isAdmin);

    return json({ isAdmin, debug: { userId, role: user.role } });
  } catch (err) {
    console.error('Admin check error:', err);
    return json({ isAdmin: false, debug: { error: String(err) } });
  }
};
