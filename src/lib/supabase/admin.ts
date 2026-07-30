import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Utilise la clé service_role : contourne la Row Level Security. Côté serveur
// uniquement — ne jamais importer ce fichier depuis un Client Component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
