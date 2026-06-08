import type { ReactNode } from "react";

import type { AppContext } from "@/lib/auth";
import { ErizonCopilot } from "@/components/copilot/erizon-copilot";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkspaceSnapshot } from "@/lib/workspace-data";

export function AppShell({
  children,
  context,
  snapshot,
}: {
  children: ReactNode;
  context: AppContext;
  snapshot: WorkspaceSnapshot;
}) {
  return (
    <div className="relative min-h-screen bg-[#0c0a09]">
      <Sidebar
        userLabel={context.profile?.email ?? "Sem sessão autenticada"}
        workspaceName={context.workspace?.name ?? "Preview do produto"}
      />

      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        <Topbar context={context} />
        <main className="flex-1 px-6 py-6 lg:px-8">
          {!context.isSupabaseConfigured ? (
            <Card className="mb-6 border-amber-500/15 bg-amber-500/5">
              <CardContent className="p-4 text-sm leading-6 text-amber-300/80">
                O shell da plataforma está funcional, mas a autenticação e os dados reais dependem da configuração do
                Supabase no ambiente.
              </CardContent>
            </Card>
          ) : null}

          {context.isSupabaseConfigured && context.session && !context.workspace ? (
            <Card className="mb-6 border-amber-500/15 bg-amber-500/5">
              <CardContent className="p-4 text-sm leading-6 text-amber-300/80">
                Sessão criada, mas nenhum workspace foi encontrado. A função de fallback tentará provisionar um
                automaticamente após a migração ser aplicada.
              </CardContent>
            </Card>
          ) : null}

          {children}
        </main>
      </div>

      <ErizonCopilot
        contextSnapshot={{
          financeCount: snapshot.counts.finance,
          insightCount: snapshot.counts.insights,
          memoryCount: snapshot.counts.memories,
          orderCount: snapshot.counts.orders,
          productCount: snapshot.counts.products,
          supplierCount: snapshot.counts.suppliers,
        }}
        workspaceName={context.workspace?.name}
      />
    </div>
  );
}
