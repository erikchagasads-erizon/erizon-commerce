"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createInviteAction, type AdminActionState } from "@/app/(app)/workspace-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roleDescriptions, roleLabels, type WorkspaceRole } from "@/lib/permissions";

const initialState: AdminActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button type="submit">{pending ? "Criando convite..." : "Enviar convite"}</Button>;
}

export function TeamInviteForm() {
  const [state, action] = useActionState(createInviteAction, initialState);
  const roles = Object.keys(roleLabels) as WorkspaceRole[];

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-white/7 bg-white/3 p-5">
      <div className="grid gap-4 md:grid-cols-[1fr,220px]">
        <Input name="email" placeholder="membro@empresa.com" type="email" />
        <select
          className="h-12 rounded-2xl border border-white/10 bg-white/3 px-4 text-sm text-white outline-none"
          defaultValue="operator"
          name="role"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {roles.map((role) => (
          <div key={role} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
            <p className="text-sm font-medium text-white">{roleLabels[role]}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">{roleDescriptions[role]}</p>
          </div>
        ))}
      </div>

      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}

      <SubmitButton />
    </form>
  );
}

