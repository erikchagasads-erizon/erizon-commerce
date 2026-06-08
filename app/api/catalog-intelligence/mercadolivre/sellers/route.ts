import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { getCatalogAnalysis, getLatestCatalogAnalyses } from "@/lib/catalog-intelligence";

export async function GET(request: Request) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para ver vendedores." }, { status: 401 });
  }

  const url = new URL(request.url);
  const analysisId = url.searchParams.get("analysisId");

  if (analysisId) {
    const analysis = await getCatalogAnalysis(context.workspace.workspaceId, analysisId);
    return NextResponse.json({ sellers: analysis.sellers });
  }

  const latest = (await getLatestCatalogAnalyses(context.workspace.workspaceId))[0];

  return NextResponse.json({ sellers: latest?.sellers ?? [] });
}
