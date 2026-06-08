import { Users } from "lucide-react";

import { TeamInviteForm } from "@/components/admin/team-invite-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceTeam } from "@/lib/admin-data";
import { requireAppContext } from "@/lib/auth";
import { requireWorkspaceRoles, roleLabels } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export default async function TeamPage() {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin", "manager"]);

  const team = await getWorkspaceTeam(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Time</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Convide pessoas e controle quem opera a empresa.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Dê acesso ao time certo para cuidar de pedidos, produtos, estoque, financeiro e inteligência.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-400" />
              Convidar novo membro
            </CardTitle>
            <CardDescription>Escolha a função inicial e envie o convite para a pessoa certa.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamInviteForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membros atuais</CardTitle>
            <CardDescription>Pessoas que já fazem parte da operação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {team.members.length > 0 ? (
              team.members.map((member) => (
                <div key={member.id} className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{member.fullName ?? member.email ?? "Usuário sem nome"}</p>
                      <p className="mt-1 text-sm text-[var(--text-soft)]">{member.email ?? "Email indisponível"}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                      {roleLabels[member.role]}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-stone-600">Membro desde {formatDateTime(member.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum membro adicional ainda. Convide seu time para dividir a operação.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Convites pendentes</CardTitle>
          <CardDescription>Acompanhe quem ainda precisa aceitar o convite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.invites.length > 0 ? (
            team.invites.map((invite) => (
              <div key={invite.id} className="rounded-xl border border-white/7 bg-white/3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{invite.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
                      {roleLabels[invite.role]} - {invite.status}
                    </p>
                  </div>
                  <p className="text-xs text-stone-600">Expira em {formatDateTime(invite.expiresAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6 text-sm leading-6 text-[var(--text-soft)]">
              Ainda não há convites pendentes.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
