import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function ProductsPage() {
  return <ModulePage module={moduleDefinitions.products} />;
}

