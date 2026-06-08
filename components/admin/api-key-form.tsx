"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createApiKeyAction, type AdminActionState } from "@/app/(app)/workspace-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AdminActionState = {};
const defaultPermissions = [
  "products:read",
  "orders:read",
  "stock:read",
  "finance:read",
  "suppliers:read",
  "insights:read",
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button type="submit">{pending ? "Emitindo chave..." : "Gerar API key"}</Button>;
}

export function ApiKeyForm() {
  const [state, action] = useActionState(createApiKeyAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-white/7 bg-white/3 p-5">
      <Input name="label" placeholder="Ex.: ERP parceiro, BI, App mobile" />
      <div className="grid gap-2 sm:grid-cols-2">
        {defaultPermissions.map((permission) => (
          <label
            key={permission}
            className="flex items-center gap-3 rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm text-white"
          >
            <input className="accent-[var(--accent)]" defaultChecked name="permissions" type="checkbox" value={permission} />
            {permission}
          </label>
        ))}
      </div>

      {state.generatedKey ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <p className="font-medium">Chave gerada com sucesso</p>
          <p className="mt-2 break-all font-mono text-xs">{state.generatedKey}</p>
        </div>
      ) : null}

      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}

      <SubmitButton />
    </form>
  );
}

