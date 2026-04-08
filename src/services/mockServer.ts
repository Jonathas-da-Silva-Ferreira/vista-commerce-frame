/**
 * Simulated REST server that intercepts fetch calls when no backend is configured.
 * Mirrors real API contract so switching to a real backend requires only setting VITE_API_URL.
 *
 * Decisão arquitetural: interceptar fetch() ao invés de usar MSW (Mock Service Worker)
 * para evitar dependência extra e simplificar setup — adequado para protótipos.
 * Em produção, migrar para MSW ou backend real.
 */
import { products as initialProducts, categories } from '@/data/mockData';
import type { Product, Banner, PaginatedResponse, DistributionCenter } from '@/types';

const products: Product[] = [...initialProducts];

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

/**
 * Fórmula de Haversine — calcula distância entre dois pontos na superfície
 * terrestre usando coordenadas geográficas. Precisão suficiente para estimativa
 * de frete (~0.5% de erro vs Vincenty, mas 10x mais simples).
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Raio médio da Terra em km
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  // Fórmula: a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Encontra o centro de distribuição mais próximo do cliente.
 * Retorna o centro e a distância em km — usado para calcular frete e prazo.
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
 * Calcula custo de frete e prazo baseado na distância.
 * Faixas de distância calibradas para realidade brasileira:
 * - <300km: mesmo estado ou estado vizinho → entrega rápida
 * - 300-800km: inter-regional → prazo médio
 * - >800km: longa distância → prazo estendido
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
  // POST /api/shipping/calculate — cálculo de frete com 3 modos:
  // 1. Por productId (página de detalhe)
  // 2. Por lista de items (carrinho)
  // 3. Genérico por região (fallback)
  {
    pattern: /^\/api\/shipping\/calculate$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(150);
      const body = JSON.parse((init?.body as string) || '{}');
      // Mapeia nome da região (pt-BR) para chave do objeto shipping —
      // necessário porque a API de localização retorna nomes legíveis
      const regionKey: Record<string, string> = {
        'Sul': 'sul', 'Sudeste': 'sudeste', 'Centro-Oeste': 'centroOeste',
        'Norte': 'norte', 'Nordeste': 'nordeste',
      };
      const key = regionKey[body.region] || 'sudeste';

      // Modo 1: frete específico de um produto (página de detalhe)
      if (body.productId) {
        const product = products.find(p => p.id === body.productId);
        const shipping = product?.shipping || { sul: 0, sudeste: 0, centroOeste: 0, norte: 25, nordeste: 20 };
        const cost = (shipping as Record<string, number>)[key] ?? 0;
        return json({ shippingCost: cost, isFreeShipping: cost === 0 });
      }

      // Modo 2: soma frete de múltiplos produtos (carrinho)
      // Cada produto pode ter frete diferente — soma individual é mais justo
      // do que aplicar frete único para todos
      if (body.items && Array.isArray(body.items)) {
        let totalCost = 0;
        for (const item of body.items) {
          const product = products.find(p => p.id === item.productId);
          const shipping = product?.shipping || { sul: 0, sudeste: 0, centroOeste: 0, norte: 25, nordeste: 20 };
          const cost = (shipping as Record<string, number>)[key] ?? 0;
          totalCost += cost;
        }
        return json({ shippingCost: totalCost, isFreeShipping: totalCost === 0 });
      }

      // Modo 3: fallback genérico — usado quando não há contexto de produto
      const defaultShipping: Record<string, number> = { sul: 0, sudeste: 0, centroOeste: 0, norte: 25, nordeste: 20 };
      const cost = defaultShipping[key] ?? 0;
      return json({ shippingCost: cost, isFreeShipping: cost === 0 });
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
