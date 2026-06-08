import { env, hasGroqEnv } from "@/lib/env";
import {
  buildFallbackReply,
  getAgentDefinition,
  type AIReply,
  type CopilotRequestPayload,
} from "@/lib/ai";

interface GroqChoice {
  message?: {
    content?: string | null;
  };
}

interface GroqResponse {
  choices?: GroqChoice[];
}

function extractJsonObject(raw: string) {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model response.");
  }

  return raw.slice(firstBrace, lastBrace + 1);
}

function validateReply(candidate: Partial<AIReply>, fallback: AIReply): AIReply {
  return {
    title: candidate.title || fallback.title,
    summary: candidate.summary || fallback.summary,
    bullets: Array.isArray(candidate.bullets) && candidate.bullets.length > 0 ? candidate.bullets : fallback.bullets,
    metrics: Array.isArray(candidate.metrics) ? candidate.metrics.filter(Boolean).slice(0, 4) : fallback.metrics,
    actions: Array.isArray(candidate.actions) ? candidate.actions.filter(Boolean).slice(0, 4) : fallback.actions,
    followUps:
      Array.isArray(candidate.followUps) && candidate.followUps.length > 0 ? candidate.followUps : fallback.followUps,
    provider: candidate.provider || fallback.provider,
    model: candidate.model || fallback.model,
    reasoningMode: candidate.reasoningMode || fallback.reasoningMode,
  };
}

function buildSystemPrompt(payload: CopilotRequestPayload) {
  const agent = payload.agentSlug ? getAgentDefinition(payload.agentSlug) : null;

  return [
    "Você é o orquestrador ERIZON COMMERCE AI, um sistema operacional de comércio centrado em IA.",
    "Responda sempre em português do Brasil.",
    "Não invente números, fatos operacionais ou integrações ativas.",
    "Toda análise deve citar de quais módulos ou sinais veio a conclusão, mesmo em alto nível.",
    "Ações críticas precisam aparecer como recomendação com necessidade de confirmação humana.",
    "Quando não houver contexto suficiente, diga isso claramente e recomende a próxima ação mais útil.",
    "Seja executivo, preciso e orientado a ação.",
    agent
      ? `Atue como ${agent.name}. Missão: ${agent.mission}. Especialidades: ${agent.specialty.join(", ")}.`
      : "Atue como ERIZON COPILOT com visão transversal de operação, margem, estoque, canais e execução.",
    `Escopo da interação: ${payload.scope}.`,
    `Rota de origem: ${payload.routeContext ?? "não informada"}.`,
    `Workspace: ${payload.workspaceName ?? "não informado"}.`,
    `Snapshot: ${JSON.stringify(payload.contextSnapshot ?? {})}.`,
    "Retorne apenas JSON válido com a forma:",
    JSON.stringify({
      title: "string",
      summary: "string",
      bullets: ["string"],
      metrics: [{ label: "string", value: "string" }],
      actions: [{ label: "string", intent: "string", targetModule: "string", emphasis: "primary" }],
      followUps: ["string"],
      provider: "groq",
      model: "string",
      reasoningMode: "string",
    }),
  ].join("\n");
}

export async function askCommerceAI(payload: CopilotRequestPayload): Promise<AIReply> {
  const fallback = buildFallbackReply(payload);

  if (!hasGroqEnv) {
    return fallback;
  }

  const userPrompt = [
    `Mensagem do usuário: ${payload.message}`,
    payload.attachments?.length
      ? `Arquivos citados: ${payload.attachments.map((attachment) => attachment.name).join(", ")}`
      : "Arquivos citados: nenhum",
  ].join("\n");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(payload),
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        ...fallback,
        summary:
          `${fallback.summary} A chamada ao Groq falhou com status ${response.status}, então mantive a resposta honesta baseada na fundação local.`,
      };
    }

    const data = (await response.json()) as GroqResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return fallback;
    }

    const parsed = JSON.parse(extractJsonObject(content)) as Partial<AIReply>;
    return validateReply(parsed, fallback);
  } catch {
    return {
      ...fallback,
      summary:
        `${fallback.summary} O endpoint de IA não respondeu com JSON utilizável, então a experiência caiu de forma segura para o modo de fallback contextual.`,
    };
  }
}
