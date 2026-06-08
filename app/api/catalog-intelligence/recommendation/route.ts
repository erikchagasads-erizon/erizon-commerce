import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { answerCatalogQuestion, getLatestCatalogAnalyses } from "@/lib/catalog-intelligence";

export async function POST(request: Request) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para conversar com o agente." }, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const question = String(payload.question ?? "");
  let analysisId = String(payload.analysisId ?? "");

  if (!question) {
    return NextResponse.json({ error: "Envie uma pergunta para o agente." }, { status: 400 });
  }

  if (!analysisId) {
    const latest = (await getLatestCatalogAnalyses(context.workspace.workspaceId))[0];
    analysisId = latest?.id ?? "";
  }

  if (!analysisId) {
    return NextResponse.json({ error: "Rode uma analise antes de perguntar ao agente." }, { status: 404 });
  }

  const response = await answerCatalogQuestion({
    analysisId,
    createdBy: context.session.user.id,
    question,
    workspaceId: context.workspace.workspaceId,
  });

  return NextResponse.json(response);
}
