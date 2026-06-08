import Link from "next/link";
import { CheckCircle2, Database, KeyRound, Radar, Shield, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import {
  env,
  hasEncryptionKey,
  hasGroqEnv,
  hasServiceRoleEnv,
  hasSupabaseEnv,
  missingGroqEnv,
  missingProductionEnv,
  missingSupabaseEnv,
} from "@/lib/env";
import { maskSecret } from "@/lib/utils";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ denied?: string }>;
}) {
  const context = await requireAppContext();
  const params = await searchParams;
  const accessDenied = params?.denied === "1";

  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <Badge>Workspace & Platform Settings</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Configurações críticas da fundação SaaS</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Esta área concentra ambiente, autenticação, segurança operacional, readiness de IA e acessos administrativos do
          Erizon.
        </p>
      </section>

      {accessDenied ? (
        <Card className="border-amber-400/20">
          <CardContent className="p-5 text-sm leading-6 text-amber-100">
            Seu papel atual não permite abrir aquela área administrativa. Se precisar, peça elevação de acesso ao owner ou
            admin do workspace.
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-orange-400" />
              Autenticação
            </CardTitle>
            <CardDescription>Supabase Auth, sessão e criação automática do primeiro workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Status do ambiente: <span className="text-white">{hasSupabaseEnv ? "configurado" : "pendente"}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Usuário atual: <span className="text-white">{context.profile?.email ?? "sem sessão"}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Workspace atual: <span className="text-white">{context.workspace?.name ?? "não provisionado ainda"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="h-5 w-5 text-orange-400" />
              Ambiente
            </CardTitle>
            <CardDescription>Segredos ficam no servidor e somente o necessário aparece na interface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              NEXT_PUBLIC_APP_URL: <span className="text-white">{env.NEXT_PUBLIC_APP_URL}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              NEXT_PUBLIC_SUPABASE_URL: <span className="text-white">{maskSecret(env.NEXT_PUBLIC_SUPABASE_URL)}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
              <span className="text-white">{maskSecret(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Radar className="h-5 w-5 text-orange-400" />
              Hardening
            </CardTitle>
            <CardDescription>Itens de segurança e operação que diferenciam uma base produtiva de uma demo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Service role: <span className="text-white">{hasServiceRoleEnv ? "configurado" : "pendente"}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Chave de criptografia: <span className="text-white">{hasEncryptionKey ? "configurada" : "pendente"}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Variáveis críticas pendentes:{" "}
              <span className="text-white">{missingProductionEnv.length > 0 ? missingProductionEnv.join(", ") : "nenhuma"}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Camada de IA</CardTitle>
            <CardDescription>Orquestração pronta para Groq com memória, conversas, limites e guardrails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              GROQ_API_KEY: <span className="text-white">{maskSecret(env.GROQ_API_KEY)}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              GROQ_MODEL: <span className="text-white">{env.GROQ_MODEL || "Não configurado"}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Status da camada LLM: <span className="text-white">{hasGroqEnv ? "configurada" : "fallback contextual"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Persistência conversacional</CardTitle>
            <CardDescription>Estrutura pronta para armazenar conversas, mensagens e ações sugeridas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
            {[
              "ai_conversations para histórico por workspace, escopo e agente.",
              "ai_messages para conversa estruturada e payload do modelo.",
              "ai_action_suggestions para transformar resposta em ação rastreável.",
              "Rate limit, validação com Zod e guardrails contra prompt injection.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Checklist técnico do ambiente</CardTitle>
            <CardDescription>Itens fundamentais desta versão para evitar setup frágil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
            {[
              "Next.js 15 com App Router e TypeScript.",
              "TailwindCSS com design system base.",
              "Supabase Auth e client SSR preparados.",
              "Middleware para refresh de sessão.",
              "Rotas de produto e administração criadas.",
              "Schema SQL com RLS por workspace.",
              "API pública e billing preparados com segurança básica.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atenções pendentes</CardTitle>
            <CardDescription>Onde a base ainda depende de infraestrutura externa ou dados reais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
            {hasSupabaseEnv ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                Variáveis mínimas do Supabase presentes. O próximo passo é aplicar as migrações e validar autenticação real.
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-amber-100">
                Faltam variáveis de ambiente: {missingSupabaseEnv.join(", ")}.
              </div>
            )}
            {hasGroqEnv ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                A camada Groq está pronta para respostas reais do orquestrador.
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-amber-100">
                A IA segue funcional em modo fallback contextual, mas faltam: {missingGroqEnv.join(", ")}.
              </div>
            )}
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
              Marketplaces, bancos, fiscal e logística seguem em estrutura segura até as credenciais reais entrarem.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            description: "Planos, trial, uso, limites e histórico de cobrança.",
            href: "/billing",
            icon: Shield,
            title: "Billing",
          },
          {
            description: "Logo, cores, domínio, subdomínio e preview da marca.",
            href: "/white-label",
            icon: Sparkles,
            title: "White label",
          },
          {
            description: "Convites, papéis, membros e governança por workspace.",
            href: "/team",
            icon: KeyRound,
            title: "Time e permissões",
          },
          {
            description: "Status do banco, IA, jobs, integrações e erros recentes.",
            href: "/system-health",
            icon: Radar,
            title: "System health",
          },
          {
            description: "API keys, permissões e endpoints públicos iniciais.",
            href: "/developer-api",
            icon: Database,
            title: "Developer API",
          },
          {
            description: "Checklist inicial guiado com base em sinais reais do workspace.",
            href: "/onboarding",
            icon: CheckCircle2,
            title: "Onboarding",
          },
        ].map((item) => (
          <Card key={item.href}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-orange-400" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link className={buttonStyles({ variant: "secondary", size: "sm" })} href={item.href}>
                Abrir área
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

