import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function SuppliersPage() {
  return <ModulePage module={moduleDefinitions.suppliers} />;
}

