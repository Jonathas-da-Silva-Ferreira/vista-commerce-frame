/**
 * Simulated REST server that intercepts fetch calls when no backend is configured.
 * Mirrors real API contract so switching to a real backend requires only setting VITE_API_URL.
 *
 * Decisão arquitetural: interceptar fetch() ao invés de usar MSW (Mock Service Worker)
 * para evitar dependência extra e simplificar setup — adequado para protótipos.
 * Em produção, migrar para MSW ou backend real.
 */
import { products as initialProducts, categories } from '@/data/mockData';
import type { Product, Banner, PaginatedResponse, DistributionCenter, Carrier, ShippingOption, Review } from '@/types';

const products: Product[] = [...initialProducts];

// Store em memória de reviews — chave = productId para lookup O(1).
// Em produção, substituir por tabela relacional com índice em (product_id, user_id)
// para garantir constraint UNIQUE que previne reviews duplicadas no nível do banco.
const reviewsStore: Record<string, Review[]> = {};

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

// Centros de distribuição estrategicamente posicionados nas 5 regiões —
// garante que qualquer cliente no Brasil tenha um centro a menos de ~2000km
const distributionCenters: DistributionCenter[] = [
  { id: 'cd-sp', name: 'CD São Paulo', city: 'São Paulo', state: 'SP', latitude: -23.55, longitude: -46.63 },
  { id: 'cd-rj', name: 'CD Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', latitude: -22.91, longitude: -43.17 },
  { id: 'cd-pr', name: 'CD Curitiba', city: 'Curitiba', state: 'PR', latitude: -25.43, longitude: -49.27 },
  { id: 'cd-df', name: 'CD Brasília', city: 'Brasília', state: 'DF', latitude: -15.78, longitude: -47.93 },
  { id: 'cd-pe', name: 'CD Recife', city: 'Recife', state: 'PE', latitude: -8.05, longitude: -34.87 },
  { id: 'cd-am', name: 'CD Manaus', city: 'Manaus', state: 'AM', latitude: -3.12, longitude: -60.02 },
];

// Transportadoras disponíveis — cada uma com perfil diferente de custo/prazo.
// O multiplicador de distância escala o basePrice proporcionalmente à distância,
// permitindo que rotas mais longas fiquem progressivamente mais caras.
const carriers: Carrier[] = [
  { id: 'economico', name: 'Econômico', basePrice: 5.90, distanceMultiplier: 0.008, baseDays: 8 },
  { id: 'padrao', name: 'Padrão', basePrice: 9.90, distanceMultiplier: 0.012, baseDays: 5 },
  { id: 'expresso', name: 'Expresso', basePrice: 18.90, distanceMultiplier: 0.02, baseDays: 2 },
];

/**
 * Fórmula de Haversine — calcula distância entre dois pontos na superfície
 * terrestre usando coordenadas geográficas. Precisão suficiente para estimativa
 * de frete (~0.5% de erro vs Vincenty, mas 10x mais simples).
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Encontra o centro de distribuição mais próximo do cliente.
 */
function findNearestCenter(lat: number, lng: number) {
  let nearest = distributionCenters[0];
  let minDist = Infinity;

  for (const center of distributionCenters) {
    const dist = haversineDistance(lat, lng, center.latitude, center.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearest = center;
    }
  }

  return { center: nearest, distanceKm: Math.round(minDist) };
}

/**
 * Calcula opções de frete para cada transportadora com base na distância.
 * Preço final = basePrice + (distância × multiplicador).
 * Prazo estimado = baseDays + dias extras por faixa de distância.
 */
function calculateShippingOptions(distanceKm: number): ShippingOption[] {
  // Dias extras baseados em faixa de distância — simula tempo real de trânsito
  const extraDays = distanceKm <= 300 ? 0 : distanceKm <= 800 ? 2 : 4;

  const options: ShippingOption[] = carriers.map(carrier => {
    const rawCost = carrier.basePrice + distanceKm * carrier.distanceMultiplier;
    // Arredonda para 2 decimais — evita preços como R$ 19.9037
    const cost = Math.round(rawCost * 100) / 100;
    const days = carrier.baseDays + extraDays;
    return { carrier, cost, days, isFreeShipping: false };
  });

  // Ordena por custo para identificar mais barato e mais rápido
  const sorted = [...options].sort((a, b) => a.cost - b.cost);
  sorted[0].recommendation = 'cheapest';
  
  const fastest = [...options].sort((a, b) => a.days - b.days);
  fastest[0].recommendation = 'fastest';

  // Melhor custo-benefício: score = custo × prazo — equilibra ambos fatores
  const bestValue = [...options].sort((a, b) => (a.cost * a.days) - (b.cost * b.days));
  if (!bestValue[0].recommendation) bestValue[0].recommendation = 'best-value';

  return options;
}

/**
 * Calcula custo legado baseado em faixa de distância (compatibilidade).
 */
function calculateShippingByDistance(distanceKm: number) {
  if (distanceKm <= 300) return { cost: 9.90, days: 2 };
  if (distanceKm <= 800) return { cost: 19.90, days: 5 };
  return { cost: 34.90, days: 8 };
}

type RouteHandler = (url: URL, init?: RequestInit) => Promise<Response>;

// Helper para padronizar respostas JSON — centraliza headers e serialização
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const banners: Banner[] = [
  { id: '1', title: 'Ofertas Imperdíveis', subtitle: 'Até 60% de desconto em eletrônicos', bgColor: 'hsl(220 70% 50%)', image: '/src/assets/banner-eletronicos.jpg', link: '/produtos?categoria=eletronicos', buttonText: 'Ver ofertas' },
  { id: '2', title: 'Novidades em Moda', subtitle: 'Coleção Verão 2026 chegou!', bgColor: 'hsl(340 65% 47%)', image: '/src/assets/banner-moda.jpg', link: '/produtos?categoria=modas', buttonText: 'Comprar agora' },
  { id: '3', title: 'Frete Grátis', subtitle: 'Em compras acima de R$ 199', bgColor: 'hsl(150 60% 35%)', image: '/src/assets/banner-frete.jpg', link: '/produtos', buttonText: 'Aproveitar' },
];

const routes: Array<{ pattern: RegExp; handler: RouteHandler }> = [
  // GET /api/products — listagem paginada com filtros
  // Suporta múltiplos filtros combinados para permitir buscas complexas
  // sem necessidade de endpoints separados para cada cenário
  {
    pattern: /^\/api\/products$/,
    handler: async (url) => {
      await delay(250);
      const page = Number(url.searchParams.get('page') || '1');
      const limit = Number(url.searchParams.get('limit') || '12');
      const q = url.searchParams.get('q')?.toLowerCase();
      const category = url.searchParams.get('category');
      const subcategory = url.searchParams.get('subcategory');
      const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
      const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
      const sortBy = url.searchParams.get('sortBy');

      // Filtros especiais para páginas de categoria (Melhores Produtos, Promoção)
      const featured = url.searchParams.get('featured');
      const promotion = url.searchParams.get('promotion');

      // Filtros aplicados sequencialmente — cada filtro reduz o dataset,
      // ordem não importa pois são operações AND
      let filtered = [...products];
      if (featured === 'true') filtered = filtered.filter(p => p.isFeatured);
      if (promotion === 'true') filtered = filtered.filter(p => p.isPromotion);
      if (category) filtered = filtered.filter(p => p.category === category);
      if (subcategory) filtered = filtered.filter(p => p.subcategory === subcategory);
      if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      if (minPrice !== undefined) filtered = filtered.filter(p => p.price >= minPrice);
      if (maxPrice !== undefined) filtered = filtered.filter(p => p.price <= maxPrice);

      const minRating = url.searchParams.get('minRating') ? Number(url.searchParams.get('minRating')) : undefined;
      if (minRating !== undefined) filtered = filtered.filter(p => p.rating >= minRating);

      // Sort in-place na cópia — não afeta array original
      if (sortBy) {
        switch (sortBy) {
          case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
          case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
          case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
        }
      }

      // Paginação server-side simulada — frontend controla page/limit,
      // hasMore indica se há mais páginas (útil para infinite scroll)
      const start = (page - 1) * limit;
      const result: PaginatedResponse<Product> = {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
        hasMore: start + limit < filtered.length,
      };
      return json(result);
    },
  },
  // Endpoints dedicados para featured/promotions — usados na home
  // para evitar enviar filtros complexos em uma listagem simples
  {
    pattern: /^\/api\/products\/featured$/,
    handler: async () => {
      await delay(200);
      return json(products.filter(p => p.isFeatured));
    },
  },
  {
    pattern: /^\/api\/products\/promotions$/,
    handler: async () => {
      await delay(200);
      return json(products.filter(p => p.isPromotion));
    },
  },
  // Produtos relacionados — filtra por mesma categoria excluindo o produto atual
  {
    pattern: /^\/api\/products\/related$/,
    handler: async (url) => {
      await delay(150);
      const category = url.searchParams.get('category') || '';
      const exclude = url.searchParams.get('exclude') || '';
      const limit = Number(url.searchParams.get('limit') || '4');
      return json(products.filter(p => p.category === category && p.id !== exclude).slice(0, limit));
    },
  },
  // GET /api/products/:id — detalhe do produto
  {
    pattern: /^\/api\/products\/([^/?]+)$/,
    handler: async (url) => {
      await delay(150);
      const id = url.pathname.match(/\/api\/products\/([^/?]+)$/)?.[1];
      const product = products.find(p => p.id === id);
      if (!product) return json({ error: 'Product not found' }, 404);
      return json(product);
    },
  },
  {
    pattern: /^\/api\/categories$/,
    handler: async () => {
      await delay(100);
      return json(categories);
    },
  },
  {
    pattern: /^\/api\/categories\/([^/?]+)$/,
    handler: async (url) => {
      await delay(100);
      const slug = url.pathname.match(/\/api\/categories\/([^/?]+)$/)?.[1];
      const cat = categories.find(c => c.slug === slug);
      if (!cat) return json({ error: 'Category not found' }, 404);
      return json(cat);
    },
  },
  {
    pattern: /^\/api\/banners$/,
    handler: async () => {
      await delay(100);
      return json(banners);
    },
  },
  {
    pattern: /^\/api\/search$/,
    handler: async (url) => {
      await delay(200);
      const q = (url.searchParams.get('q') || '').toLowerCase();
      if (!q) return json([]);
      return json(
        products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      );
    },
  },
  // POST /api/products — cadastro de produto pelo vendedor
  {
    pattern: /^\/api\/products$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(300);
      const body = JSON.parse((init?.body as string) || '{}');
      // Frete padrão aplicado caso vendedor não defina —
      // garante que todo produto tenha dados de frete válidos
      const defaultShipping = { sul: 0, sudeste: 0, centroOeste: 0, norte: 25, nordeste: 20 };
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        price: Number(body.price),
        image: body.image,
        category: body.category,
        subcategory: body.subcategory,
        rating: 0,
        reviewCount: 0,
        seller: body.seller || 'Vendedor',
        stock: Number(body.stock),
        sellerId: body.sellerId,
        shipping: body.shipping || defaultShipping,
      };
      // unshift para produto novo aparecer primeiro na listagem —
      // feedback visual imediato para o vendedor
      products.unshift(newProduct);
      return json(newProduct, 201);
    },
  },
  // PATCH estoque — decrementado no checkout para refletir venda
  {
    pattern: /^\/api\/products\/([^/?]+)\/stock$/,
    handler: async (url, init) => {
      if (init?.method !== 'PATCH') return json({ error: 'Method not allowed' }, 405);
      await delay(150);
      const id = url.pathname.match(/\/api\/products\/([^/?]+)\/stock$/)?.[1];
      const product = products.find(p => p.id === id);
      if (!product) return json({ error: 'Product not found' }, 404);
      const body = JSON.parse((init?.body as string) || '{}');
      const decrement = Number(body.quantity) || 1;
      // Math.max(0) impede estoque negativo — regra de negócio crítica
      product.stock = Math.max(0, product.stock - decrement);
      return json(product);
    },
  },

  // GET /api/location — resolve CEP para estado/região
  // Mapeamento simplificado pelo primeiro dígito do CEP —
  // suficiente para mock, em produção usar API dos Correios ou ViaCEP
  {
    pattern: /^\/api\/location$/,
    handler: async (url) => {
      await delay(200);
      const cep = url.searchParams.get('cep')?.replace(/\D/g, '') || '';
      if (cep.length !== 8) return json({ error: 'CEP inválido' }, 400);

      const cepStateMap: Record<string, { state: string; city: string }> = {
        '0': { state: 'SP', city: 'São Paulo' }, '1': { state: 'SP', city: 'São Paulo' },
        '2': { state: 'RJ', city: 'Rio de Janeiro' }, '3': { state: 'MG', city: 'Belo Horizonte' },
        '4': { state: 'BA', city: 'Salvador' }, '5': { state: 'PE', city: 'Recife' },
        '6': { state: 'PA', city: 'Belém' }, '7': { state: 'DF', city: 'Brasília' },
        '8': { state: 'PR', city: 'Curitiba' }, '9': { state: 'RS', city: 'Porto Alegre' },
      };

      // Mapeamento estado → região segue divisão oficial do IBGE
      const stateRegionMap: Record<string, string> = {
        RS: 'Sul', SC: 'Sul', PR: 'Sul',
        SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
        GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
        AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
        AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
        PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
      };

      const info = cepStateMap[cep[0]] || { state: 'SP', city: 'São Paulo' };
      const region = stateRegionMap[info.state] || 'Sudeste';
      return json({ cep, state: info.state, city: info.city, region });
    },
  },
  // GET /api/distribution-centers — lista de centros de distribuição
  {
    pattern: /^\/api\/distribution-centers$/,
    handler: async () => {
      await delay(100);
      return json(distributionCenters);
    },
  },
  // POST /api/shipping/calculate — cálculo avançado de frete baseado em distância.
  // Recebe coordenadas do cliente, encontra CD mais próximo via Haversine,
  // e retorna custo + prazo baseado em faixas de distância.
  {
    pattern: /^\/api\/shipping\/calculate$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(150);
      const body = JSON.parse((init?.body as string) || '{}');

      const { latitude, longitude } = body;

      // Se coordenadas não foram enviadas, usa fallback por região (compatibilidade)
      if (latitude == null || longitude == null) {
        const regionKey: Record<string, string> = {
          'Sul': 'sul', 'Sudeste': 'sudeste', 'Centro-Oeste': 'centroOeste',
          'Norte': 'norte', 'Nordeste': 'nordeste',
        };
        const key = regionKey[body.region] || 'sudeste';
        const defaultShipping: Record<string, number> = { sul: 0, sudeste: 0, centroOeste: 0, norte: 25, nordeste: 20 };
        const cost = defaultShipping[key] ?? 0;
        return json({ shippingCost: cost, isFreeShipping: cost === 0, deliveryDays: 5, nearestCenter: distributionCenters[0], distanceKm: 0 });
      }

      // Cálculo principal: encontra CD mais próximo e deriva custo/prazo
      const { center, distanceKm } = findNearestCenter(latitude, longitude);
      const { cost, days } = calculateShippingByDistance(distanceKm);

      return json({
        shippingCost: cost,
        isFreeShipping: cost === 0,
        deliveryDays: days,
        nearestCenter: center,
        distanceKm,
      });
    },
  },
  // GET /api/shipping/options — retorna opções de todas as transportadoras
  // para uma coordenada. Usado na página de produto e carrinho para o
  // usuário escolher entre Econômico/Padrão/Expresso.
  {
    pattern: /^\/api\/shipping\/options$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(150);
      const body = JSON.parse((init?.body as string) || '{}');
      const { latitude, longitude } = body;
      if (latitude == null || longitude == null) return json({ error: 'Coordenadas obrigatórias' }, 400);

      // Se recebeu array de sellers, calcula frete por vendedor separadamente
      const sellers: Array<{ sellerId: string; sellerName: string }> = body.sellers || [];
      if (sellers.length > 0) {
        // Frete por vendedor — cada vendedor pode ter CD mais próximo diferente
        // dependendo de sua localização de origem
        const results = sellers.map(s => {
          const { center, distanceKm } = findNearestCenter(latitude, longitude);
          const options = calculateShippingOptions(distanceKm);
          return { sellerId: s.sellerId, sellerName: s.sellerName, nearestCenter: center, distanceKm, options };
        });
        return json(results);
      }

      // Cálculo simples para produto individual
      const { center, distanceKm } = findNearestCenter(latitude, longitude);
      const options = calculateShippingOptions(distanceKm);
      return json({ nearestCenter: center, distanceKm, options });
    },
  },
  // GET /api/logistics/dashboard — dados agregados para painel logístico
  {
    pattern: /^\/api\/logistics\/dashboard$/,
    handler: async () => {
      await delay(200);
      return json({
        totalOrders: 156,
        avgDeliveryDays: 4.2,
        avgShippingCost: 18.50,
        freeShippingRate: 0.35,
        regionBreakdown: {
          Sudeste: 45, Sul: 22, Nordeste: 18, 'Centro-Oeste': 10, Norte: 5,
        },
      });
    },
  },
  // POST /api/contact — formulário de contato
  {
    pattern: /^\/api\/contact$/,
    handler: async (_url: URL, init?: RequestInit) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(300);
      const body = JSON.parse(init.body as string);
      console.debug('[MockServer] Contact received:', body);
      return json({ success: true, message: 'Mensagem recebida com sucesso' }, 201);
    },
  },
  // GET/POST /api/products/:id/reviews — listagem e criação de avaliações.
  // Endpoint aninhado mantém a relação produto→reviews explícita na URL,
  // facilitando cache HTTP por produto e RLS no futuro backend.
  {
    pattern: /^\/api\/products\/([^/?]+)\/reviews$/,
    handler: async (url, init) => {
      const id = url.pathname.match(/\/api\/products\/([^/?]+)\/reviews$/)?.[1] || '';
      const list = reviewsStore[id] || [];

      if (!init || init.method === 'GET' || init.method === undefined) {
        await delay(150);
        // Ordena do mais recente para o mais antigo — padrão de UX em reviews
        // (usuário quer ver primeiro o que aconteceu por último).
        const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        // Média calculada no servidor para garantir consistência —
        // evita divergência entre clients que possam arredondar diferente.
        const average = sorted.length
          ? sorted.reduce((s, r) => s + r.rating, 0) / sorted.length
          : 0;
        return json({
          reviews: sorted,
          average: Math.round(average * 10) / 10,
          total: sorted.length,
        });
      }

      if (init.method === 'POST') {
        await delay(250);
        const body = JSON.parse((init.body as string) || '{}');
        const rating = Number(body.rating);
        const comment = String(body.comment || '').trim();
        const userId = String(body.userId || '');
        const userName = String(body.userName || '').trim();

        // Validações de negócio centralizadas no handler — mantém contrato realístico
        // mesmo com mock, para que o frontend não dependa de mocks "permissivos".
        if (!userId || !userName) return json({ error: 'Usuário inválido' }, 401);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return json({ error: 'Nota deve ser um inteiro entre 1 e 5' }, 400);
        }
        if (comment.length < 5) return json({ error: 'Comentário muito curto' }, 400);

        // Regra: 1 review por usuário por produto. Status 409 (Conflict) é
        // semanticamente correto para violação de unicidade.
        if (list.some(r => r.userId === userId)) {
          return json({ error: 'Você já avaliou este produto.' }, 409);
        }

        const review: Review = {
          id: crypto.randomUUID(),
          productId: id,
          userId,
          userName,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        };
        reviewsStore[id] = [...list, review];

        // Atualiza rating/reviewCount do produto — mantém consistência com cards
        // de produto que exibem esses campos sem refetch dos reviews.
        const product = products.find(p => p.id === id);
        if (product) {
          const all = reviewsStore[id];
          const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
          product.rating = Math.round(avg * 10) / 10;
          product.reviewCount = all.length;
        }

        return json(review, 201);
      }

      return json({ error: 'Method not allowed' }, 405);
    },
  },
];

// Busca linear nas rotas — aceitável com poucos endpoints (~15),
// em APIs maiores usar trie ou radix tree
function matchRoute(pathname: string): ((url: URL, init?: RequestInit) => Promise<Response>) | null {
  for (const route of routes) {
    if (route.pattern.test(pathname)) return route.handler;
  }
  return null;
}

/**
 * Instala interceptor de fetch para rotas /api/*.
 * Estratégia: monkey-patch do fetch global — simples e transparente para o código da app.
 * O frontend não sabe se está usando mock ou backend real.
 */
export function installMockServer() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString(), window.location.origin);

    if (url.pathname.startsWith('/api/')) {
      const handler = matchRoute(url.pathname);
      if (handler) {
        // Para POST/PATCH, itera todas as rotas para encontrar handler
        // que aceite o método — necessário porque GET e POST para /api/products
        // compartilham o mesmo pattern regex
        if (init?.method === 'POST' || init?.method === 'PATCH') {
          for (const route of routes) {
            if (route.pattern.test(url.pathname)) {
              const res = await route.handler(url, init);
              if (res.status !== 405) {
                console.debug(`[MockServer] ${init.method} ${url.pathname}`);
                return res;
              }
            }
          }
        }
        console.debug(`[MockServer] ${url.pathname}${url.search}`);
        return handler(url, init);
      }
    }

    // Requests fora de /api/ passam para o fetch original (assets, etc.)
    return originalFetch(input, init);
  };

  console.info('[MockServer] Mock REST endpoints installed — set VITE_API_URL to use a real backend.');
}
