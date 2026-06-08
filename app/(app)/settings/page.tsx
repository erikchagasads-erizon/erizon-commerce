import Link from "next/link";
import { CreditCard, Palette, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ denied?: string }>;
}) {
  await requireAppContext();
  const params = await searchParams;
  const accessDenied = params?.denied === "1";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Administração</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Cuide da empresa, do time e da assinatura.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Esta área reúne apenas decisões administrativas do negócio. A operação diária começa pela Central de Integrações.
        </p>
      </section>

      {accessDenied ? (
        <Card className="border-amber-400/20">
          <CardContent className="p-5 text-sm leading-6 text-amber-100">
            Seu perfil atual não permite abrir aquela área. Peça acesso ao responsável pela conta da empresa.
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            description: "Convide pessoas, defina papéis e acompanhe quem opera a plataforma.",
            href: "/team",
            icon: Users2,
            title: "Time",
          },
          {
            description: "Revise plano, uso, pagamentos e evolução da assinatura.",
            href: "/billing",
            icon: CreditCard,
            title: "Assinatura",
          },
          {
            description: "Ajuste nome, cores e presença visual da sua empresa.",
            href: "/white-label",
            icon: Palette,
            title: "Marca",
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
                Abrir
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
