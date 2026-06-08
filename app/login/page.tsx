import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { executiveQuestions, settingsHighlights } from "@/lib/modules";
import { getAppContext } from "@/lib/auth";
import { missingSupabaseEnv } from "@/lib/env";
import Link from "next/link";

export default async function LoginPage() {
  const context = await getAppContext();

  if (context.isSupabaseConfigured && context.session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0c0a09]">
      <div className="erizon-grid absolute inset-0" />

      {/* Top nav */}
      <div className="relative border-b border-white/6 px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500">
              <span className="text-xs font-bold text-white">E</span>
            </div>
            <span className="text-sm font-semibold text-white">Erizon</span>
          </div>
          <Badge>Commerce OS</Badge>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.1fr,0.9fr]">
          {/* Left: hero + features */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-500">
              O Sistema Operacional de Comércio
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Opere, cresça e decida com inteligência.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-7 text-stone-400">
              ERP, OMS, WMS, estoque, financeiro, fiscal, fornecedores e agentes de IA trabalhando no mesmo workspace.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Workspace isolado",
                  text: "RLS por workspace e criação automática no primeiro login.",
                },
                {
                  icon: Workflow,
                  title: "Omnichannel",
                  text: "Pedidos, catálogo, estoque e financeiro sem duplicidade.",
                },
                {
                  icon: Sparkles,
                  title: "IA especializada",
                  text: "Agentes com memória empresarial focados em margem e crescimento.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/7 bg-white/3 p-5">
                  <item.icon className="mb-3 h-5 w-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-stone-500">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-stone-600">
                  Perguntas que a central executiva responde
                </p>
                <div className="space-y-1.5">
                  {executiveQuestions.map((question) => (
                    <div
                      key={question}
                      className="rounded-lg border border-white/6 bg-white/3 px-3.5 py-2.5 text-xs leading-5 text-stone-400"
                    >
                      {question}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-stone-600">
                  O que já vem preparado
                </p>
                <div className="space-y-1.5">
                  {settingsHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-white/6 bg-white/3 px-3.5 py-2.5 text-xs leading-5 text-stone-400"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: auth */}
          <div className="space-y-4">
            {context.isSupabaseConfigured ? (
              <AuthForm />
            ) : (
              <Card className="border-amber-500/15 bg-amber-500/5">
                <CardHeader>
                  <CardTitle>Configuração inicial pendente</CardTitle>
                  <CardDescription>
                    O layout e a arquitetura já estão prontos, mas a autenticação depende do Supabase.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/8 p-3.5 text-sm text-amber-200/80">
                    Variáveis ausentes: {missingSupabaseEnv.join(", ")}.
                  </div>
                  <p className="text-sm leading-6 text-stone-500">
                    Preencha o arquivo <code className="text-orange-400">.env.local</code> a partir de{" "}
                    <code className="text-orange-400">.env.example</code>.
                  </p>
                  <Link className={buttonStyles({ variant: "secondary" })} href="/executive-center">
                    Explorar a base criada
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Sequência de implantação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {[
                  "1. Configurar projeto Supabase e aplicar a migração inicial.",
                  "2. Definir URL e chave pública no ambiente do Next.js.",
                  "3. Criar o primeiro usuário e validar a criação do workspace.",
                  "4. Conectar catálogo, estoque e canais prioritários.",
                ].map((step) => (
                  <div key={step} className="rounded-lg border border-white/6 bg-white/3 px-3.5 py-2.5 text-xs text-stone-400">
                    {step}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
