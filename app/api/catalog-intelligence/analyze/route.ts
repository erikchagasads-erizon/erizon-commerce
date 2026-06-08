import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { analyzeCatalogProduct, updateProductCost } from "@/lib/catalog-intelligence";

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(request: Request) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para analisar catalogos." }, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const productId = String(payload.productId ?? "");

  if (!productId) {
    return NextResponse.json({ error: "Selecione um produto para analisar." }, { status: 400 });
  }

  try {
    if (payload.costs && typeof payload.costs === "object") {
      const costs = payload.costs as Record<string, unknown>;
      await updateProductCost({
        productId,
        values: {
          commissionCost: numberValue(costs.commissionCost),
          desiredMarginPercent: numberValue(costs.desiredMarginPercent, 18),
          freightCost: numberValue(costs.freightCost),
          marketplaceFeePercent: numberValue(costs.marketplaceFeePercent, 16),
          operationalCost: numberValue(costs.operationalCost),
          purchaseCost: numberValue(costs.purchaseCost),
          taxPercent: numberValue(costs.taxPercent, 8),
        },
        workspaceId: context.workspace.workspaceId,
      });
    }

    const analysis = await analyzeCatalogProduct({
      createdBy: context.session.user.id,
      productId,
      workspaceId: context.workspace.workspaceId,
    });

    return NextResponse.json({ analysis, message: "Analise competitiva concluida." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao conseguimos analisar esse catalogo agora." },
      { status: 500 },
    );
  }
}
