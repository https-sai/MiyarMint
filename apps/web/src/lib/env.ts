const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

export function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy apps/web/.env.example to .env.local.",
    )
  }
  return { supabaseUrl, supabaseAnonKey }
}

export function getApiUrl() {
  return apiUrl.replace(/\/$/, "")
}
