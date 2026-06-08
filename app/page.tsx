import { redirect } from "next/navigation";

import { getAppContext } from "@/lib/auth";

export default async function HomePage() {
  const context = await getAppContext();

  if (!context.isSupabaseConfigured) {
    redirect("/integrations");
  }

  if (context.session) {
    redirect("/integrations");
  }

  redirect("/login");
}
