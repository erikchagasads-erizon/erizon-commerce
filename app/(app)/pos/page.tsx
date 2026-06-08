import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function PosPage() {
  return <ModulePage module={moduleDefinitions.pos} />;
}

