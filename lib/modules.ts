export type IconKey =
  | "command"
  | "users"
  | "credit"
  | "palette"
  | "shield"
  | "key"
  | "spark"
  | "shopping"
  | "package"
  | "boxes"
  | "warehouse"
  | "store"
  | "globe"
  | "scan"
  | "wallet"
  | "receipt"
  | "truck"
  | "bot"
  | "brain"
  | "settings";

export type ModuleSlug =
  | "executive-center"
  | "dashboard"
  | "onboarding"
  | "team"
  | "billing"
  | "white-label"
  | "system-health"
  | "developer-api"
  | "data-cloud"
  | "event-bus"
  | "market-intelligence"
  | "automations"
  | "mobile"
  | "orders"
  | "products"
  | "stock"
  | "wms"
  | "marketplaces"
  | "ecommerce"
  | "pos"
  | "finance"
  | "tax"
  | "suppliers"
  | "agents"
  | "memory"
  | "settings";

export type ProductModuleSlug =
  | "orders"
  | "products"
  | "stock"
  | "wms"
  | "marketplaces"
  | "ecommerce"
  | "pos"
  | "finance"
  | "tax"
  | "suppliers"
  | "agents"
  | "memory"
  | "data-cloud"
  | "event-bus"
  | "market-intelligence"
  | "automations"
  | "mobile";

export interface ModuleDefinition {
  slug: ProductModuleSlug;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  icon: IconKey;
  stage: string;
  quickActions: string[];
  filters: string[];
  columns: string[];
  kpis: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
  aiPrompts: string[];
  integrations: string[];
  guardrails: string[];
  emptyStateTitle: string;
  emptyStateDescription: string;
}

export const navigationGroups = [
  {
    title: "Central",
    items: [
      {
        slug: "onboarding" as const,
        href: "/onboarding",
        label: "Onboarding",
        description: "Checklist inicial guiado",
        icon: "shield" as const,
      },
      {
        slug: "executive-center" as const,
        href: "/executive-center",
        label: "Executive Center",
        description: "CEO digital com chat e ações",
        icon: "spark" as const,
      },
      {
        slug: "dashboard" as const,
        href: "/dashboard",
        label: "Dashboard",
        description: "Resumo executivo do negócio",
        icon: "command" as const,
      },
      {
        slug: "data-cloud" as const,
        href: "/data-cloud",
        label: "Data Cloud",
        description: "Metricas, fontes e modelos",
        icon: "brain" as const,
      },
      {
        slug: "event-bus" as const,
        href: "/event-bus",
        label: "Event Bus",
        description: "Eventos, webhooks e triggers",
        icon: "spark" as const,
      },
    ],
  },
  {
    title: "Operação",
    items: [
      {
        slug: "orders" as const,
        href: "/orders",
        label: "Pedidos",
        description: "OMS omnichannel",
        icon: "shopping" as const,
      },
      {
        slug: "products" as const,
        href: "/products",
        label: "Produtos",
        description: "Catálogo, SKUs e margens",
        icon: "package" as const,
      },
      {
        slug: "stock" as const,
        href: "/stock",
        label: "Estoque",
        description: "Estoque com IA",
        icon: "boxes" as const,
      },
      {
        slug: "wms" as const,
        href: "/wms",
        label: "WMS",
        description: "Recebimento, picking e expedição",
        icon: "warehouse" as const,
      },
      {
        slug: "pos" as const,
        href: "/pos",
        label: "PDV",
        description: "PDV inteligente",
        icon: "scan" as const,
      },
      {
        slug: "finance" as const,
        href: "/finance",
        label: "Financeiro",
        description: "Fluxo de caixa e resultados",
        icon: "wallet" as const,
      },
      {
        slug: "tax" as const,
        href: "/tax",
        label: "Fiscal",
        description: "Central fiscal",
        icon: "receipt" as const,
      },
      {
        slug: "suppliers" as const,
        href: "/suppliers",
        label: "Fornecedores",
        description: "Supply network inteligente",
        icon: "truck" as const,
      },
      {
        slug: "automations" as const,
        href: "/automations",
        label: "Automacoes",
        description: "Regras, playbooks e execucoes",
        icon: "settings" as const,
      },
      {
        slug: "mobile" as const,
        href: "/mobile",
        label: "Mobile",
        description: "Apps, push e aprovacoes",
        icon: "scan" as const,
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        slug: "team" as const,
        href: "/team",
        label: "Time",
        description: "Usuários, convites e papéis",
        icon: "users" as const,
      },
      {
        slug: "billing" as const,
        href: "/billing",
        label: "Billing",
        description: "Planos, uso e cobrança",
        icon: "credit" as const,
      },
      {
        slug: "white-label" as const,
        href: "/white-label",
        label: "White Label",
        description: "Marca, domínio e preview",
        icon: "palette" as const,
      },
      {
        slug: "system-health" as const,
        href: "/system-health",
        label: "System Health",
        description: "Observabilidade e jobs",
        icon: "shield" as const,
      },
      {
        slug: "developer-api" as const,
        href: "/developer-api",
        label: "Developer API",
        description: "API keys e endpoints",
        icon: "key" as const,
      },
      {
        slug: "settings" as const,
        href: "/settings",
        label: "Settings",
        description: "Workspace, auth e integrações",
        icon: "settings" as const,
      },
    ],
  },
  {
    title: "Canais e IA",
    items: [
      {
        slug: "marketplaces" as const,
        href: "/marketplaces",
        label: "Marketplaces",
        description: "Hub inteligente de anúncios",
        icon: "store" as const,
      },
      {
        slug: "ecommerce" as const,
        href: "/ecommerce",
        label: "E-commerce",
        description: "Conectores de loja própria",
        icon: "globe" as const,
      },
      {
        slug: "agents" as const,
        href: "/agents",
        label: "Agentes IA",
        description: "Finance, pricing, growth e mais",
        icon: "bot" as const,
      },
      {
        slug: "memory" as const,
        href: "/memory",
        label: "Memória",
        description: "Contexto operacional do workspace",
        icon: "brain" as const,
      },
      {
        slug: "market-intelligence" as const,
        href: "/market-intelligence",
        label: "Market Intelligence",
        description: "Sinais, concorrentes e recomendacoes",
        icon: "globe" as const,
      },
    ],
  },
];

export const moduleDefinitions: Record<ModuleDefinition["slug"], ModuleDefinition> = {
  orders: {
    slug: "orders",
    label: "Erizon OMS",
    title: "Central omnichannel de pedidos",
    subtitle: "Pedidos, pagamentos, logística e pós-venda em uma única fila operacional.",
    description:
      "Estrutura pronta para Mercado Livre, Shopee, Amazon, Magalu, TikTok Shop, site próprio e PDV, com rastreabilidade completa por pedido.",
    icon: "shopping",
    stage: "Pronto para conectar canais",
    quickActions: ["Conectar marketplaces", "Importar pedidos", "Criar regras operacionais"],
    filters: ["Canal", "Status", "Pagamento", "Envio", "SLA"],
    columns: ["Pedido", "Canal", "Cliente", "Pagamento", "Envio", "Status", "Atualizado em"],
    kpis: [
      {
        label: "Fila operacional",
        value: "Sem pedidos sincronizados",
        hint: "Conecte o primeiro canal para iniciar a esteira omnichannel.",
      },
      {
        label: "Eventos rastreáveis",
        value: "Histórico habilitado",
        hint: "O schema já suporta eventos por pedido e mudanças de status.",
      },
      {
        label: "Pós-venda",
        value: "Devoluções e trocas prontas",
        hint: "Fluxos mapeados para cancelamento, troca e devolução.",
      },
    ],
    aiPrompts: [
      "Quais pedidos estão em risco de atraso por canal?",
      "Mostre divergências entre pagamento aprovado e envio parado.",
      "Quais pedidos exigem ação humana hoje?",
    ],
    integrations: ["Mercado Livre", "Shopee", "Amazon", "Magalu", "TikTok Shop", "PDV", "Loja própria"],
    guardrails: [
      "Cada pedido pertence a um workspace.",
      "Eventos operacionais ficam auditáveis.",
      "Estados vazios permanecem honestos até a conexão real dos canais.",
    ],
    emptyStateTitle: "Nenhum pedido sincronizado ainda",
    emptyStateDescription:
      "A central OMS está pronta. Assim que você integrar um canal ou importar pedidos, a fila unificada começa a operar aqui.",
  },
  products: {
    slug: "products",
    label: "Erizon Catalog",
    title: "Catálogo mestre de produtos e SKUs",
    subtitle: "Base única para produto, variante, custo, preço, código de barras e margem.",
    description:
      "O catálogo foi desenhado para alimentar OMS, estoque, marketplaces, e-commerce, fornecedores e pricing agent sem duplicidade operacional.",
    icon: "package",
    stage: "Pronto para cadastrar SKUs",
    quickActions: ["Novo produto", "Importar planilha", "Mapear variantes"],
    filters: ["Categoria", "Marca", "Status", "Margem", "Fornecedor principal"],
    columns: ["Produto", "SKU", "Código de barras", "Custo", "Preço", "Margem", "Status"],
    kpis: [
      {
        label: "Catálogo centralizado",
        value: "Sem SKUs cadastrados",
        hint: "Cadastre o primeiro produto para ativar estoque, vendas e pricing.",
      },
      {
        label: "Estrutura fiscal",
        value: "Compatível com NCM e CFOP",
        hint: "Produtos podem herdar perfis fiscais sem retrabalho.",
      },
      {
        label: "Variações",
        value: "Pronto para variantes",
        hint: "A tabela de variantes suporta grade e atributos por canal.",
      },
    ],
    aiPrompts: [
      "Quais SKUs precisam revisão de margem?",
      "Quais produtos estão sem código de barras ou custo?",
      "Quais anúncios estão usando catálogo incompleto?",
    ],
    integrations: ["XML", "Planilha", "Cadastro manual", "ERP futuro", "Fornecedores"],
    guardrails: [
      "Catálogo é multiempresa por workspace.",
      "SKU e código de barras podem ser indexados para integração oficial.",
      "Nada é pré-populado com dados artificiais.",
    ],
    emptyStateTitle: "Seu catálogo ainda não começou",
    emptyStateDescription:
      "Use o catálogo mestre como a fonte oficial de dados. O restante da plataforma passa a operar a partir daqui.",
  },
  stock: {
    slug: "stock",
    label: "Erizon Stock",
    title: "Gestão inteligente de estoque",
    subtitle: "Controle físico, virtual, reservado, em trânsito e compartilhado por filial.",
    description:
      "A estrutura suporta múltiplas localizações, movimentos auditáveis, alertas de ruptura e leitura da saúde de estoque com apoio de IA.",
    icon: "boxes",
    stage: "Pronto para entradas e saldo por local",
    quickActions: ["Registrar entrada", "Criar localização", "Importar XML"],
    filters: ["Filial", "Localização", "Situação", "Saldo mínimo", "Cobertura"],
    columns: ["SKU", "Localização", "Disponível", "Reservado", "Trânsito", "Mínimo", "Cobertura"],
    kpis: [
      {
        label: "Cobertura de estoque",
        value: "Sem histórico suficiente",
        hint: "A IA usa movimentos reais para estimar risco de ruptura.",
      },
      {
        label: "Visão por local",
        value: "Estrutura criada",
        hint: "Filiais e áreas logísticas podem operar com estoque segregado.",
      },
      {
        label: "Reabastecimento",
        value: "Sugestões prontas",
        hint: "O banco já suporta recomendações de compra por fornecedor.",
      },
    ],
    aiPrompts: [
      "Quais SKUs vão romper nos próximos 14 dias?",
      "Quais produtos estão parados acima do ideal?",
      "Mostre giro, cobertura e excesso por filial.",
    ],
    integrations: ["Código de barras", "XML", "Planilha", "Fornecedores", "WMS"],
    guardrails: [
      "Todo movimento exige workspace_id.",
      "Localizações suportam PDV, armazém e trânsito.",
      "A IA só opina sobre dados realmente capturados.",
    ],
    emptyStateTitle: "Nenhum saldo disponível por enquanto",
    emptyStateDescription:
      "Assim que os primeiros movimentos forem registrados, a visão consolidada de estoque passa a refletir saldo real por filial e local.",
  },
  wms: {
    slug: "wms",
    label: "Erizon WMS",
    title: "Operação logística orientada por fluxo",
    subtitle: "Recebimento, conferência, picking, packing, expedição e rastreabilidade.",
    description:
      "A base do módulo já acomoda movimentação, status logístico por pedido e histórico operacional para evoluir até uma operação WMS completa.",
    icon: "warehouse",
    stage: "Estrutura visual pronta para expansão",
    quickActions: ["Criar onda de picking", "Mapear docas", "Gerar etiquetas"],
    filters: ["Etapa", "Prioridade", "Transportadora", "Filial", "Equipe"],
    columns: ["Tarefa", "Pedido", "Etapa", "Responsável", "Prioridade", "Status", "Última atualização"],
    kpis: [
      {
        label: "Recebimento a expedição",
        value: "Fluxo modelado",
        hint: "O produto já reserva espaço para a esteira logística completa.",
      },
      {
        label: "Rastreabilidade",
        value: "Histórico disponível",
        hint: "Cada ação pode ser persistida para auditoria operacional.",
      },
      {
        label: "Automação futura",
        value: "Etiquetas e tracking previstos",
        hint: "A arquitetura já contempla integrações oficiais de transporte.",
      },
    ],
    aiPrompts: [
      "Quais pedidos travaram entre picking e packing?",
      "Onde existe gargalo operacional por filial?",
      "Quais tarefas exigem repriorização hoje?",
    ],
    integrations: ["Transportadoras", "Rastreio", "Etiquetas", "Pedidos OMS", "Estoque"],
    guardrails: [
      "Fluxos ainda vazios ficam como preparação de operação real.",
      "Adoção futura pode ser gradual por filial.",
      "Sem inventar tarefas inexistentes.",
    ],
    emptyStateTitle: "Sua operação WMS ainda não começou",
    emptyStateDescription:
      "Quando os pedidos e localizações estiverem ativos, o WMS passa a enxergar a operação ponta a ponta.",
  },
  marketplaces: {
    slug: "marketplaces",
    label: "Erizon Marketplace",
    title: "Hub inteligente de marketplaces",
    subtitle: "Catálogo, anúncios, estoque, preço, ranking e inteligência competitiva.",
    description:
      "Este módulo prepara a base para integrações oficiais e operação massiva de catálogo, conectando produto, estoque e performance comercial.",
    icon: "store",
    stage: "Pronto para catálogo e conectores",
    quickActions: ["Conectar conta", "Mapear anúncios", "Sincronizar catálogo"],
    filters: ["Marketplace", "Status do anúncio", "Buy Box", "Competitividade", "Estoque sincronizado"],
    columns: ["Anúncio", "Canal", "SKU", "Preço", "Estoque", "Buy Box", "Status"],
    kpis: [
      {
        label: "Conectores planejados",
        value: "Mercado Livre a Shein",
        hint: "A plataforma já foi desenhada com foco em integrações oficiais por API.",
      },
      {
        label: "Sincronização de catálogo",
        value: "Depende de conta conectada",
        hint: "A mesma base alimenta múltiplos canais sem duplicar cadastro.",
      },
      {
        label: "Pricing competitivo",
        value: "Pronto para IA",
        hint: "Pricing Agent poderá atuar sobre taxa, frete, imposto e concorrência.",
      },
    ],
    aiPrompts: [
      "Quais anúncios estão perdendo Buy Box por preço ou prazo?",
      "Onde existe ruptura de estoque afetando ranking?",
      "Quais catálogos precisam melhoria de conteúdo?",
    ],
    integrations: ["Mercado Livre", "Shopee", "Amazon", "Magalu", "TikTok Shop", "Shein"],
    guardrails: [
      "Canais só aparecem com dados reais após autenticação oficial.",
      "Preço e estoque permanecem centralizados no workspace.",
      "Sem espelhar anúncio com conteúdo fictício.",
    ],
    emptyStateTitle: "Nenhuma conta de marketplace conectada",
    emptyStateDescription:
      "Quando as contas oficiais forem autenticadas, este hub passa a consolidar anúncios, estoque e performance em um só lugar.",
  },
  ecommerce: {
    slug: "ecommerce",
    label: "Erizon E-commerce",
    title: "Motor de integração para lojas próprias",
    subtitle: "Pedidos, estoque, financeiro e relatórios centralizados por canal.",
    description:
      "Conectores preparados para Shopify, WooCommerce, Nuvemshop, Tray, Loja Integrada, VTEX e APIs proprietárias, com evolução futura para a Store Cloud própria.",
    icon: "globe",
    stage: "Pronto para conectores e Store Cloud",
    quickActions: ["Conectar loja", "Mapear pedidos", "Publicar catálogo"],
    filters: ["Plataforma", "Status", "Sincronização", "Canal", "Checkout"],
    columns: ["Loja", "Plataforma", "Pedidos", "Estoque", "Financeiro", "Última sync", "Status"],
    kpis: [
      {
        label: "Lojas próprias",
        value: "Nenhuma integração ativa",
        hint: "Conecte a primeira loja para trazer pedidos e catálogo.",
      },
      {
        label: "Store Cloud",
        value: "Base visual preparada",
        hint: "A primeira versão já reserva espaço para catálogo, checkout e CRM integrados.",
      },
      {
        label: "Canal próprio",
        value: "Foco em margem",
        hint: "O sistema foi desenhado para comparar faturamento e lucro por canal.",
      },
    ],
    aiPrompts: [
      "Qual canal próprio entrega mais margem por SKU?",
      "Quais pedidos falharam na sincronização?",
      "Onde vale reforçar o mix da loja própria?",
    ],
    integrations: ["Shopify", "WooCommerce", "Nuvemshop", "Tray", "Loja Integrada", "VTEX", "APIs próprias"],
    guardrails: [
      "Conectores oficiais entram sem mudar a modelagem do produto.",
      "Loja própria divide o mesmo estoque e financeiro.",
      "Sem criar pedidos artificiais no canal próprio.",
    ],
    emptyStateTitle: "Nenhuma loja conectada ainda",
    emptyStateDescription:
      "A infraestrutura já está pronta para receber canais próprios e sustentar a evolução para a Erizon Store Cloud.",
  },
  pos: {
    slug: "pos",
    label: "Erizon POS",
    title: "PDV inteligente com impacto imediato no estoque e financeiro",
    subtitle: "Venda rápida, meios de pagamento, fidelidade, comissões e metas.",
    description:
      "A arquitetura do PDV compartilha catálogo, estoque e financeiro com o restante da operação para evitar retrabalho entre loja física e digital.",
    icon: "scan",
    stage: "Pronto para frente de caixa",
    quickActions: ["Abrir caixa", "Cadastrar vendedor", "Configurar meios de pagamento"],
    filters: ["Loja", "Operador", "Forma de pagamento", "Status do caixa", "Turno"],
    columns: ["Venda", "Loja", "Operador", "Itens", "Pagamento", "Valor", "Status"],
    kpis: [
      {
        label: "Venda rápida",
        value: "Sem transações registradas",
        hint: "Assim que o PDV operar, estoque e financeiro são atualizados automaticamente.",
      },
      {
        label: "Relacionamento",
        value: "Cashback e fidelidade previstos",
        hint: "Base pronta para programas de recorrência e retenção.",
      },
      {
        label: "Performance de equipe",
        value: "Metas por vendedor",
        hint: "Comissões e produtividade podem ser acompanhadas por workspace.",
      },
    ],
    aiPrompts: [
      "Quais vendedores têm maior ticket e conversão?",
      "Como o PDV impactou o giro de estoque hoje?",
      "Quais meios de pagamento concentram mais margem?",
    ],
    integrations: ["Leitor de código de barras", "PIX", "Cartão", "Dinheiro", "Crediário", "Cashback"],
    guardrails: [
      "Vendas de loja física usam o mesmo catálogo central.",
      "Fechamento de caixa não precisa de dados mockados para funcionar depois.",
      "Adoção pode começar por uma loja piloto.",
    ],
    emptyStateTitle: "Nenhuma venda de PDV registrada",
    emptyStateDescription:
      "Configure operadores, meios de pagamento e catálogo para iniciar as vendas presenciais com sincronização total.",
  },
  finance: {
    slug: "finance",
    label: "Erizon Finance",
    title: "Central financeira e gerencial do comércio",
    subtitle: "Fluxo de caixa, contas, perdas, conciliação e indicadores estratégicos.",
    description:
      "A camada financeira unifica entradas e saídas dos canais, permitindo que a inteligência analise margem, EBITDA, ROI e ticket médio em cima da verdade operacional.",
    icon: "wallet",
    stage: "Pronto para transações e indicadores",
    quickActions: ["Registrar receita", "Lançar despesa", "Conectar banco"],
    filters: ["Conta", "Categoria", "Tipo", "Canal", "Conciliação"],
    columns: ["Lançamento", "Categoria", "Canal", "Competência", "Valor", "Situação", "Conciliação"],
    kpis: [
      {
        label: "Fluxo de caixa",
        value: "Sem transações ainda",
        hint: "Comece lançando contas ou conectando os canais que originam receita.",
      },
      {
        label: "Indicadores",
        value: "Receita, lucro e margem prontos",
        hint: "Os cálculos podem evoluir conforme a qualidade do dado operacional aumenta.",
      },
      {
        label: "Conciliação",
        value: "Preparada por canal",
        hint: "Marketplace, loja própria e PDV podem convergir na mesma visão financeira.",
      },
    ],
    aiPrompts: [
      "Quais despesas cresceram sem contrapartida de margem?",
      "Onde o lucro está comprimido por frete, taxa ou imposto?",
      "Qual canal gera mais EBITDA hoje?",
    ],
    integrations: ["Pedidos", "PDV", "Marketplaces", "Bancos", "Fornecedores", "Fiscal"],
    guardrails: [
      "Sem números inventados no dashboard.",
      "Transações pertencem a um workspace e podem ser auditadas.",
      "Finance Agent trabalha com dados reais e contexto do negócio.",
    ],
    emptyStateTitle: "Sua central financeira está pronta para começar",
    emptyStateDescription:
      "Lance receitas, despesas e contas a pagar/receber para transformar a operação em indicadores confiáveis.",
  },
  tax: {
    slug: "tax",
    label: "Erizon Tax",
    title: "Camada fiscal inteligente com apoio de IA",
    subtitle: "NF-e, NFC-e, NFS-e, cupons, NCM, CFOP e tributos com alertas de inconsistência.",
    description:
      "O objetivo aqui é organizar perfis fiscais por produto e operação, oferecer alertas e preparar o sistema para integrações futuras sem substituir o trabalho contábil.",
    icon: "receipt",
    stage: "Pronto para perfis e monitoramento",
    quickActions: ["Criar perfil fiscal", "Mapear NCM", "Revisar inconsistências"],
    filters: ["Documento", "Tributo", "Canal", "UF", "Risco"],
    columns: ["Perfil", "Escopo", "NCM", "CFOP", "Tributos", "Risco", "Última revisão"],
    kpis: [
      {
        label: "Base fiscal",
        value: "Sem perfis publicados",
        hint: "Associe regras fiscais ao catálogo para ganhar consistência operacional.",
      },
      {
        label: "Alertas de IA",
        value: "Dependem de dados reais",
        hint: "O Tax Agent só sinaliza inconsistências a partir do que foi registrado.",
      },
      {
        label: "Integração futura",
        value: "NF-e e NFC-e mapeadas",
        hint: "A modelagem já foi preparada para expansão com serviços oficiais.",
      },
    ],
    aiPrompts: [
      "Quais produtos estão sem NCM ou CFOP associado?",
      "Existe risco fiscal em algum canal específico?",
      "Onde há divergência de tributação entre produtos similares?",
    ],
    integrations: ["NF-e", "NFC-e", "NFS-e", "Cupom fiscal", "Produtos", "Financeiro"],
    guardrails: [
      "A IA apoia, mas não substitui contador.",
      "Perfis fiscais ficam por workspace e com auditoria.",
      "Sem inferir tributos inexistentes.",
    ],
    emptyStateTitle: "Nenhum perfil fiscal configurado",
    emptyStateDescription:
      "Crie perfis fiscais por operação e produto para começar a monitorar inconsistências de forma organizada.",
  },
  suppliers: {
    slug: "suppliers",
    label: "Erizon Suppliers",
    title: "Rede inteligente de fornecedores e compra assistida",
    subtitle: "Catálogo, preço, estoque, cotação, margem e oportunidades de compra.",
    description:
      "A base foi desenhada para evoluir de cadastro simples até uma rede com inteligência de suprimentos e recomendação automática de compra.",
    icon: "truck",
    stage: "Pronto para sourcing e comparação",
    quickActions: ["Novo fornecedor", "Importar catálogo", "Criar cotação"],
    filters: ["Tipo", "Categoria", "Disponibilidade", "Margem", "Lead time"],
    columns: ["Fornecedor", "Tipo", "Produto", "Preço", "Disponível", "Lead time", "Condição"],
    kpis: [
      {
        label: "Base de fornecimento",
        value: "Sem parceiros cadastrados",
        hint: "Cadastre fornecedores para habilitar comparação e recomendação.",
      },
      {
        label: "Compra inteligente",
        value: "Sugestões prontas",
        hint: "A IA poderá cruzar ruptura iminente, margem e disponibilidade real.",
      },
      {
        label: "Cotação",
        value: "Fluxo desenhado",
        hint: "Estrutura pronta para múltiplas propostas e decisão assistida.",
      },
    ],
    aiPrompts: [
      "Quais itens precisam cotação urgente?",
      "Onde existe oportunidade de economia por fornecedor?",
      "Quais compras melhoram margem sem prejudicar prazo?",
    ],
    integrations: ["Importadores", "Distribuidores", "Atacadistas", "Indústrias", "Planilhas", "Estoque"],
    guardrails: [
      "Insights de compra dependem de saldo, giro e catálogo reais.",
      "Cada fornecedor pertence ao workspace.",
      "Sem sugerir economia fictícia enquanto não houver dados reais.",
    ],
    emptyStateTitle: "Sua rede de fornecedores ainda está vazia",
    emptyStateDescription:
      "Ao cadastrar fornecedores e catálogos, a plataforma passa a sugerir compras com base em risco de ruptura e margem.",
  },
  agents: {
    slug: "agents",
    label: "Erizon Agents",
    title: "Agentes especializados para decisão operacional e estratégica",
    subtitle: "Finance, Stock, Pricing, Catalog, Supply, Tax, Growth e Channel Performance.",
    description:
      "Os agentes compartilham memória de workspace e foram desenhados para operar sobre dados reais de catálogo, pedidos, estoque, financeiro e canais.",
    icon: "bot",
    stage: "Pronto para orquestração por workspace",
    quickActions: ["Ativar agente", "Definir escopo", "Revisar insights"],
    filters: ["Agente", "Status", "Frequência", "Criticidade", "Área"],
    columns: ["Agente", "Objetivo", "Escopo", "Último insight", "Frequência", "Status", "Responsável"],
    kpis: [
      {
        label: "Especialização",
        value: "8 agentes modelados",
        hint: "Cada agente já nasce com missão clara dentro do sistema operacional.",
      },
      {
        label: "Memória compartilhada",
        value: "Por workspace",
        hint: "Decisões, análises e preferências podem retroalimentar os próximos insights.",
      },
      {
        label: "Governança",
        value: "Sem automação cega",
        hint: "A plataforma favorece explicabilidade antes de qualquer ação crítica.",
      },
    ],
    aiPrompts: [
      "O que aconteceu no meu negócio hoje?",
      "Onde devo investir ou cortar custo nesta semana?",
      "Quais decisões o sistema recomenda agora?",
    ],
    integrations: ["Financeiro", "Estoque", "Pedidos", "Marketplaces", "Fiscal", "Fornecedores", "Memória"],
    guardrails: [
      "Agentes atuam por workspace e com contexto isolado.",
      "Insights podem ser auditados e versionados.",
      "Sem responder com base em dados permanentes fictícios.",
    ],
    emptyStateTitle: "Nenhum agente ativado ainda",
    emptyStateDescription:
      "Ative os agentes conforme as áreas do negócio amadurecem. A memória compartilhada garante continuidade entre análises.",
  },
  memory: {
    slug: "memory",
    label: "BUSINESS MEMORY",
    title: "Memória operacional única do workspace",
    subtitle: "Vendas, fornecedores, decisões, sazonalidades e aprendizados dos agentes.",
    description:
      "A memória empresarial é o tecido que conecta histórico operacional, preferências e insights para tornar a IA cumulativa em vez de descartável.",
    icon: "brain",
    stage: "Pronta para persistência contextual",
    quickActions: ["Registrar decisão", "Anexar insight", "Criar memória manual"],
    filters: ["Tipo", "Origem", "Agente", "Prioridade", "Recência"],
    columns: ["Memória", "Tipo", "Origem", "Resumo", "Relevância", "Criada em", "Atualizada em"],
    kpis: [
      {
        label: "Contexto acumulado",
        value: "Sem memórias salvas",
        hint: "Decisões e eventos relevantes podem ser persistidos com rastreabilidade.",
      },
      {
        label: "Aprendizado do workspace",
        value: "Sazonalidade preparada",
        hint: "A estrutura já aceita histórico estratégico, operacional e analítico.",
      },
      {
        label: "Integração com agentes",
        value: "Bidirecional",
        hint: "Insights podem alimentar memória e memória pode orientar novos insights.",
      },
    ],
    aiPrompts: [
      "Quais padrões sazonais já detectamos neste workspace?",
      "Que decisões recentes mudaram o mix de produto?",
      "O que os agentes já aprenderam sobre margem e ruptura?",
    ],
    integrations: ["Agentes IA", "Pedidos", "Produtos", "Fornecedores", "Estratégia", "Dashboard"],
    guardrails: [
      "Memória é isolada por workspace.",
      "Entradas podem ser auditadas por usuário e origem.",
      "Nada é preenchido sem sinal real do negócio.",
    ],
    emptyStateTitle: "A memória do workspace ainda está vazia",
    emptyStateDescription:
      "Conforme você usar a plataforma, decisões, insights e contextos importantes podem ser preservados para orientar a próxima análise.",
  },
  "data-cloud": {
    slug: "data-cloud",
    label: "Erizon Data Cloud",
    title: "Data Cloud operacional para comercio",
    subtitle: "Fontes, metricas, indicadores executivos e modelos preditivos em uma camada unica.",
    description:
      "O Data Cloud consolida sinais de pedidos, catalogo, estoque, financeiro, canais, fornecedores e agentes para alimentar decisoes, dashboards e automacoes.",
    icon: "brain",
    stage: "Pronto para consolidacao de fontes",
    quickActions: ["Publicar snapshot", "Mapear fonte", "Treinar modelo"],
    filters: ["Fonte", "Metrica", "Modelo", "Periodo", "Confianca"],
    columns: ["Fonte", "Metrica", "Valor", "Tendencia", "Modelo", "Observado em", "Status"],
    kpis: [
      {
        label: "Fontes priorizadas",
        value: "9 fontes mapeadas",
        hint: "A cobertura inicial conecta operacao, canais, financeiro e IA.",
      },
      {
        label: "Metricas unificadas",
        value: "Warehouse preparado",
        hint: "Snapshots ficam prontos para Executive Center, agentes e API.",
      },
      {
        label: "Predicao",
        value: "Modelos versionados",
        hint: "Ruptura, receita, churn e performance podem evoluir sem trocar o core.",
      },
    ],
    aiPrompts: [
      "Quais fontes ainda estao silenciosas no workspace?",
      "Quais metricas mudaram de tendencia nos ultimos dias?",
      "Que modelo merece prioridade para aumentar decisao automatizada?",
    ],
    integrations: ["Pedidos", "Estoque", "Financeiro", "Marketplaces", "Fornecedores", "Agentes", "API publica"],
    guardrails: [
      "Snapshots sempre pertencem a um workspace.",
      "Modelos registram versao, horizonte e confianca.",
      "Sem preencher metricas com dados simulados em producao.",
    ],
    emptyStateTitle: "Nenhum dado consolidado ainda",
    emptyStateDescription:
      "Publique o primeiro snapshot real para ativar indicadores executivos, modelos preditivos e contexto persistente para os agentes.",
  },
  "event-bus": {
    slug: "event-bus",
    label: "Erizon Event Bus",
    title: "Barramento de eventos e reacoes",
    subtitle: "Event store, webhooks, triggers e fila de entrega para manter a plataforma sincronizada.",
    description:
      "O Event Bus transforma mudancas operacionais em eventos auditaveis, permitindo automacoes, notificacoes, integracoes externas e agentes reativos.",
    icon: "spark",
    stage: "Pronto para publicar e entregar eventos",
    quickActions: ["Publicar evento", "Criar webhook", "Configurar trigger"],
    filters: ["Modulo", "Evento", "Status", "Destino", "Retry"],
    columns: ["Evento", "Modulo", "Agregado", "Status", "Destino", "Ocorrido em", "Entrega"],
    kpis: [
      {
        label: "Event store",
        value: "Historico auditavel",
        hint: "Cada sinal relevante pode ser persistido com payload e origem.",
      },
      {
        label: "Webhooks",
        value: "Destinos por workspace",
        hint: "Parceiros e sistemas externos recebem apenas eventos autorizados.",
      },
      {
        label: "Confiabilidade",
        value: "Retry e fila",
        hint: "Entregas falhas ficam visiveis para reprocessamento e auditoria.",
      },
    ],
    aiPrompts: [
      "Quais eventos falharam ou ficaram em retry?",
      "Que modulos ainda nao estao emitindo sinais?",
      "Quais triggers devem virar automacoes prioritarias?",
    ],
    integrations: ["Automacoes", "Agentes", "Webhooks", "Mobile", "API publica", "Auditoria"],
    guardrails: [
      "Eventos sao isolados por workspace.",
      "Webhooks nao devem expor payload sensivel sem permissao.",
      "Falhas de entrega ficam rastreaveis em vez de desaparecerem.",
    ],
    emptyStateTitle: "Nenhum evento publicado ainda",
    emptyStateDescription:
      "Quando pedidos, estoque, financeiro ou agentes emitirem sinais, o barramento passa a mostrar o historico completo e as reacoes conectadas.",
  },
  "market-intelligence": {
    slug: "market-intelligence",
    label: "Erizon Market Intelligence",
    title: "Inteligencia de mercado e concorrencia",
    subtitle: "Sinais externos, watchlist competitiva e recomendacoes acionaveis por canal e categoria.",
    description:
      "O modulo cruza tendencias, concorrentes e oportunidades com a realidade interna de margem, estoque e capacidade operacional.",
    icon: "globe",
    stage: "Pronto para sinais externos",
    quickActions: ["Cadastrar fonte", "Monitorar concorrente", "Publicar recomendacao"],
    filters: ["Fonte", "Categoria", "Direcao", "Prioridade", "Concorrente"],
    columns: ["Sinal", "Fonte", "Categoria", "Score", "Direcao", "Recomendacao", "Observado em"],
    kpis: [
      {
        label: "Sinais de mercado",
        value: "Pipeline preparado",
        hint: "Tendencias podem alimentar Growth, Pricing e Executive Center.",
      },
      {
        label: "Watchlist",
        value: "Concorrentes rastreaveis",
        hint: "Acompanhamento explicito evita decisoes baseadas em percepcao solta.",
      },
      {
        label: "Recomendacoes",
        value: "Priorizacao por impacto",
        hint: "Cada recomendacao pode carregar confianca, status e acao sugerida.",
      },
    ],
    aiPrompts: [
      "Quais sinais externos merecem acao nesta semana?",
      "Que concorrente esta pressionando preco ou sortimento?",
      "Onde existe oportunidade de crescimento com estoque disponivel?",
    ],
    integrations: ["Marketplaces", "Catalogo", "Pricing Agent", "Growth Agent", "Data Cloud"],
    guardrails: [
      "Sinais externos nao substituem dado financeiro real.",
      "Recomendacoes devem explicitar fonte, confianca e impacto esperado.",
      "Watchlists ficam por workspace.",
    ],
    emptyStateTitle: "Nenhum sinal de mercado consolidado",
    emptyStateDescription:
      "Cadastre fontes e concorrentes relevantes para transformar inteligencia externa em decisao conectada ao seu estoque, margem e canais.",
  },
  automations: {
    slug: "automations",
    label: "Erizon Automations",
    title: "Motor de automacoes com governanca",
    subtitle: "Regras, playbooks e execucoes auditaveis para reduzir trabalho manual sem perder controle.",
    description:
      "Automacoes conectam Event Bus, agentes, notificacoes e aprovacoes humanas para responder a ruptura, margem, queda de receita e operacoes sensiveis.",
    icon: "settings",
    stage: "Pronto para regras do workspace",
    quickActions: ["Criar regra", "Ativar playbook", "Revisar execucoes"],
    filters: ["Modulo", "Gatilho", "Status", "Prioridade", "Ultima execucao"],
    columns: ["Regra", "Gatilho", "Modulo", "Acao", "Status", "Ultima execucao", "Resultado"],
    kpis: [
      {
        label: "Playbooks",
        value: "Fluxos iniciais mapeados",
        hint: "Estoque baixo, margem comprimida e queda de faturamento ja tem trilhas claras.",
      },
      {
        label: "Auditoria",
        value: "Execucoes persistidas",
        hint: "Cada disparo guarda status, payload e resultado esperado.",
      },
      {
        label: "Controle humano",
        value: "Aprovacoes previstas",
        hint: "Acoes sensiveis podem exigir confirmacao antes de impacto operacional.",
      },
    ],
    aiPrompts: [
      "Que regra automatizaria mais trabalho manual hoje?",
      "Quais automacoes falharam ou precisam revisao?",
      "Onde devo exigir aprovacao humana antes de executar?",
    ],
    integrations: ["Event Bus", "Agentes", "Mobile", "Estoque", "Financeiro", "Fornecedores"],
    guardrails: [
      "Automacoes sao habilitadas por workspace.",
      "Acoes criticas devem ser auditaveis e reversiveis quando possivel.",
      "Sem executar mudancas externas sem credencial e autorizacao adequada.",
    ],
    emptyStateTitle: "Nenhuma regra criada ainda",
    emptyStateDescription:
      "Comece com playbooks de baixo risco e alto impacto para notificar, priorizar e preparar acoes antes de automatizar execucao critica.",
  },
  mobile: {
    slug: "mobile",
    label: "Erizon Mobile",
    title: "Camada mobile para decisao e operacao rapida",
    subtitle: "Dispositivos, push, aprovacoes e superficies essenciais para o app React Native.",
    description:
      "A area mobile aproveita o mesmo backend, permissoes, API publica e contexto do workspace para evitar um produto paralelo.",
    icon: "scan",
    stage: "Pronto para contratos mobile",
    quickActions: ["Registrar dispositivo", "Enviar push", "Abrir aprovacao"],
    filters: ["Plataforma", "Push", "Versao", "Status", "Ultimo acesso"],
    columns: ["Dispositivo", "Plataforma", "Versao", "Push", "Aprovacao", "Ultimo acesso", "Status"],
    kpis: [
      {
        label: "Dispositivos",
        value: "Registro preparado",
        hint: "Cada device fica associado ao workspace e ao usuario autorizado.",
      },
      {
        label: "Push",
        value: "Alertas por contexto",
        hint: "Notificacoes podem nascer de eventos, agentes e automacoes.",
      },
      {
        label: "Aprovacoes",
        value: "Fila operacional",
        hint: "Decisoes de compra, preco e campanha podem ser resolvidas no app.",
      },
    ],
    aiPrompts: [
      "Quais decisoes precisam aprovacao mobile hoje?",
      "Que alerta executivo deve virar push prioritario?",
      "Quais usuarios ou dispositivos estao inativos?",
    ],
    integrations: ["API publica", "Event Bus", "Automacoes", "Executive Center", "Agentes", "Billing"],
    guardrails: [
      "Mobile deve respeitar as mesmas permissoes do app web.",
      "Push nao deve carregar dados sensiveis sem necessidade.",
      "Aprovacoes precisam de trilha de auditoria.",
    ],
    emptyStateTitle: "Nenhum dispositivo mobile registrado",
    emptyStateDescription:
      "Quando o app conectar o primeiro device, esta area passa a mostrar readiness, push, versoes e decisoes pendentes do workspace.",
  },
};

export const settingsHighlights = [
  "Autenticação Supabase com criação automática de workspace",
  "RLS por workspace em todas as tabelas operacionais",
  "Arquitetura preparada para orquestração de IA via Groq",
  "Arquitetura pronta para integrações oficiais via API",
  "Layout SaaS premium com empty states honestos",
];

export const executiveQuestions = [
  "O que aconteceu no meu negócio hoje?",
  "Onde o lucro está crescendo ou comprimindo?",
  "Quais produtos merecem compra, corte ou aceleração?",
  "Qual canal é mais lucrativo e qual merece correção agora?",
];

export const copilotPrompts = [
  "Onde estou perdendo dinheiro?",
  "Quais produtos devo comprar agora?",
  "Qual marketplace está mais rentável hoje?",
  "Quais produtos devo abandonar?",
];
