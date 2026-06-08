import { buildFallbackReply } from "@/lib/ai";
import { requireAppContext } from "@/lib/auth";
import { ExecutiveCenterView } from "@/components/ai/executive-center-view";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";

export default async function ExecutiveCenterPage() {
  const context = await requireAppContext();
  const snapshot = await getWorkspaceSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <ExecutiveCenterView
      context={context}
      initialReply={buildFallbackReply({
        contextSnapshot: {
          financeCount: snapshot.counts.finance,
          insightCount: snapshot.counts.insights,
          memoryCount: snapshot.counts.memories,
          orderCount: snapshot.counts.orders,
          productCount: snapshot.counts.products,
          supplierCount: snapshot.counts.suppliers,
        },
        message: "O que aconteceu hoje no meu negócio?",
        routeContext: "/executive-center",
        scope: "executive",
        workspaceName: context.workspace?.name,
      })}
      snapshot={snapshot}
    />
  );
}

