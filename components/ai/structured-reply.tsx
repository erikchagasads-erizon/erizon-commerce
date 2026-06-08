import Link from "next/link";

import type { AIReply } from "@/lib/ai";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StructuredReply({
  compact = false,
  reply,
}: {
  compact?: boolean;
  reply: AIReply;
}) {
  return (
    <div className={cn("space-y-4 rounded-2xl border border-white/10 bg-white/3 p-5", compact && "p-4")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{reply.provider}</Badge>
        <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-400">
          {reply.reasoningMode}
        </span>
        <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-400">
          {reply.model}
        </span>
      </div>

      <div>
        <h3 className={cn("text-lg font-semibold text-white", compact && "text-base")}>{reply.title}</h3>
        <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{reply.summary}</p>
      </div>

      {reply.metrics.length > 0 ? (
        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-3")}>
          {reply.metrics.map((metric) => (
            <div key={`${metric.label}-${metric.value}`} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{metric.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {reply.bullets.length > 0 ? (
        <div className="space-y-2">
          {reply.bullets.map((bullet) => (
            <div key={bullet} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm leading-6 text-stone-300">
              {bullet}
            </div>
          ))}
        </div>
      ) : null}

      {reply.actions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {reply.actions.map((action) =>
            action.targetModule ? (
              <Link
                key={`${action.label}-${action.intent}`}
                className={buttonStyles({
                  variant: action.emphasis === "primary" ? "primary" : "secondary",
                  size: "sm",
                })}
                href={`/${action.targetModule}`}
              >
                {action.label}
              </Link>
            ) : (
              <span
                key={`${action.label}-${action.intent}`}
                className={cn(
                  buttonStyles({
                    variant: action.emphasis === "primary" ? "primary" : "secondary",
                    size: "sm",
                  }),
                )}
              >
                {action.label}
              </span>
            ),
          )}
        </div>
      ) : null}

      {reply.followUps.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {reply.followUps.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/4 px-3 py-2 text-xs uppercase tracking-[0.16em] text-stone-400"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

