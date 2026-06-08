import { AgentWorkbench } from "@/components/ai/agent-workbench";
import { agentDefinitions } from "@/lib/ai";
import { requireAppContext } from "@/lib/auth";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";

export function generateStaticParams() {
  return agentDefinitions.map((agent) => ({
    slug: agent.slug,
  }));
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, context] = await Promise.all([params, requireAppContext()]);
  const snapshot = await getWorkspaceSnapshot(context.workspace?.workspaceId ?? null);

  return <AgentWorkbench context={context} slug={slug} snapshot={snapshot} />;
}

