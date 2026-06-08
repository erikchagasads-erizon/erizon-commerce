"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModuleIcon } from "@/components/ui/module-icon";
import { navigationGroups } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function Sidebar({
  workspaceName,
  userLabel,
}: {
  workspaceName: string;
  userLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] border-r border-white/6 bg-[#0c0a09] lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/6 px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500">
            <span className="text-xs font-bold text-white">E</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Erizon</span>
        </div>
      </div>

      {/* Workspace info */}
      <div className="border-b border-white/6 px-4 py-3">
        <p className="text-xs text-stone-500">Workspace</p>
        <p className="mt-0.5 truncate text-sm font-medium text-white">{workspaceName}</p>
        <p className="mt-0.5 truncate text-xs text-stone-600">{userLabel}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-600">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-100",
                      active
                        ? "bg-orange-500/12 text-orange-400"
                        : "text-stone-400 hover:bg-white/3 hover:text-white",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md",
                        active ? "bg-orange-500/20" : "bg-white/3",
                      )}
                    >
                      <ModuleIcon className="h-3.5 w-3.5" name={item.icon} />
                    </div>
                    <span className="truncate font-medium">{item.label}</span>
                    {active && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom accent */}
      <div className="border-t border-white/6 p-4">
        <p className="text-[10px] text-stone-700">Commerce OS · v1.0</p>
      </div>
    </aside>
  );
}
