import { AgentsHub } from "@/components/ai/agents-hub";
import { requireAppContext } from "@/lib/auth";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";

export default async function AgentsPage() {
  const context = await requireAppContext();
  const snapshot = await getWorkspaceSnapshot(context.workspace?.workspaceId ?? null);

  return <AgentsHub context={context} snapshot={snapshot} />;
}

