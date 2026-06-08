import { NextResponse } from "next/server";

import { appendAuditLog } from "@/lib/audit";
import type { CopilotRequestPayload, CopilotResponsePayload } from "@/lib/ai";
import { buildFallbackReply } from "@/lib/ai";
import { askCommerceAI } from "@/lib/ai/orchestrator";
import { getWorkspaceSubscription, getWorkspaceUsage, isUsageLimited } from "@/lib/billing";
import { getAppContext } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { containsPromptInjectionRisk, enforceRateLimit, RateLimitError } from "@/lib/security";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { copilotRequestSchema } from "@/lib/validation";

async function persistConversation(
  payload: CopilotRequestPayload,
  responsePayload: CopilotResponsePayload,
  userId: string,
  workspaceId: string,
) {
  if (!hasSupabaseEnv) {
    return responsePayload;
  }

  try {
    const supabase = await createServerSupabaseClient();
    let conversationId = payload.conversationId ?? null;

    if (conversationId) {
      const { data: existingConversation } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (!existingConversation) {
        conversationId = null;
      }
    }

    if (!conversationId) {
      const { data: conversation } = await supabase
        .from("ai_conversations")
        .insert({
          agent_code: payload.agentSlug ?? "copilot",
          scope: payload.scope,
          title: payload.message.slice(0, 96),
          user_id: userId,
          workspace_id: workspaceId,
        })
        .select("id")
        .single();

      conversationId = (conversation as { id: string } | null)?.id ?? null;
    }

    if (!conversationId) {
      return responsePayload;
    }

    const { data: userMessage } = await supabase
      .from("ai_messages")
      .insert({
        attachments: payload.attachments ?? [],
        content: payload.message,
        conversation_id: conversationId,
        model: "user-input",
        provider: "client",
        role: "user",
        workspace_id: workspaceId,
      })
      .select("id")
      .single();

    const { data: assistantMessage } = await supabase
      .from("ai_messages")
      .insert({
        content: responsePayload.response.summary,
        conversation_id: conversationId,
        model: responsePayload.response.model,
        provider: responsePayload.response.provider,
        related_message_id: (userMessage as { id: string } | null)?.id ?? null,
        role: "assistant",
        structured_payload: responsePayload.response,
        workspace_id: workspaceId,
      })
      .select("id")
      .single();

    if (assistantMessage && responsePayload.response.actions.length > 0) {
      await supabase.from("ai_action_suggestions").insert(
        responsePayload.response.actions.map((action) => ({
          action_key: action.targetModule ?? action.label.toLowerCase().replaceAll(" ", "-"),
          conversation_id: conversationId,
          intent: action.intent,
          label: action.label,
          message_id: (assistantMessage as { id: string }).id,
          target_module: action.targetModule ?? null,
          workspace_id: workspaceId,
        })),
      );
    }

    return {
      ...responsePayload,
      conversationId,
    };
  } catch {
    return responsePayload;
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = copilotRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Payload inválido para o ERIZON COPILOT.",
        },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const context = await getAppContext();

    if (context.session?.user.id) {
      enforceRateLimit(`copilot:${context.session.user.id}`, 30, 60_000);
    }

    if (containsPromptInjectionRisk(payload.message)) {
      if (context.session?.user.id && context.workspace?.workspaceId) {
        await appendAuditLog({
          action: "copilot_guardrail_blocked",
          actorUserId: context.session.user.id,
          entityType: "ai_message",
          payload: {
            routeContext: payload.routeContext,
          },
          workspaceId: context.workspace.workspaceId,
        });
      }

      return NextResponse.json({
        conversationId: payload.conversationId ?? null,
        response: {
          ...buildFallbackReply(payload),
          title: "Solicitação bloqueada por guardrail",
          summary:
            "A mensagem foi bloqueada porque parecia tentar alterar instruções internas ou contornar a camada de segurança. Reformule a pergunta focando no negócio ou no módulo que deseja analisar.",
          provider: "guardrail",
          model: "local-policy",
        },
      } satisfies CopilotResponsePayload);
    }

    if (context.workspace?.workspaceId) {
      const [subscription, usage] = await Promise.all([
        getWorkspaceSubscription(context.workspace.workspaceId),
        getWorkspaceUsage(context.workspace.workspaceId),
      ]);

      if (isUsageLimited(subscription.planCode, "aiMessagesThisMonth", usage.aiMessagesThisMonth)) {
        return NextResponse.json({
          conversationId: payload.conversationId ?? null,
          response: {
            ...buildFallbackReply(payload),
            title: "Limite de IA do plano atingido",
            summary:
              "A empresa atingiu o volume mensal de perguntas para IA previsto no plano atual. A operação segue normal, mas novas análises completas exigem upgrade ou o início do próximo ciclo.",
            actions: [
              {
                emphasis: "primary",
                intent: "Revisar upgrade e desbloquear mais uso de IA.",
                label: "Ir para upgrade",
                targetModule: "upgrade",
              },
              {
                emphasis: "secondary",
                intent: "Revisar consumo e assinatura da empresa.",
                label: "Ver billing",
                targetModule: "billing",
              },
            ],
            model: "plan-guardrail",
            provider: "guardrail",
          },
        } satisfies CopilotResponsePayload);
      }
    }

    const responsePayload: CopilotResponsePayload = {
      conversationId: payload.conversationId ?? null,
      response: await askCommerceAI(payload),
    };

    if (context.session?.user && context.workspace?.workspaceId) {
      const persisted = await persistConversation(
        payload,
        responsePayload,
        context.session.user.id,
        context.workspace.workspaceId,
      );

      return NextResponse.json(persisted);
    }

    return NextResponse.json(responsePayload);
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
        error: "Falha ao processar a solicitação do copilot.",
      },
      { status: 500 },
    );
  }
}
