export type AgentSlug =
  | "executive"
  | "finance"
  | "stock"
  | "pricing"
  | "catalog"
  | "supply"
  | "tax"
  | "growth"
  | "channel-performance";

export interface AgentDefinition {
  slug: AgentSlug;
  name: string;
  badge: string;
  mission: string;
  summary: string;
  specialty: string[];
  quickQuestions: string[];
  quickActions: string[];
  tools: string[];
  systemFocus: string;
}

export interface AIReplyMetric {
  label: string;
  value: string;
}

export interface AIReplyAction {
  label: string;
  intent: string;
  targetModule?: string;
  emphasis?: "primary" | "secondary";
}

export interface AIReply {
  title: string;
  summary: string;
  bullets: string[];
  metrics: AIReplyMetric[];
  actions: AIReplyAction[];
  followUps: string[];
  provider: string;
  model: string;
  reasoningMode: string;
}

export interface AttachmentPreview {
  name: string;
  size?: number;
  type?: string;
}

export interface CopilotRequestPayload {
  message: string;
  scope: "executive" | "copilot" | "agent";
  agentSlug?: AgentSlug;
  conversationId?: string | null;
  routeContext?: string;
  workspaceName?: string | null;
  attachments?: AttachmentPreview[];
  contextSnapshot?: {
    orderCount?: number;
    productCount?: number;
    financeCount?: number;
    supplierCount?: number;
    insightCount?: number;
    memoryCount?: number;
  };
}

export interface CopilotResponsePayload {
  conversationId: string | null;
  response: AIReply;
}

export const orchestrationLayers = [
  {
    title: "Orquestrador Erizon",
    description: "Decide qual agente usar, injeta contexto do workspace e transforma linguagem natural em fluxo operacional.",
  },
  {
    title: "Memória empresarial",
    description: "Compartilha histórico, decisões, padrões sazonais, preferências e sinais entre todos os agentes.",
  },
  {
    title: "Agente especializado",
    description: "Finance, Stock, Pricing, Catalog, Supply, Tax, Growth e Channel Performance com objetivos próprios.",
  },
  {
    title: "Camada LLM",
    description: "Pronta para trabalhar com Groq API, Llama, DeepSeek e Qwen via uma única superfície de orquestração.",
  },
];

export const agentDefinitions: AgentDefinition[] = [
  {
    slug: "executive",
    name: "Executive Agent",
    badge: "CEO Digital",
    mission: "Responder o que aconteceu no negócio e qual decisão executiva deve vir em seguida.",
    summary:
      "Lê o negócio de ponta a ponta e entrega contexto estratégico com foco em receita, lucro, gargalos, oportunidade e prioridade.",
    specialty: ["Resumo diário", "Prioridades", "Alertas", "Recomendações", "Narrativa executiva"],
    quickQuestions: [
      "O que aconteceu hoje no meu negócio?",
      "Quais oportunidades exigem ação imediata?",
      "Onde devo investir mais nesta semana?",
    ],
    quickActions: ["Abrir central executiva", "Gerar resumo diário", "Criar plano de ação"],
    tools: ["Memória empresarial", "Insights do workspace", "Ações rápidas globais"],
    systemFocus: "Visão consolidada do negócio com sugestão de próximos passos.",
  },
  {
    slug: "finance",
    name: "Finance Agent",
    badge: "Financeiro",
    mission: "Proteger margem, caixa e rentabilidade com leitura executiva e operacional.",
    summary: "Especialista em caixa, lucro, margem, EBITDA, ROI, despesas e centros de custo.",
    specialty: ["Fluxo de caixa", "Lucro", "Margem", "EBITDA", "Despesas"],
    quickQuestions: [
      "Como está minha saúde financeira?",
      "Quais despesas posso cortar?",
      "Qual centro de custo mais consome recursos?",
    ],
    quickActions: ["Revisar despesas", "Analisar margem", "Priorizar caixa"],
    tools: ["Transações", "Pedidos", "Canais", "Conciliação futura"],
    systemFocus: "Rentabilidade por canal, centro de custo e operação.",
  },
  {
    slug: "stock",
    name: "Stock Agent",
    badge: "Estoque",
    mission: "Evitar ruptura e excesso enquanto melhora giro e cobertura.",
    summary: "Lê movimentos, cobertura, giro, reserva e excesso para orientar reposição com contexto operacional.",
    specialty: ["Ruptura", "Cobertura", "Giro", "Excesso", "Reposição"],
    quickQuestions: [
      "Quais produtos acabarão primeiro?",
      "Qual produto está parado?",
      "Quanto estoque devo comprar?",
    ],
    quickActions: ["Gerar reposição", "Transferir estoque", "Investigar ruptura"],
    tools: ["Movimentos de estoque", "Localizações", "Pedidos", "Sugestões de compra"],
    systemFocus: "Disponibilidade saudável com capital bem alocado.",
  },
  {
    slug: "pricing",
    name: "Pricing Agent",
    badge: "Pricing",
    mission: "Recomendar preços sustentáveis e competitivos por SKU e canal.",
    summary: "Cruza custos, taxas, fretes, impostos e concorrência para sugerir preço mínimo, ideal e premium.",
    specialty: ["Preço mínimo", "Preço ideal", "Preço premium", "Competitividade", "Margem por SKU"],
    quickQuestions: [
      "Onde estou com preço abaixo da margem?",
      "Qual preço ideal para este SKU?",
      "Quais canais estão comprimindo minha rentabilidade?",
    ],
    quickActions: ["Corrigir preço", "Aplicar em canais", "Recalcular margem"],
    tools: ["Catálogo", "Custos", "Impostos", "Integrações de canal"],
    systemFocus: "Preço como motor de margem e posicionamento.",
  },
  {
    slug: "catalog",
    name: "Catalog Agent",
    badge: "Marketplace",
    mission: "Elevar posicionamento de anúncios e qualidade de catálogo.",
    summary: "Atua sobre Buy Box, concorrência, SEO, CTR, conversão e qualidade de conteúdo.",
    specialty: ["Buy Box", "Concorrência", "SEO", "CTR", "Conversão"],
    quickQuestions: [
      "Quais anúncios devo otimizar?",
      "Quem está roubando minha Buy Box?",
      "Onde meu catálogo está incompleto?",
    ],
    quickActions: ["Reescrever título", "Ajustar catálogo", "Atualizar anúncios"],
    tools: ["Anúncios", "Catálogo", "Marketplaces", "Pricing"],
    systemFocus: "Performance comercial de catálogo e anúncios.",
  },
  {
    slug: "supply",
    name: "Supply Agent",
    badge: "Compras",
    mission: "Planejar compras com melhor custo, prazo e cobertura.",
    summary: "Cruza ruptura iminente, fornecedores, lead time, margem e disponibilidade para orientar abastecimento.",
    specialty: ["Reposição", "Compras", "Lead time", "Custo", "Planejamento"],
    quickQuestions: [
      "Quem vende mais barato?",
      "Quanto devo comprar?",
      "Quais fornecedores são mais estratégicos agora?",
    ],
    quickActions: ["Solicitar cotação", "Gerar compra", "Comparar fornecedores"],
    tools: ["Fornecedores", "Sugestões de compra", "Estoque", "Catálogo"],
    systemFocus: "Comprar melhor e no momento certo.",
  },
  {
    slug: "tax",
    name: "Tax Agent",
    badge: "Fiscal",
    mission: "Sinalizar risco fiscal e inconsistências antes que virem problema.",
    summary: "Lê NCM, CFOP, ICMS, PIS, COFINS, DIFAL e ST com foco em risco operacional e governança.",
    specialty: ["NCM", "CFOP", "ICMS", "PIS/COFINS", "Inconsistências"],
    quickQuestions: [
      "Existe risco fiscal em algum canal?",
      "Quais produtos estão sem NCM?",
      "Onde há inconsistência tributária?",
    ],
    quickActions: ["Revisar perfil fiscal", "Mapear inconsistência", "Escalar para contador"],
    tools: ["Perfis fiscais", "Catálogo", "Pedidos", "Operações"],
    systemFocus: "Fiscal como camada preventiva, não apenas corretiva.",
  },
  {
    slug: "growth",
    name: "Growth Agent",
    badge: "Crescimento",
    mission: "Decidir o que vender mais, abandonar, comprar, investir e cortar.",
    summary: "É o agente de crescimento do sistema, com visão de produto, categoria, canal e lucro.",
    specialty: ["Mix de produto", "Canal", "Tendência", "Lucro", "Prioridade de investimento"],
    quickQuestions: [
      "O que devo vender mais?",
      "O que devo parar de vender?",
      "Onde devo investir mais?",
    ],
    quickActions: ["Priorizar mix", "Reduzir perdas", "Alocar investimento"],
    tools: ["Pedidos", "Margem", "Canais", "Memória empresarial"],
    systemFocus: "Crescimento disciplinado por margem e oportunidade.",
  },
  {
    slug: "channel-performance",
    name: "Channel Performance Agent",
    badge: "Canal",
    mission: "Comparar performance e rentabilidade entre canais de venda.",
    summary:
      "Lê Mercado Livre, Shopee, Amazon, Magalu, TikTok Shop, site próprio e PDV para orientar foco comercial.",
    specialty: ["Receita por canal", "Lucro por canal", "Eficiência", "Dependência", "Mix omnichannel"],
    quickQuestions: [
      "Qual canal é mais lucrativo?",
      "Onde minha margem está melhor?",
      "Quais canais exigem correção imediata?",
    ],
    quickActions: ["Rever canal", "Priorizar mídia", "Corrigir operação"],
    tools: ["Pedidos", "Financeiro", "Anúncios", "PDV"],
    systemFocus: "Comparação executiva entre canais para alocação inteligente.",
  },
];

export const executiveCenterPrompts = [
  "O que aconteceu hoje no meu negócio?",
  "Onde estou perdendo dinheiro?",
  "Qual marketplace é mais lucrativo?",
  "O que devo comprar agora?",
];

export const copilotPrompts = [
  "Onde estou perdendo dinheiro?",
  "Quais produtos devo comprar agora?",
  "Qual marketplace está mais rentável hoje?",
  "Quais produtos devo abandonar?",
];

export const executiveActionExamples = [
  {
    title: "Produto em ruptura iminente",
    description: "A IA detecta risco de ruptura e empacota ações executáveis para reposição ou transferência.",
    actions: ["Comprar agora", "Solicitar cotação", "Transferir estoque"],
  },
  {
    title: "Preço abaixo da margem",
    description: "Quando margem mínima é violada, a resposta já sugere correção por canal.",
    actions: ["Corrigir preço", "Atualizar marketplaces", "Aplicar em todos os canais"],
  },
  {
    title: "Anúncio perdendo posicionamento",
    description: "O sistema pode transformar diagnóstico em melhorias operacionais no catálogo.",
    actions: ["Reescrever título", "Atualizar catálogo", "Ajustar preço"],
  },
];

export function getAgentDefinition(slug: string) {
  return agentDefinitions.find((agent) => agent.slug === slug) ?? null;
}

export function buildFallbackReply(payload: CopilotRequestPayload): AIReply {
  const agent = payload.agentSlug ? getAgentDefinition(payload.agentSlug) : null;
  const workspace = payload.workspaceName ?? "seu workspace";
  const counts = payload.contextSnapshot;

  return {
    title: agent ? `${agent.name} pronto para operar` : "Erizon Copilot pronto",
    summary:
      `Recebi a solicitação "${payload.message}" para ${workspace}. ` +
      "A experiência de IA já está conectada à interface, memória e ações sugeridas, mas a resposta profunda depende da configuração do Groq e da entrada de dados reais no workspace.",
    bullets: [
      agent
        ? `${agent.name} já conhece sua missão e pode responder com foco em ${agent.specialty.slice(0, 3).join(", ")}.`
        : "O Orquestrador Erizon já consegue decidir entre visão executiva, copiloto global e especialistas.",
      "A camada de memória empresarial foi preparada para compartilhar contexto entre agentes, conversas e decisões.",
      "As respostas já nascem com formato estruturado e gatilhos de ação para operar o sistema, não só conversar.",
    ],
    metrics: [
      {
        label: "Pedidos lidos",
        value: String(counts?.orderCount ?? 0),
      },
      {
        label: "SKUs mapeados",
        value: String(counts?.productCount ?? 0),
      },
      {
        label: "Insights salvos",
        value: String(counts?.insightCount ?? 0),
      },
    ],
    actions: [
      {
        label: "Configurar Groq",
        intent: "Definir GROQ_API_KEY e GROQ_MODEL para ativar respostas LLM reais.",
        targetModule: "settings",
        emphasis: "primary",
      },
      {
        label: "Revisar memória",
        intent: "Popular o workspace com decisões, pedidos e contexto estratégico.",
        targetModule: "memory",
        emphasis: "secondary",
      },
      {
        label: "Abrir agentes",
        intent: "Escolher um especialista para aprofundar a análise.",
        targetModule: "agents",
        emphasis: "secondary",
      },
    ],
    followUps: agent
      ? agent.quickQuestions
      : ["O que aconteceu hoje?", "Qual canal está mais rentável?", "Quais produtos devo comprar agora?"],
    provider: "fallback",
    model: "no-llm-configured",
    reasoningMode: "context-aware",
  };
}
