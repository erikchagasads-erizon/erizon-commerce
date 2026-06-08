import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function FinancePage() {
  return <ModulePage module={moduleDefinitions.finance} />;
}

