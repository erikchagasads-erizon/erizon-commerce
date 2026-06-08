"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAppContext } from "@/lib/auth";
import { analyzeCatalogProduct, updateProductCost } from "@/lib/catalog-intelligence";

function numberFromForm(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

export async function analyzeCatalogAction(formData: FormData) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return;
  }

  const productId = String(formData.get("productId") ?? "");

  if (!productId) {
    return;
  }

  await updateProductCost({
    productId,
    values: {
      commissionCost: numberFromForm(formData, "commissionCost"),
      desiredMarginPercent: numberFromForm(formData, "desiredMarginPercent", 18),
      freightCost: numberFromForm(formData, "freightCost"),
      marketplaceFeePercent: numberFromForm(formData, "marketplaceFeePercent", 16),
      operationalCost: numberFromForm(formData, "operationalCost"),
      purchaseCost: numberFromForm(formData, "purchaseCost"),
      taxPercent: numberFromForm(formData, "taxPercent", 8),
    },
    workspaceId: context.workspace.workspaceId,
  });

  const analysis = await analyzeCatalogProduct({
    createdBy: context.session.user.id,
    productId,
    workspaceId: context.workspace.workspaceId,
  });

  revalidatePath("/catalog-intelligence");
  redirect(`/catalog-intelligence?analysis=${analysis.id}`);
}
