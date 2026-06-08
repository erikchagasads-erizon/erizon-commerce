"use server";

import { revalidatePath } from "next/cache";

import { getAppContext } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createStockMovementAction(formData: FormData) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return;
  }

  const productId = String(formData.get("productId") ?? "");
  const movementType = String(formData.get("movementType") ?? "adjustment");
  const quantity = Number(formData.get("quantity") ?? 0);
  const notes = String(formData.get("notes") ?? "");

  if (!productId || !quantity || !["entry", "exit", "adjustment"].includes(movementType)) {
    return;
  }

  const supabase = await createServerSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("metadata")
    .eq("workspace_id", context.workspace.workspaceId)
    .eq("id", productId)
    .maybeSingle();
  const metadata = ((product as { metadata: Record<string, unknown> | null } | null)?.metadata ?? {}) as Record<string, unknown>;
  const currentStock = Number(metadata.stock ?? 0);
  const nextStock = movementType === "entry" ? currentStock + quantity : movementType === "exit" ? currentStock - quantity : quantity;

  await supabase.from("stock_movements").insert({
    created_by: context.session.user.id,
    movement_type: movementType,
    notes,
    product_id: productId,
    quantity,
    reference_type: "manual",
    workspace_id: context.workspace.workspaceId,
  });
  await supabase
    .from("products")
    .update({
      metadata: {
        ...metadata,
        stock: Math.max(nextStock, 0),
      },
    })
    .eq("workspace_id", context.workspace.workspaceId)
    .eq("id", productId);

  revalidatePath("/stock");
  revalidatePath("/products");
  revalidatePath("/dashboard");
}

