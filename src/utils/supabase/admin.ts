import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables.')
  }

  if (!serviceRoleKey) {
    throw new Error('CRITICAL ENV ERROR: SUPABASE_SERVICE_ROLE_KEY is missing. Administrative operations cannot continue without this key.')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}
