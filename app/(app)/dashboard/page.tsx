import { DashboardView } from "@/components/modules/dashboard-view";
import { requireAppContext } from "@/lib/auth";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";

export default async function DashboardPage() {
  const context = await requireAppContext();
  const snapshot = await getWorkspaceSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <DashboardView
      context={context}
      metrics={[
        {
          icon: "products",
          label: "SKUs ativos",
          value: String(snapshot.counts.products),
          hint: "Catálogo mestre pronto para abastecer canais, estoque e pricing.",
        },
        {
          icon: "orders",
          label: "Pedidos registrados",
          value: String(snapshot.counts.orders),
          hint: "Fila omnichannel concentrada no mesmo workspace.",
        },
        {
          icon: "finance",
          label: "Lançamentos financeiros",
          value: String(snapshot.counts.finance),
          hint: "Base inicial para fluxo de caixa, margem e EBITDA.",
        },
        {
          icon: "suppliers",
          label: "Fornecedores mapeados",
          value: String(snapshot.counts.suppliers),
          hint: "Estrutura pronta para cotações, comparação e compra assistida.",
        },
      ]}
      recentInsights={snapshot.recentInsights}
      recentOrders={snapshot.recentOrders}
    />
  );
}
