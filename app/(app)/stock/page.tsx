import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function StockPage() {
  return <ModulePage module={moduleDefinitions.stock} />;
}

