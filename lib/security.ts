import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { env, hasEncryptionKey } from "@/lib/env";

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export class RateLimitError extends Error {
  constructor(message = "Muitas requisições em sequência. Aguarde um instante e tente novamente.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function getAesKey() {
  return createHash("sha256").update(env.APP_ENCRYPTION_KEY || "erizon-dev-encryption-key").digest();
}

export function sanitizeUserInput(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsPromptInjectionRisk(value: string) {
  const normalized = value.toLowerCase();

  return [
    "ignore previous instructions",
    "ignore all previous instructions",
    "system prompt",
    "developer instructions",
    "reveal hidden",
    "bypass safety",
    "tool call",
  ].some((pattern) => normalized.includes(pattern));
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = requestBuckets.get(key);

  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (current.count >= limit) {
    throw new RateLimitError();
  }

  current.count += 1;
  requestBuckets.set(key, current);
}

export function encryptSecret(plainText: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getAesKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(cipherText: string) {
  const [ivBase64, authTagBase64, encryptedBase64] = cipherText.split(".");

  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    throw new Error("Ciphertext inválido.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getAesKey(),
    Buffer.from(ivBase64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(authTagBase64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function generateApiKey() {
  const prefix = randomBytes(4).toString("hex");
  const secret = randomBytes(24).toString("hex");

  return {
    displayPrefix: prefix,
    fullKey: `erz_${prefix}_${secret}`,
    hash: hashApiKey(secret),
  };
}

export function assertProductionSecretsConfigured() {
  return {
    encryptionReady: hasEncryptionKey,
  };
}

