// Conteúdo institucional centralizado em uma única fonte de verdade.
// Por que aqui (e não inline nas páginas)?
// 1) Desacoplamento: o componente apenas RENDERIZA — não conhece o conteúdo.
// 2) Substituível: trocar por um CMS/Headless (Strapi, Sanity) só requer
//    mudar o handler do mockServer; tipos e componentes permanecem iguais.
// 3) i18n-ready: facilita futura internacionalização (basta retornar o objeto
//    correto baseado em locale no handler da API).

import type { AboutContent, HistoryContent, TermsContent } from '@/types';

// --- Sobre Nós ----------------------------------------------------------------
// Estrutura "seções" ao invés de campos fixos (mission, vision, values) para
// permitir que o time de marketing adicione/remova blocos sem mudar o front.
export const aboutContent: AboutContent = {
  companyName: 'MarketBR',
  tagline: 'O marketplace que conecta vendedores e compradores em todo o Brasil.',
  description:
    'Somos uma plataforma de comércio eletrônico criada para democratizar o acesso ao mercado digital, oferecendo ferramentas profissionais para pequenos e grandes vendedores e uma experiência de compra segura e moderna para milhões de brasileiros.',
  sections: [
    {
      id: 'quem-somos',
      title: 'Quem Somos',
      body: 'A MarketBR nasceu em 2024 com o propósito de simplificar o e-commerce no Brasil. Reunimos tecnologia, logística inteligente e curadoria de vendedores para entregar uma experiência de compra confiável, rápida e justa para todos os envolvidos.',
    },
    {
      id: 'missao',
      title: 'Nossa Missão',
      body: 'Conectar pessoas a produtos que transformam o dia a dia, oferecendo uma plataforma justa, segura e acessível para vendedores de todos os portes.',
    },
    {
      id: 'visao',
      title: 'Nossa Visão',
      body: 'Ser, até 2030, o marketplace mais confiável da América Latina, reconhecido pela qualidade da experiência e pela força da comunidade de vendedores.',
    },
    {
      id: 'valores',
      title: 'Nossos Valores',
      body: 'Transparência em cada transação, respeito ao cliente, valorização do pequeno empreendedor, inovação contínua e responsabilidade social em tudo que fazemos.',
    },
  ],
};

// --- História (timeline) ------------------------------------------------------
// Modelado como array ordenado para preservar a sequência cronológica e
// permitir renderização simples como timeline vertical.
export const historyContent: HistoryContent = {
  title: 'Nossa História',
  intro: 'Da ideia inicial ao marketplace nacional — conheça os principais marcos que construíram a MarketBR.',
  milestones: [
    {
      year: '2024',
      title: 'Fundação da empresa',
      description:
        'Um pequeno time de engenheiros e empreendedores se uniu com a missão de criar um marketplace mais justo e moderno para o mercado brasileiro.',
    },
    {
      year: '2025',
      title: 'Lançamento da plataforma',
      description:
        'Subimos a primeira versão pública da MarketBR com mais de 500 vendedores parceiros e cobertura logística para todas as capitais do país.',
    },
    {
      year: '2026',
      title: 'Expansão do marketplace',
      description:
        'Atingimos a marca de 10.000 vendedores ativos, lançamos centros de distribuição nas 5 regiões do Brasil e estreamos nosso programa de frete inteligente.',
    },
    {
      year: '2027',
      title: 'Marketplace inteligente',
      description:
        'Investimos em recomendação personalizada, otimização logística baseada em distância e ferramentas avançadas para sellers profissionais.',
    },
  ],
};

// --- Termos de Uso ------------------------------------------------------------
// Estrutura de seções permite renderização tipográfica consistente e futura
// integração com índice (TOC) automático lateralmente.
export const termsContent: TermsContent = {
  title: 'Termos de Uso',
  lastUpdated: '2026-01-15',
  intro:
    'Ao utilizar a MarketBR, você concorda com os termos descritos abaixo. Recomendamos a leitura atenta antes de cadastrar-se ou realizar qualquer compra na plataforma.',
  sections: [
    {
      id: 'uso-da-plataforma',
      title: '1. Uso da Plataforma',
      body: 'A MarketBR concede ao usuário uma licença pessoal, não exclusiva e intransferível para utilizar o site e seus serviços para fins lícitos. É proibido qualquer uso que viole leis vigentes, direitos de terceiros ou as boas práticas comerciais.',
    },
    {
      id: 'responsabilidade-do-usuario',
      title: '2. Responsabilidade do Usuário',
      body: 'O usuário é responsável pela veracidade dos dados informados no cadastro, pela guarda das credenciais de acesso e por todas as ações realizadas em sua conta. Compradores e vendedores devem manter conduta respeitosa nas comunicações dentro da plataforma.',
    },
    {
      id: 'politica-de-vendas',
      title: '3. Política de Vendas',
      body: 'Vendedores devem oferecer produtos lícitos, descrever fielmente as características, manter o estoque atualizado e cumprir os prazos estabelecidos. A MarketBR pode suspender anúncios que violem estas regras ou recebam reclamações reiteradas.',
    },
    {
      id: 'politica-de-entrega',
      title: '4. Política de Entrega',
      body: 'O prazo de entrega exibido no checkout considera o tempo de preparação do vendedor somado ao prazo da transportadora selecionada. Atrasos eventuais devem ser reportados via canal de atendimento e serão tratados conforme o Código de Defesa do Consumidor.',
    },
    {
      id: 'politica-de-cancelamento',
      title: '5. Política de Cancelamento e Devolução',
      body: 'O comprador tem direito ao arrependimento em até 7 dias corridos após o recebimento, conforme o art. 49 do CDC. Cancelamentos antes do envio podem ser solicitados diretamente no painel "Meus Pedidos" sem custo adicional.',
    },
    {
      id: 'privacidade',
      title: '6. Privacidade e Proteção de Dados',
      body: 'Coletamos e tratamos dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD). As informações são utilizadas para processar pedidos, melhorar a experiência e cumprir obrigações legais — nunca são vendidas a terceiros.',
    },
    {
      id: 'alteracoes',
      title: '7. Alterações dos Termos',
      body: 'A MarketBR pode atualizar estes termos a qualquer momento. Mudanças relevantes serão comunicadas por e-mail ou banner na plataforma com pelo menos 15 dias de antecedência.',
    },
  ],
};
