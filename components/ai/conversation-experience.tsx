"use client";

import { Paperclip, SendHorizonal, Sparkles } from "lucide-react";
import { startTransition, useMemo, useState } from "react";

import { StructuredReply } from "@/components/ai/structured-reply";
import { Button, buttonStyles } from "@/components/ui/button";
import type {
  AgentSlug,
  AttachmentPreview,
  AIReply,
  CopilotRequestPayload,
  CopilotResponsePayload,
} from "@/lib/ai";
import { cn } from "@/lib/utils";

interface ConversationTurn {
  id: string;
  role: "assistant" | "user";
  content?: string;
  reply?: AIReply;
}

export function ConversationExperience({
  agentSlug,
  compact = false,
  initialReply,
  intro,
  quickPrompts,
  routeContext,
  scope,
  workspaceName,
  contextSnapshot,
}: {
  agentSlug?: AgentSlug;
  compact?: boolean;
  initialReply: AIReply;
  intro: string;
  quickPrompts: string[];
  routeContext: string;
  scope: "executive" | "copilot" | "agent";
  workspaceName?: string | null;
  contextSnapshot?: CopilotRequestPayload["contextSnapshot"];
}) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [messages, setMessages] = useState<ConversationTurn[]>([
    {
      id: "assistant-initial",
      role: "assistant",
      reply: initialReply,
    },
  ]);

  const promptPool = useMemo(() => quickPrompts.slice(0, compact ? 3 : 4), [compact, quickPrompts]);

  async function submitMessage(message: string) {
    if (!message.trim()) return;

    const userTurn: ConversationTurn = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userTurn]);
    setInput("");
    setIsPending(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentSlug,
          attachments,
          contextSnapshot,
          conversationId,
          message,
          routeContext,
          scope,
          workspaceName,
        } satisfies CopilotRequestPayload),
      });

      const payload = (await response.json()) as CopilotResponsePayload;
      setConversationId(payload.conversationId);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          reply: payload.response,
        },
      ]);
      setAttachments([]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          reply: {
            ...initialReply,
            title: "Falha de comunicação com a camada de IA",
            summary:
              "A conversa está pronta, mas a resposta não voltou como esperado. Tente novamente em instantes.",
            provider: "fallback",
            model: "network-error",
          },
        },
      ]);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className={cn("rounded-2xl border border-white/10 bg-white/3 p-5", compact && "rounded-[26px] p-4")}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/4 p-2">
            <Sparkles className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Camada conversacional Erizon</p>
            <p className="text-sm leading-6 text-[var(--text-soft)]">{intro}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {promptPool.map((prompt) => (
            <button
              key={prompt}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
              onClick={() => setInput(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("space-y-4", compact && "space-y-3")}>
        {messages.map((message) => (
          <div key={message.id} className={cn(message.role === "user" ? "flex justify-end" : "flex justify-start")}>
            {message.role === "user" ? (
              <div className="max-w-[85%] rounded-xl border border-[rgba(249,115,22,0.15)] bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(234,88,12,0.10))] px-4 py-3 text-sm leading-6 text-white">
                {message.content}
              </div>
            ) : message.reply ? (
              <div className={cn("w-full", compact && "max-w-full")}>
                <StructuredReply compact={compact} reply={message.reply} />
              </div>
            ) : null}
          </div>
        ))}

        {isPending ? (
          <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-[var(--text-soft)]">
            O orquestrador está montando a resposta e avaliando ações sugeridas...
          </div>
        ) : null}
      </div>

      <form
        className={cn("rounded-2xl border border-white/10 bg-white/3 p-4", compact && "rounded-xl p-3")}
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(() => {
            void submitMessage(input);
          });
        }}
      >
        <textarea
          className={cn(
            "min-h-[110px] w-full resize-none rounded-[22px] border border-white/10 bg-[#0c0a09]/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-600 focus:border-orange-500",
            compact && "min-h-[92px]",
          )}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Converse com o Erizon em linguagem natural. Ex.: Onde estou perdendo dinheiro?"
          value={input}
        />

        {attachments.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <span
                key={`${attachment.name}-${attachment.size ?? 0}`}
                className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.16em] text-stone-400"
              >
                {attachment.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.16em] text-stone-400">
            <Paperclip className="h-4 w-4" />
            Upload de arquivos
            <input
              className="hidden"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []).map((file) => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                }));
                setAttachments(files);
              }}
              type="file"
            />
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-600">
              {conversationId ? "Histórico conectado" : "Histórico da sessão"}
            </span>
            <Button disabled={isPending || !input.trim()} type="submit">
              {isPending ? "Pensando..." : "Enviar"}
              <SendHorizonal className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
