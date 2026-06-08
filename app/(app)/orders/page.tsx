import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function OrdersPage() {
  return <ModulePage module={moduleDefinitions.orders} />;
}

