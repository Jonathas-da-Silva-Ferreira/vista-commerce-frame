/**
 * Simulated REST server that intercepts fetch calls when no backend is configured.
 * Mirrors real API contract so switching to a real backend requires only setting VITE_API_URL.
 */
import { products, categories } from '@/data/mockData';
import type { Product, Banner, PaginatedResponse, CategoryFilterGroup, CategoryFiltersResponse } from '@/types';

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

type RouteHandler = (url: URL, init?: RequestInit) => Promise<Response>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const banners: Banner[] = [
  { id: '1', title: 'Ofertas Imperdíveis', subtitle: 'Até 60% de desconto em eletrônicos', bgColor: 'hsl(220 70% 50%)', link: '/products?category=eletronicos' },
  { id: '2', title: 'Novidades em Moda', subtitle: 'Coleção Verão 2026 chegou!', bgColor: 'hsl(340 65% 47%)', link: '/products?category=modas' },
  { id: '3', title: 'Frete Grátis', subtitle: 'Em compras acima de R$ 199', bgColor: 'hsl(150 60% 35%)' },
];

/** Dynamic filters per category — simulates what the backend would return */
const categoryFiltersMap: Record<string, CategoryFilterGroup[]> = {
  'eletronicos': [
    { key: 'brand', label: 'Marca', type: 'checkbox', options: [
      { value: 'samsung', label: 'Samsung', count: 5 },
      { value: 'apple', label: 'Apple', count: 3 },
      { value: 'xiaomi', label: 'Xiaomi', count: 4 },
      { value: 'sony', label: 'Sony', count: 2 },
    ]},
    { key: 'condition', label: 'Condição', type: 'radio', options: [
      { value: 'new', label: 'Novo' },
      { value: 'refurbished', label: 'Recondicionado' },
    ]},
  ],
  'livros': [
    { key: 'genre', label: 'Gênero', type: 'checkbox', options: [
      { value: 'fiction', label: 'Ficção', count: 12 },
      { value: 'tech', label: 'Tecnologia', count: 8 },
      { value: 'self-help', label: 'Autoajuda', count: 6 },
      { value: 'biography', label: 'Biografia', count: 4 },
    ]},
    { key: 'format', label: 'Formato', type: 'radio', options: [
      { value: 'physical', label: 'Físico' },
      { value: 'ebook', label: 'E-book' },
      { value: 'audiobook', label: 'Audiobook' },
    ]},
  ],
  'modas': [
    { key: 'size', label: 'Tamanho', type: 'checkbox', options: [
      { value: 'pp', label: 'PP', count: 10 },
      { value: 'p', label: 'P', count: 15 },
      { value: 'm', label: 'M', count: 20 },
      { value: 'g', label: 'G', count: 12 },
      { value: 'gg', label: 'GG', count: 8 },
    ]},
    { key: 'color', label: 'Cor', type: 'checkbox', options: [
      { value: 'black', label: 'Preto', count: 18 },
      { value: 'white', label: 'Branco', count: 14 },
      { value: 'blue', label: 'Azul', count: 9 },
      { value: 'red', label: 'Vermelho', count: 6 },
    ]},
    { key: 'gender', label: 'Gênero', type: 'radio', options: [
      { value: 'male', label: 'Masculino' },
      { value: 'female', label: 'Feminino' },
      { value: 'unisex', label: 'Unissex' },
    ]},
  ],
  'componentes-computador': [
    { key: 'brand', label: 'Marca', type: 'checkbox', options: [
      { value: 'nvidia', label: 'NVIDIA', count: 6 },
      { value: 'amd', label: 'AMD', count: 5 },
      { value: 'intel', label: 'Intel', count: 4 },
      { value: 'corsair', label: 'Corsair', count: 3 },
    ]},
    { key: 'type', label: 'Tipo', type: 'checkbox', options: [
      { value: 'gpu', label: 'Placa de Vídeo', count: 8 },
      { value: 'cpu', label: 'Processador', count: 6 },
      { value: 'ram', label: 'Memória RAM', count: 10 },
      { value: 'ssd', label: 'Armazenamento', count: 7 },
    ]},
  ],
  'esportes': [
    { key: 'sport', label: 'Esporte', type: 'checkbox', options: [
      { value: 'running', label: 'Corrida', count: 12 },
      { value: 'gym', label: 'Academia', count: 15 },
      { value: 'soccer', label: 'Futebol', count: 8 },
      { value: 'swimming', label: 'Natação', count: 5 },
    ]},
    { key: 'size', label: 'Tamanho', type: 'checkbox', options: [
      { value: '38', label: '38', count: 6 },
      { value: '40', label: '40', count: 8 },
      { value: '42', label: '42', count: 10 },
      { value: '44', label: '44', count: 7 },
    ]},
  ],
  'casa': [
    { key: 'room', label: 'Cômodo', type: 'checkbox', options: [
      { value: 'living', label: 'Sala', count: 10 },
      { value: 'bedroom', label: 'Quarto', count: 8 },
      { value: 'bathroom', label: 'Banheiro', count: 5 },
      { value: 'kitchen', label: 'Cozinha', count: 7 },
    ]},
    { key: 'material', label: 'Material', type: 'checkbox', options: [
      { value: 'wood', label: 'Madeira', count: 12 },
      { value: 'metal', label: 'Metal', count: 6 },
      { value: 'fabric', label: 'Tecido', count: 9 },
    ]},
  ],
  'ferramentas': [
    { key: 'type', label: 'Tipo', type: 'checkbox', options: [
      { value: 'manual', label: 'Manual', count: 20 },
      { value: 'electric', label: 'Elétrica', count: 15 },
      { value: 'pneumatic', label: 'Pneumática', count: 5 },
    ]},
    { key: 'brand', label: 'Marca', type: 'checkbox', options: [
      { value: 'bosch', label: 'Bosch', count: 8 },
      { value: 'dewalt', label: 'DeWalt', count: 6 },
      { value: 'makita', label: 'Makita', count: 5 },
    ]},
  ],
  'cozinha': [
    { key: 'type', label: 'Tipo', type: 'checkbox', options: [
      { value: 'cookware', label: 'Panelas', count: 10 },
      { value: 'appliance', label: 'Eletrodomésticos', count: 12 },
      { value: 'utensils', label: 'Utensílios', count: 15 },
    ]},
    { key: 'material', label: 'Material', type: 'checkbox', options: [
      { value: 'stainless', label: 'Inox', count: 8 },
      { value: 'ceramic', label: 'Cerâmica', count: 6 },
      { value: 'nonstick', label: 'Antiaderente', count: 10 },
    ]},
  ],
  'pecas-automotivas': [
    { key: 'vehicle', label: 'Veículo', type: 'checkbox', options: [
      { value: 'car', label: 'Carro', count: 20 },
      { value: 'motorcycle', label: 'Moto', count: 10 },
      { value: 'truck', label: 'Caminhão', count: 5 },
    ]},
    { key: 'brand', label: 'Marca', type: 'checkbox', options: [
      { value: 'bosch', label: 'Bosch', count: 8 },
      { value: 'ngk', label: 'NGK', count: 6 },
      { value: 'mann', label: 'Mann', count: 4 },
    ]},
  ],
  'aventura': [
    { key: 'activity', label: 'Atividade', type: 'checkbox', options: [
      { value: 'camping', label: 'Camping', count: 12 },
      { value: 'hiking', label: 'Trilha', count: 8 },
      { value: 'climbing', label: 'Escalada', count: 5 },
    ]},
  ],
  'pesca': [
    { key: 'type', label: 'Tipo', type: 'checkbox', options: [
      { value: 'rod', label: 'Varas', count: 8 },
      { value: 'reel', label: 'Molinetes', count: 6 },
      { value: 'bait', label: 'Iscas', count: 15 },
      { value: 'line', label: 'Linhas', count: 10 },
    ]},
    { key: 'water', label: 'Tipo de Água', type: 'radio', options: [
      { value: 'fresh', label: 'Água Doce' },
      { value: 'salt', label: 'Água Salgada' },
    ]},
  ],
  'pet-shop': [
    { key: 'animal', label: 'Animal', type: 'checkbox', options: [
      { value: 'dog', label: 'Cachorro', count: 20 },
      { value: 'cat', label: 'Gato', count: 15 },
      { value: 'bird', label: 'Pássaro', count: 5 },
      { value: 'fish', label: 'Peixe', count: 4 },
    ]},
    { key: 'type', label: 'Tipo', type: 'checkbox', options: [
      { value: 'food', label: 'Alimentação', count: 18 },
      { value: 'accessory', label: 'Acessórios', count: 12 },
      { value: 'hygiene', label: 'Higiene', count: 8 },
    ]},
  ],
  'brinquedos': [
    { key: 'age', label: 'Faixa Etária', type: 'checkbox', options: [
      { value: '0-3', label: '0 a 3 anos', count: 8 },
      { value: '4-7', label: '4 a 7 anos', count: 12 },
      { value: '8-12', label: '8 a 12 anos', count: 10 },
      { value: '13+', label: '13+ anos', count: 6 },
    ]},
    { key: 'type', label: 'Tipo', type: 'checkbox', options: [
      { value: 'educational', label: 'Educativo', count: 10 },
      { value: 'construction', label: 'Construção', count: 8 },
      { value: 'board-game', label: 'Jogos de Tabuleiro', count: 6 },
    ]},
  ],
};

function getCategoryFilters(slug: string): CategoryFilterGroup[] {
  return categoryFiltersMap[slug] || [];
}

const routes: Array<{ pattern: RegExp; handler: RouteHandler }> = [
  // GET /api/products?...
  {
    pattern: /^\/api\/products$/,
    handler: async (url) => {
      await delay(250);
      const page = Number(url.searchParams.get('page') || '1');
      const limit = Number(url.searchParams.get('limit') || '12');
      const q = url.searchParams.get('q')?.toLowerCase();
      const category = url.searchParams.get('category');
      const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
      const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
      const sortBy = url.searchParams.get('sortBy');

      let filtered = [...products];
      if (category) filtered = filtered.filter(p => p.category === category);
      if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      if (minPrice !== undefined) filtered = filtered.filter(p => p.price >= minPrice);
      if (maxPrice !== undefined) filtered = filtered.filter(p => p.price <= maxPrice);

      if (sortBy) {
        switch (sortBy) {
          case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
          case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
          case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
        }
      }

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
  // GET /api/products/featured
  {
    pattern: /^\/api\/products\/featured$/,
    handler: async () => {
      await delay(200);
      return json(products.filter(p => p.isFeatured));
    },
  },
  // GET /api/products/promotions
  {
    pattern: /^\/api\/products\/promotions$/,
    handler: async () => {
      await delay(200);
      return json(products.filter(p => p.isPromotion));
    },
  },
  // GET /api/products/related?category=...&exclude=...&limit=...
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
  // GET /api/products/:id
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
  // GET /api/categories
  {
    pattern: /^\/api\/categories$/,
    handler: async () => {
      await delay(100);
      return json(categories);
    },
  },
  // GET /api/categories/:slug/filters
  {
    pattern: /^\/api\/categories\/([^/?]+)\/filters$/,
    handler: async (url) => {
      await delay(120);
      const slug = url.pathname.match(/\/api\/categories\/([^/?]+)\/filters$/)?.[1];
      if (!slug) return json({ error: 'Missing slug' }, 400);
      const filters = getCategoryFilters(slug);
      const response: CategoryFiltersResponse = { categorySlug: slug, filters };
      return json(response);
    },
  },
  // GET /api/categories/:slug
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
  // GET /api/banners
  {
    pattern: /^\/api\/banners$/,
    handler: async () => {
      await delay(100);
      return json(banners);
    },
  },
  // GET /api/search?q=...
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
];

function matchRoute(pathname: string): ((url: URL, init?: RequestInit) => Promise<Response>) | null {
  for (const route of routes) {
    if (route.pattern.test(pathname)) return route.handler;
  }
  return null;
}

/**
 * Installs a fetch interceptor that handles /api/* requests locally.
 * Call once at app startup when VITE_API_URL is empty.
 */
export function installMockServer() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString(), window.location.origin);

    if (url.pathname.startsWith('/api/')) {
      const handler = matchRoute(url.pathname);
      if (handler) {
        console.debug(`[MockServer] ${url.pathname}${url.search}`);
        return handler(url, init);
      }
    }

    return originalFetch(input, init);
  };

  console.info('[MockServer] Mock REST endpoints installed — set VITE_API_URL to use a real backend.');
}
