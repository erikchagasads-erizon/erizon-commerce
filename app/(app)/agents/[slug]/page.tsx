import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { slug: "executive" },
    { slug: "finance" },
    { slug: "stock" },
    { slug: "pricing" },
    { slug: "catalog" },
    { slug: "catalog-intelligence" },
    { slug: "supply" },
    { slug: "tax" },
    { slug: "growth" },
    { slug: "channel-performance" },
  ];
}

export default function AgentPage() {
  redirect("/executive-center");
}
