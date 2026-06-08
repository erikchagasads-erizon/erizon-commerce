"use client";

import { useState } from "react";
import { Bot, X } from "lucide-react";

import { ConversationExperience } from "@/components/ai/conversation-experience";
import { Button } from "@/components/ui/button";
import { buildFallbackReply, copilotPrompts } from "@/lib/ai";

export function ErizonCopilot({
  workspaceName,
  contextSnapshot,
}: {
  workspaceName?: string | null;
  contextSnapshot?: {
    financeCount?: number;
    insightCount?: number;
    memoryCount?: number;
    orderCount?: number;
    productCount?: number;
    supplierCount?: number;
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2.5 rounded-lg border border-orange-500/20 bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-glow-sm transition hover:bg-orange-400 active:bg-orange-600"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Bot className="h-4 w-4" />
        Copilot
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 w-[min(100%,480px)] border-l border-white/7 bg-[#0c0a09] shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            <div className="flex h-14 items-center justify-between border-b border-white/7 px-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Erizon Copilot</p>
                </div>
              </div>
              <Button onClick={() => setOpen(false)} size="sm" variant="secondary">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="h-[calc(100vh-56px)] overflow-y-auto p-4">
              <ConversationExperience
                compact
                contextSnapshot={contextSnapshot}
                initialReply={buildFallbackReply({
                  contextSnapshot,
                  message: "Como posso ajudar agora?",
                  routeContext: "global-copilot",
                  scope: "copilot",
                  workspaceName,
                })}
                intro="Presente em todas as páginas para responder dúvidas, gerar análises, sugerir ações e orientar navegação."
                quickPrompts={copilotPrompts}
                routeContext="global-copilot"
                scope="copilot"
                workspaceName={workspaceName}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
