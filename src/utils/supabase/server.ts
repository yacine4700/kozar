import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase env variables are missing.');
  }

  return createServerClient(
    url || '',
    key || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // This happens in Server Components. It can be ignored
            // as we use Middleware for session refresh.
            // But if it happens in a Server Action, it's a real issue.
            if (process.env.NODE_ENV === 'development') {
              console.error('Cookie setting error in Server Context:', error);
            }
          }
        },
      },
    }
  );
}
