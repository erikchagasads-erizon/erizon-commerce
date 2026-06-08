import {
  Bot,
  BrainCircuit,
  Boxes,
  Command,
  CreditCard,
  Globe,
  KeyRound,
  Package2,
  Palette,
  Receipt,
  ScanBarcode,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Users2,
  Wallet,
  Warehouse,
} from "lucide-react";

import type { IconKey } from "@/lib/modules";

const iconMap = {
  bot: Bot,
  brain: BrainCircuit,
  boxes: Boxes,
  command: Command,
  credit: CreditCard,
  globe: Globe,
  key: KeyRound,
  package: Package2,
  palette: Palette,
  receipt: Receipt,
  scan: ScanBarcode,
  settings: Settings2,
  shield: ShieldCheck,
  shopping: ShoppingBag,
  spark: Sparkles,
  store: Store,
  truck: Truck,
  users: Users2,
  wallet: Wallet,
  warehouse: Warehouse,
} satisfies Record<IconKey, React.ComponentType<{ className?: string }>>;

export function ModuleIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = iconMap[name];

  return <Icon className={className} />;
}
