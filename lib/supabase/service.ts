import { createClient } from "@supabase/supabase-js";

import { env, hasServiceRoleEnv, hasSupabaseEnv } from "@/lib/env";

let serviceClient: ReturnType<typeof createClient> | null = null;

export function createServiceSupabaseClient() {
  if (!hasSupabaseEnv || !hasServiceRoleEnv) {
    throw new Error("Service role do Supabase não está configurado.");
  }

  if (!serviceClient) {
    serviceClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serviceClient;
}

