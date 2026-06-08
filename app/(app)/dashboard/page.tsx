import { DashboardView } from "@/components/modules/dashboard-view";
import { requireAppContext } from "@/lib/auth";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";

export default async function DashboardPage() {
  const context = await requireAppContext();
  const snapshot = await getWorkspaceSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <DashboardView
      metrics={[
        {
          icon: "products",
          label: "Produtos",
          value: String(snapshot.counts.products),
          hint: "Itens prontos para vender, controlar estoque e analisar margem.",
        },
        {
          icon: "orders",
          label: "Pedidos",
          value: String(snapshot.counts.orders),
          hint: "Vendas importadas dos canais conectados.",
        },
        {
          icon: "finance",
          label: "Movimento financeiro",
          value: String(snapshot.counts.finance),
          hint: "Base para acompanhar caixa, lucro e recebimentos.",
        },
        {
          icon: "suppliers",
          label: "Fornecedores",
          value: String(snapshot.counts.suppliers),
          hint: "Parceiros de compra para repor estoque com mais segurança.",
        },
      ]}
      recentInsights={snapshot.recentInsights}
      recentOrders={snapshot.recentOrders}
    />
  );
}
