import { createClient } from '@supabase/supabase-js'

// Use the anon key and the request's user token so database policies apply.
export function createRequestSupabase(accessToken?: string) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase is not configured')

  return createClient(url, key, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
