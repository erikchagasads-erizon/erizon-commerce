import { redirect } from "next/navigation";

import { getAppContext } from "@/lib/auth";

export default async function HomePage() {
  const context = await getAppContext();

  if (!context.isSupabaseConfigured) {
    redirect("/executive-center");
  }

  if (context.session) {
    redirect("/executive-center");
  }

  redirect("/login");
}
