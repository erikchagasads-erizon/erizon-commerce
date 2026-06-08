"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signInAction, signUpAction, type AuthActionState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

function SubmitButton({ idleLabel, loadingLabel }: { idleLabel: string; loadingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit">
      {pending ? loadingLabel : idleLabel}
    </Button>
  );
}

export function AuthForm() {
  const [signInState, signInFormAction] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction] = useActionState(signUpAction, initialState);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua empresa para acompanhar vendas, estoque e resultados.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signInFormAction} className="space-y-3">
            <Input autoComplete="email" name="email" placeholder="voce@empresa.com" type="email" />
            <Input autoComplete="current-password" name="password" placeholder="Senha" type="password" />
            {signInState.error ? <p className="text-xs text-red-400">{signInState.error}</p> : null}
            <SubmitButton idleLabel="Entrar" loadingLabel="Entrando..." />
          </form>
        </CardContent>
      </Card>

      <Card className="border-orange-500/15">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Crie sua empresa na Erizon e comece conectando seus canais de venda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signUpFormAction} className="space-y-3">
            <Input autoComplete="name" name="fullName" placeholder="Nome completo" />
            <Input autoComplete="email" name="email" placeholder="voce@empresa.com" type="email" />
            <Input autoComplete="new-password" name="password" placeholder="Crie uma senha forte" type="password" />
            {signUpState.error ? <p className="text-xs text-red-400">{signUpState.error}</p> : null}
            {signUpState.success ? <p className="text-xs text-green-400">{signUpState.success}</p> : null}
            <SubmitButton idleLabel="Criar conta" loadingLabel="Preparando sua empresa..." />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
