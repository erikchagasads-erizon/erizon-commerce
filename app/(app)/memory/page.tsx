import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function MemoryPage() {
  return <ModulePage module={moduleDefinitions.memory} />;
}

