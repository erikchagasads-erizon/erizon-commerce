import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { planDefinitions } from "@/lib/billing";

export default function UpgradePage() {
  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <Badge>Upgrade Paths</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Cresça do trial até uma operação enterprise sem trocar de sistema.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          A evolução comercial da Erizon já está desenhada por entitlements. Os limites guiam quando fazer upgrade sem
          interromper operação, IA ou integrações.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        {planDefinitions.map((plan) => (
          <Card key={plan.code} className={plan.code === "growth" ? "border-[rgba(249,115,22,0.15)]" : undefined}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.priceLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-[var(--text-soft)]">{plan.description}</p>
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm">
                    {feature}
                  </div>
                ))}
              </div>
              <Link className={buttonStyles({ variant: plan.code === "growth" ? "primary" : "secondary" })} href="/billing">
                Levar para billing
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

