import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env, hasServiceRoleEnv, hasSupabaseEnv } from "@/lib/env";

type Json = boolean | number | string | null | { [key: string]: Json | undefined } | Json[];
type LooseTable = {
  Insert: Record<string, Json | undefined>;
  Relationships: [];
  Row: Record<string, Json>;
  Update: Record<string, Json | undefined>;
};
type LooseDatabase = {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: Record<string, string>;
    Functions: Record<string, { Args: Record<string, Json | undefined>; Returns: Json }>;
    Tables: Record<string, LooseTable>;
    Views: Record<string, LooseTable>;
  };
};

export type ServiceSupabaseClient = SupabaseClient<LooseDatabase, "public">;

let serviceClient: ServiceSupabaseClient | null = null;

export function createServiceSupabaseClient(): ServiceSupabaseClient {
  if (!hasSupabaseEnv || !hasServiceRoleEnv) {
    throw new Error("Service role do Supabase não está configurado.");
  }

  if (!serviceClient) {
    serviceClient = createClient<LooseDatabase>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serviceClient;
}
