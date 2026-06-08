import Link from "next/link";
import { Bell, Bot, LogOut, Search } from "lucide-react";

import { signOutAction } from "@/app/(app)/actions";
import type { AppContext } from "@/lib/auth";
import { formatLongDate } from "@/lib/utils";
import { Button, buttonStyles } from "@/components/ui/button";

export function Topbar({ context }: { context: AppContext }) {
  const workspaceName = context.workspace?.name ?? "Configuração";
  const userName = context.profile?.fullName ?? context.profile?.email ?? "Visitante";

  return (
    <header className="sticky top-0 z-10 border-b border-white/6 bg-[#0c0a09]/95 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-4 px-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="truncate text-sm font-semibold text-white">{workspaceName}</h2>
            <span className="hidden text-xs text-stone-600 sm:block">{formatLongDate(new Date())}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-stone-600">{userName}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/7 bg-white/3 px-3 py-1.5 text-xs text-stone-500 md:flex">
            <Search className="h-3.5 w-3.5" />
            <span>Busca global</span>
            <kbd className="rounded border border-white/10 bg-white/3 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </div>
          <Link className={buttonStyles({ variant: "secondary", size: "sm" })} href="/agents">
            <Bot className="mr-1.5 h-3.5 w-3.5" />
            Agentes
          </Link>
          <Link className={buttonStyles({ variant: "secondary", size: "sm" })} href="/system-health">
            <Bell className="h-3.5 w-3.5" />
          </Link>
          {context.session ? (
            <form action={signOutAction}>
              <Button size="sm" variant="secondary" type="submit">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </form>
          ) : (
            <Link className={buttonStyles({ size: "sm" })} href="/login">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
