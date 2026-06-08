"use server";

import { revalidatePath } from "next/cache";

import { getAppContext } from "@/lib/auth";
import { syncMercadoLivreAccount } from "@/lib/integrations/mercadolivre";
import { syncShopeeAccount } from "@/lib/integrations/shopee";
import { saveStorefrontConnection, syncStorefrontIntegration, type StorefrontPlatform } from "@/lib/integrations/storefront";

function revalidateCommerce() {
  revalidatePath("/integrations");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/orders");
  revalidatePath("/stock");
}

export async function syncIntegrationAction(formData: FormData) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return;
  }

  const provider = String(formData.get("provider") ?? "");
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  if (provider === "mercado_livre") {
    await syncMercadoLivreAccount(id, context.workspace.workspaceId);
  }

  if (provider === "shopee") {
    await syncShopeeAccount(id, context.workspace.workspaceId);
  }

  if (provider === "storefront") {
    await syncStorefrontIntegration(id, context.workspace.workspaceId);
  }

  revalidateCommerce();
}

export async function connectStorefrontAction(formData: FormData) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return;
  }

  const storeUrl = String(formData.get("storeUrl") ?? "");
  const storeName = String(formData.get("storeName") ?? "Site proprio");
  const publicKey = String(formData.get("publicKey") ?? "");
  const secretKey = String(formData.get("secretKey") ?? "");
  const platform = String(formData.get("platform") ?? "custom") as StorefrontPlatform;

  if (!storeUrl || !publicKey || !secretKey) {
    return;
  }

  const integrationId = await saveStorefrontConnection({
    platform,
    publicKey,
    secretKey,
    storeName,
    storeUrl,
    workspaceId: context.workspace.workspaceId,
  });

  await syncStorefrontIntegration(integrationId, context.workspace.workspaceId);
  revalidateCommerce();
}
