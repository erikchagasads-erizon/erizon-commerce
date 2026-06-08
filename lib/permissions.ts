import { redirect } from "next/navigation";

import type { AppContext } from "@/lib/auth";

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "manager"
  | "analyst"
  | "operator"
  | "finance"
  | "support"
  | "viewer";

export const roleLabels: Record<WorkspaceRole, string> = {
  admin: "Admin",
  analyst: "Analyst",
  finance: "Finance",
  manager: "Manager",
  operator: "Operator",
  owner: "Owner",
  support: "Support",
  viewer: "Viewer",
};

export const roleDescriptions: Record<WorkspaceRole, string> = {
  admin: "Gerencia a operação e a empresa.",
  analyst: "Analisa dados, IA e operação com contexto ampliado.",
  finance: "Acessa billing, pagamentos e financeiro.",
  manager: "Gerencia módulos e times operacionais.",
  operator: "Opera pedidos, estoque, logística e PDV.",
  owner: "Controle total da empresa e da assinatura.",
  support: "Acesso limitado para suporte e atendimento.",
  viewer: "Somente leitura.",
};

export function requireWorkspaceRoles(context: AppContext, allowedRoles: WorkspaceRole[]) {
  const currentRole = context.workspace?.role;

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    redirect("/settings?denied=1");
  }
}

export function getRoleCapabilities(role: WorkspaceRole | null | undefined) {
  const current = role ?? "viewer";

  return {
    canManageBilling: ["owner", "admin", "finance"].includes(current),
    canManageBranding: ["owner", "admin"].includes(current),
    canManageTeam: ["owner", "admin", "manager"].includes(current),
    canUseAdvancedAI: ["owner", "admin", "manager", "analyst", "finance"].includes(current),
    canViewFinance: ["owner", "admin", "manager", "finance", "analyst"].includes(current),
  };
}
