"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { saveWhiteLabelAction, type AdminActionState } from "@/app/(app)/workspace-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BrandingRecord } from "@/lib/admin-data";

const initialState: AdminActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button type="submit">{pending ? "Salvando identidade..." : "Salvar identidade"}</Button>;
}

export function WhiteLabelForm({ branding }: { branding: BrandingRecord }) {
  const [state, action] = useActionState(saveWhiteLabelAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-white/7 bg-white/3 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input defaultValue={branding.brandName} name="brandName" placeholder="Nome da marca" />
        <Input defaultValue={branding.supportEmail ?? ""} name="supportEmail" placeholder="support@empresa.com" type="email" />
      </div>
      <Input defaultValue={branding.loginHeadline ?? ""} name="loginHeadline" placeholder="Headline da tela de login" />
      <div className="grid gap-4 md:grid-cols-2">
        <Input defaultValue={branding.logoUrl ?? ""} name="logoUrl" placeholder="https://..." />
        <Input defaultValue={branding.faviconUrl ?? ""} name="faviconUrl" placeholder="https://..." />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input defaultValue={branding.subdomain ?? ""} name="subdomain" placeholder="minha-marca" />
        <Input defaultValue={branding.customDomain ?? ""} name="customDomain" placeholder="app.minhaempresa.com" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input defaultValue={branding.primaryColor} name="primaryColor" placeholder="#6C4BFF" />
        <Input defaultValue={branding.accentColor} name="accentColor" placeholder="#2FFFCB" />
      </div>

      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}

      <SubmitButton />
    </form>
  );
}

