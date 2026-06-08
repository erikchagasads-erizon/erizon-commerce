import { z } from "zod";

import { allowedApiPermissions } from "@/lib/api-permissions";
import { sanitizeUserInput } from "@/lib/security";

export const emailSchema = z.string().email("Informe um email válido.").transform((value) => value.toLowerCase().trim());

export const workspaceRoleSchema = z.enum([
  "owner",
  "admin",
  "manager",
  "analyst",
  "operator",
  "finance",
  "support",
  "viewer",
]);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export const signUpSchema = z.object({
  email: emailSchema,
  fullName: z.string().min(3, "Informe o nome completo do responsável.").transform(sanitizeUserInput),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export const copilotRequestSchema = z.object({
  agentSlug: z
    .enum(["executive", "finance", "stock", "pricing", "catalog", "supply", "tax", "growth", "channel-performance"])
    .optional(),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        size: z.number().int().nonnegative().max(25_000_000).optional(),
        type: z.string().max(120).optional(),
      }),
    )
    .max(10)
    .optional(),
  contextSnapshot: z
    .object({
      financeCount: z.number().int().nonnegative().optional(),
      insightCount: z.number().int().nonnegative().optional(),
      memoryCount: z.number().int().nonnegative().optional(),
      orderCount: z.number().int().nonnegative().optional(),
      productCount: z.number().int().nonnegative().optional(),
      supplierCount: z.number().int().nonnegative().optional(),
    })
    .optional(),
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().min(2).max(4000).transform(sanitizeUserInput),
  routeContext: z.string().max(200).optional(),
  scope: z.enum(["executive", "copilot", "agent"]),
  workspaceName: z.string().max(120).nullable().optional(),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: workspaceRoleSchema,
});

export const whiteLabelSchema = z.object({
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Use uma cor hexadecimal no formato #RRGGBB."),
  brandName: z.string().min(2).max(120).transform(sanitizeUserInput),
  customDomain: z.string().max(160).transform(sanitizeUserInput),
  faviconUrl: z.string().url("Informe uma URL válida para o favicon.").or(z.literal("")),
  loginHeadline: z.string().max(160).transform(sanitizeUserInput),
  logoUrl: z.string().url("Informe uma URL válida para o logo.").or(z.literal("")),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Use uma cor hexadecimal no formato #RRGGBB."),
  subdomain: z
    .string()
    .max(60)
    .regex(/^[a-z0-9-]*$/, "Use apenas letras minúsculas, números e hífens no subdomínio."),
  supportEmail: emailSchema.or(z.literal("")),
});

export const apiKeyCreateSchema = z.object({
  label: z.string().min(3).max(80).transform(sanitizeUserInput),
  permissions: z.array(z.enum(allowedApiPermissions)).min(1).max(allowedApiPermissions.length),
});
