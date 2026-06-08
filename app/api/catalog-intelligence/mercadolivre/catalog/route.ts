import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { getCatalogProducts, getLatestCatalogAnalyses } from "@/lib/catalog-intelligence";

export async function GET() {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para ver catalogos." }, { status: 401 });
  }

  const [products, analyses] = await Promise.all([
    getCatalogProducts(context.workspace.workspaceId),
    getLatestCatalogAnalyses(context.workspace.workspaceId),
  ]);

  return NextResponse.json({
    analyses,
    products,
  });
}
