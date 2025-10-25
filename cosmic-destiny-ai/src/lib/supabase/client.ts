import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

/**
 * Creates a Supabase client for use in browser environments (Client Components).
 * 
 * This client is specifically designed to work with Next.js SSR and Server Components
 * by managing session information in cookies, which are accessible on both the
 * client and the server.
 */

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  console.log('%c[Supabase Client] Creating a new singleton instance.', 'color: orange; font-weight: bold;');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables in the browser')
  }

  supabaseClient = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
  return supabaseClient
}