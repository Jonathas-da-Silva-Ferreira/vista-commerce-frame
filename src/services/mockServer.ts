/**
 * Simulated REST server that intercepts fetch calls when no backend is configured.
 * Mirrors real API contract so switching to a real backend requires only setting VITE_API_URL.
 */
import { products as initialProducts, categories } from '@/data/mockData';
import type { Product, Banner, PaginatedResponse } from '@/types';

// Mutable copy so POST / PATCH can modify
const products: Product[] = [...initialProducts];

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
      const subcategory = url.searchParams.get('subcategory');
      const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
      const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
      const sortBy = url.searchParams.get('sortBy');

      const featured = url.searchParams.get('featured');
      const promotion = url.searchParams.get('promotion');

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
  // POST /api/products — create product
  {
    pattern: /^\/api\/products$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(300);
      const body = JSON.parse((init?.body as string) || '{}');
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
      };
      products.unshift(newProduct);
      return json(newProduct, 201);
    },
  },
  // PATCH /api/products/:id — update stock
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
      product.stock = Math.max(0, product.stock - decrement);
      return json(product);
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
      // Try exact path first, then check with method-aware routes
      const handler = matchRoute(url.pathname);
      if (handler) {
        // For POST to /api/products, the GET route also matches — prefer POST handler
        if (init?.method === 'POST' || init?.method === 'PATCH') {
          // Find a handler that supports the method
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

    return originalFetch(input, init);
  };

  console.info('[MockServer] Mock REST endpoints installed — set VITE_API_URL to use a real backend.');
}
