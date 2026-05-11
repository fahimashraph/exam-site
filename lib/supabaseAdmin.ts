import { createClient, SupabaseClient } from "@supabase/supabase-js"

// Server-only client. Uses the service role key which bypasses all RLS.
// Never import this file in client components ("use client").
// Initialized lazily so the build succeeds without the env var set.
let _client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local from Supabase → Project Settings → API."
      )
    }
    _client = createClient(url, key)
  }
  return _client
}
