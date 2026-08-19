import { createClient } from "@supabase/supabase-js"

import { getSupabaseConfig } from "@/lib/env"

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
