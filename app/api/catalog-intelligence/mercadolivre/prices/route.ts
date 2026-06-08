import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para ver precos." }, { status: 401 });
  }

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const analysisId = url.searchParams.get("analysisId");
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("catalog_price_history")
    .select("analysis_id, product_id, seller_id, item_id, price, catalog_position, captured_at")
    .eq("workspace_id", context.workspace.workspaceId)
    .order("captured_at", { ascending: false })
    .limit(100);

  if (analysisId) {
    query = query.eq("analysis_id", analysisId);
  }

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data } = await query;

  return NextResponse.json({ prices: data ?? [] });
}
