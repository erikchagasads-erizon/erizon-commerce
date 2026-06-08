import "server-only";

import crypto from "node:crypto";

import { env } from "@/lib/env";

const stateSeparator = ".";

function signingKey() {
  return env.APP_ENCRYPTION_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function createConnectionState(workspaceId: string, userId: string, provider: string) {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + 10 * 60 * 1000,
      nonce: crypto.randomBytes(12).toString("hex"),
      provider,
      userId,
      workspaceId,
    }),
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", signingKey()).update(payload).digest("base64url");

  return `${payload}${stateSeparator}${signature}`;
}

export function readConnectionState(state: string, provider: string) {
  const [payload, signature] = state.split(stateSeparator);

  if (!payload || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", signingKey()).update(payload).digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    exp: number;
    provider: string;
    userId: string;
    workspaceId: string;
  };

  if (parsed.exp < Date.now() || parsed.provider !== provider) {
    return null;
  }

  return parsed;
}

