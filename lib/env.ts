export const env = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "preview.erizon.local",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? "",
  GROQ_MODEL: process.env.GROQ_MODEL ?? "",
  APP_ENCRYPTION_KEY: process.env.APP_ENCRYPTION_KEY ?? "",
  MERCADO_LIVRE_CLIENT_ID: process.env.MERCADO_LIVRE_CLIENT_ID ?? "",
  MERCADO_LIVRE_CLIENT_SECRET: process.env.MERCADO_LIVRE_CLIENT_SECRET ?? "",
  MERCADO_LIVRE_REDIRECT_URI: process.env.MERCADO_LIVRE_REDIRECT_URI ?? "",
  SHOPEE_PARTNER_ID: process.env.SHOPEE_PARTNER_ID ?? "",
  SHOPEE_PARTNER_KEY: process.env.SHOPEE_PARTNER_KEY ?? "",
  SHOPEE_REDIRECT_URI: process.env.SHOPEE_REDIRECT_URI ?? "",
};

export const hasSupabaseEnv =
  env.NEXT_PUBLIC_SUPABASE_URL.length > 0 && env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

export const missingSupabaseEnv = [
  !env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
  !env.NEXT_PUBLIC_SUPABASE_ANON_KEY && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
].filter(Boolean) as string[];

export const hasGroqEnv = env.GROQ_API_KEY.length > 0 && env.GROQ_MODEL.length > 0;
export const hasServiceRoleEnv = env.SUPABASE_SERVICE_ROLE_KEY.length > 0;
export const hasEncryptionKey = env.APP_ENCRYPTION_KEY.length >= 32;
export const hasMercadoLivreEnv =
  env.MERCADO_LIVRE_CLIENT_ID.length > 0 &&
  env.MERCADO_LIVRE_CLIENT_SECRET.length > 0 &&
  env.MERCADO_LIVRE_REDIRECT_URI.length > 0;
export const hasShopeeEnv =
  env.SHOPEE_PARTNER_ID.length > 0 && env.SHOPEE_PARTNER_KEY.length > 0 && env.SHOPEE_REDIRECT_URI.length > 0;

export const missingGroqEnv = [
  !env.GROQ_API_KEY && "GROQ_API_KEY",
  !env.GROQ_MODEL && "GROQ_MODEL",
].filter(Boolean) as string[];

export const missingProductionEnv = [
  !env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  !hasEncryptionKey && "APP_ENCRYPTION_KEY",
].filter(Boolean) as string[];

export const missingMercadoLivreEnv = [
  !env.MERCADO_LIVRE_CLIENT_ID && "MERCADO_LIVRE_CLIENT_ID",
  !env.MERCADO_LIVRE_CLIENT_SECRET && "MERCADO_LIVRE_CLIENT_SECRET",
  !env.MERCADO_LIVRE_REDIRECT_URI && "MERCADO_LIVRE_REDIRECT_URI",
].filter(Boolean) as string[];

export const missingShopeeEnv = [
  !env.SHOPEE_PARTNER_ID && "SHOPEE_PARTNER_ID",
  !env.SHOPEE_PARTNER_KEY && "SHOPEE_PARTNER_KEY",
  !env.SHOPEE_REDIRECT_URI && "SHOPEE_REDIRECT_URI",
].filter(Boolean) as string[];
