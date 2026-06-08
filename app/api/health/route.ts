import { NextResponse } from "next/server";

import {
  hasEncryptionKey,
  hasGroqEnv,
  hasServiceRoleEnv,
  hasSupabaseEnv,
  missingGroqEnv,
  missingProductionEnv,
  missingSupabaseEnv,
} from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    app: "Erizon",
    ready: hasSupabaseEnv,
    aiReady: hasGroqEnv,
    encryptionReady: hasEncryptionKey,
    serviceRoleReady: hasServiceRoleEnv,
    missingAiEnv: missingGroqEnv,
    missingEnv: missingSupabaseEnv,
    missingProductionEnv,
    timestamp: new Date().toISOString(),
  });
}
