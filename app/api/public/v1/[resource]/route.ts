import { NextResponse } from "next/server";

import {
  authenticateWorkspaceApiKey,
  getResourcePermission,
  parseLimit,
  protectPublicApiRateLimit,
  queryPublicResource,
  RateLimitError,
  type PublicResource,
} from "@/lib/public-api";
import { hasServiceRoleEnv, hasSupabaseEnv } from "@/lib/env";

const allowedResources = new Set<PublicResource>(["products", "orders", "stock", "finance", "suppliers", "insights"]);

export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!hasSupabaseEnv || !hasServiceRoleEnv) {
    return NextResponse.json(
      {
        error: "Public API ainda não está pronta neste ambiente.",
      },
      { status: 503 },
    );
  }

  const { resource } = await context.params;

  if (!allowedResources.has(resource as PublicResource)) {
    return NextResponse.json(
      {
        error: "Recurso não suportado.",
      },
      { status: 404 },
    );
  }

  try {
    const auth = await authenticateWorkspaceApiKey(request.headers.get("authorization"));

    if (!auth) {
      return NextResponse.json(
        {
          error: "API key inválida.",
        },
        { status: 401 },
      );
    }

    protectPublicApiRateLimit(auth.apiKeyId);

    const requiredPermission = getResourcePermission(resource as PublicResource);

    if (!auth.permissions.includes(requiredPermission)) {
      return NextResponse.json(
        {
          error: "Permissão insuficiente para este recurso.",
        },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get("limit"));
    const data = await queryPublicResource({
      limit,
      resource: resource as PublicResource,
      workspaceId: auth.workspaceId,
    });

    return NextResponse.json({
      data,
      limit,
      resource,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: "Falha ao consultar a API pública.",
      },
      { status: 500 },
    );
  }
}

