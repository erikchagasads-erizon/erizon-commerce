import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { hasEncryptionKey, hasServiceRoleEnv } from "@/lib/env";
import { saveStorefrontConnection, syncStorefrontIntegration, type StorefrontPlatform } from "@/lib/integrations/storefront";

export async function POST(request: Request) {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para conectar a loja." }, { status: 401 });
  }

  if (!hasEncryptionKey || !hasServiceRoleEnv) {
    return NextResponse.json({ error: "A conexao da loja precisa ser ativada pelo administrador." }, { status: 503 });
  }

  const formData = await request.formData();
  const platform = String(formData.get("platform") ?? "custom") as StorefrontPlatform;
  const storeName = String(formData.get("storeName") ?? "Site proprio");
  const storeUrl = String(formData.get("storeUrl") ?? "");
  const publicKey = String(formData.get("publicKey") ?? "");
  const secretKey = String(formData.get("secretKey") ?? "");

  if (!storeUrl || !publicKey || !secretKey || !["woocommerce", "shopify", "custom"].includes(platform)) {
    return NextResponse.json({ error: "Preencha os dados da loja para conectar." }, { status: 400 });
  }

  try {
    const integrationId = await saveStorefrontConnection({
      platform,
      publicKey,
      secretKey,
      storeName,
      storeUrl,
      workspaceId: context.workspace.workspaceId,
    });
    const result = await syncStorefrontIntegration(integrationId, context.workspace.workspaceId);

    return NextResponse.json({ message: "Loja conectada e dados importados.", result });
  } catch {
    return NextResponse.json({ error: "Nao conseguimos conectar essa loja. Revise os dados e tente novamente." }, { status: 500 });
  }
}
