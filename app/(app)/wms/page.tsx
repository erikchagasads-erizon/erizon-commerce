import { ModulePage } from "@/components/modules/module-page";
import { moduleDefinitions } from "@/lib/modules";

export default function WmsPage() {
  return <ModulePage module={moduleDefinitions.wms} />;
}

