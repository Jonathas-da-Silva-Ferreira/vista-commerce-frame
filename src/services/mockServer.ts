/**
 * Simulated REST server that intercepts fetch() when no backend is configured.
 * Mirrors the real API contract so swapping to a real backend only requires
 * setting VITE_API_URL — no call sites need to change.
 *
 * Why monkey-patch fetch instead of using MSW: fewer dependencies and zero
 * setup, which is the right trade-off for a prototype. For production, swap
 * this for MSW or a real backend.
 */
import { products as initialProducts, categories } from '@/data/mockData';
import { aboutContent, historyContent, termsContent } from '@/data/institutionalContent';
import type { Product, Banner, PaginatedResponse, DistributionCenter, Carrier, ShippingOption, Review } from '@/types';

const products: Product[] = [...initialProducts];

// In-memory reviews store — keyed by productId for O(1) lookup. In a real
// backend this would be a relational table with a UNIQUE (product_id, user_id)
// constraint to enforce "one review per user per product" at the DB level.
const reviewsStore: Record<string, Review[]> = {};

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

// Distribution centers positioned across regions so any customer is within
// roughly 2000km of at least one warehouse. (City names kept as-is since they
// are proper nouns.)
const distributionCenters: DistributionCenter[] = [
  { id: 'dc-sp', name: 'DC São Paulo', city: 'São Paulo', state: 'SP', latitude: -23.55, longitude: -46.63 },
  { id: 'dc-rj', name: 'DC Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', latitude: -22.91, longitude: -43.17 },
  { id: 'dc-pr', name: 'DC Curitiba', city: 'Curitiba', state: 'PR', latitude: -25.43, longitude: -49.27 },
  { id: 'dc-df', name: 'DC Brasília', city: 'Brasília', state: 'DF', latitude: -15.78, longitude: -47.93 },
  { id: 'dc-pe', name: 'DC Recife', city: 'Recife', state: 'PE', latitude: -8.05, longitude: -34.87 },
  { id: 'dc-am', name: 'DC Manaus', city: 'Manaus', state: 'AM', latitude: -3.12, longitude: -60.02 },
];

// Carriers with different cost/ETA profiles. The distance multiplier scales
// base price by route length so longer trips cost progressively more.
const carriers: Carrier[] = [
  { id: 'economy', name: 'Economy', basePrice: 5.90, distanceMultiplier: 0.008, baseDays: 8 },
  { id: 'standard', name: 'Standard', basePrice: 9.90, distanceMultiplier: 0.012, baseDays: 5 },
  { id: 'express', name: 'Express', basePrice: 18.90, distanceMultiplier: 0.02, baseDays: 2 },
];

/**
 * Haversine distance — great-circle distance between two lat/lng points.
 * Precision is sufficient for shipping estimates (~0.5% error vs Vincenty,
 * but ~10x simpler).
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
 * Build shipping options per carrier using distance.
 * Final price = basePrice + distance * multiplier.
 * ETA = baseDays + extra days based on distance bracket.
 */
function calculateShippingOptions(distanceKm: number): ShippingOption[] {
  // Extra days bucketed by distance — a coarse simulation of transit time.
  const extraDays = distanceKm <= 300 ? 0 : distanceKm <= 800 ? 2 : 4;

  const options: ShippingOption[] = carriers.map(carrier => {
    const rawCost = carrier.basePrice + distanceKm * carrier.distanceMultiplier;
    // Round to cents so we don't surface prices like 19.9037 to users.
    const cost = Math.round(rawCost * 100) / 100;
    const days = carrier.baseDays + extraDays;
    return { carrier, cost, days, isFreeShipping: false };
  });

  // Tag the cheapest and the fastest, then pick a "best value" option that
  // balances both — score = cost * days.
  const sorted = [...options].sort((a, b) => a.cost - b.cost);
  sorted[0].recommendation = 'cheapest';

  const fastest = [...options].sort((a, b) => a.days - b.days);
  fastest[0].recommendation = 'fastest';

  const bestValue = [...options].sort((a, b) => (a.cost * a.days) - (b.cost * b.days));
  if (!bestValue[0].recommendation) bestValue[0].recommendation = 'best-value';

  return options;
}

/**
 * Legacy distance-bracket cost — kept for the simpler /api/shipping/calculate
 * endpoint that doesn't surface multi-carrier comparisons.
 */
function calculateShippingByDistance(distanceKm: number) {
  if (distanceKm <= 300) return { cost: 9.90, days: 2 };
  if (distanceKm <= 800) return { cost: 19.90, days: 5 };
  return { cost: 34.90, days: 8 };
}

type RouteHandler = (url: URL, init?: RequestInit) => Promise<Response>;

// Single helper for JSON responses — keeps content-type and serialization
// consistent across every handler.
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const banners: Banner[] = [
  { id: '1', title: 'Unbeatable Deals', subtitle: 'Up to 60% off on electronics', bgColor: 'hsl(220 70% 50%)', image: '/src/assets/banner-eletronicos.jpg', link: '/products?category=electronics', buttonText: 'Shop deals' },
  { id: '2', title: 'New in Fashion', subtitle: 'Summer 2026 collection is here!', bgColor: 'hsl(340 65% 47%)', image: '/src/assets/banner-moda.jpg', link: '/products?category=fashion', buttonText: 'Shop now' },
  { id: '3', title: 'Free Shipping', subtitle: 'On purchases over $50', bgColor: 'hsl(150 60% 35%)', image: '/src/assets/banner-frete.jpg', link: '/products', buttonText: 'Get it' },
];

const routes: Array<{ pattern: RegExp; handler: RouteHandler }> = [
  // GET /api/products — paginated listing with combined filters. Supporting
  // multiple filters in one endpoint keeps the API surface small while
  // covering every real-world listing scenario the UI needs.
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

      // Special filters used by curated landing pages (Best Products, Deals).
      const featured = url.searchParams.get('featured');
      const promotion = url.searchParams.get('promotion');

      // Filters applied sequentially — order doesn't matter because they're
      // all AND'd; each pass narrows the dataset further.
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

      // Server-side pagination simulated — `hasMore` lets the UI build
      // infinite-scroll experiences without an extra round trip.
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
  // Dedicated featured/promotions endpoints — used on the home page so we
  // don't have to send heavyweight filter queries for a simple listing.
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
  // Related products — same category, excluding the current product.
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
  // GET /api/products/:id — single product detail.
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
  // POST /api/products — seller publishes a new product.
  {
    pattern: /^\/api\/products$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(300);
      const body = JSON.parse((init?.body as string) || '{}');
      // Fallback shipping policy so every product has a valid payload for the
      // calculator regardless of what the seller filled out.
      const defaultShipping = { south: 0, southeast: 0, centerWest: 0, north: 25, northeast: 20 };
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
        seller: body.seller || 'Seller',
        stock: Number(body.stock),
        sellerId: body.sellerId,
        shipping: body.shipping || defaultShipping,
      };
      // unshift so the new product is visible immediately at the top of the
      // catalog — a small bit of feedback that confirms "yes, it published".
      products.unshift(newProduct);
      return json(newProduct, 201);
    },
  },
  // PATCH /api/products/:id/stock — decrement called from checkout to reflect
  // a completed sale.
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
      // Math.max(0) guards against the stock ever becoming negative — a
      // critical business invariant we don't trust the caller to enforce.
      product.stock = Math.max(0, product.stock - decrement);
      return json(product);
    },
  },

  // GET /api/location — resolves a ZIP code into a state/region. The lookup
  // is simplified by first digit; a real implementation would use a postal
  // service API. Underlying postal-code format is Brazilian.
  {
    pattern: /^\/api\/location$/,
    handler: async (url) => {
      await delay(200);
      const cep = url.searchParams.get('cep')?.replace(/\D/g, '') || '';
      if (cep.length !== 8) return json({ error: 'Invalid ZIP code' }, 400);

      const cepStateMap: Record<string, { state: string; city: string }> = {
        '0': { state: 'SP', city: 'São Paulo' }, '1': { state: 'SP', city: 'São Paulo' },
        '2': { state: 'RJ', city: 'Rio de Janeiro' }, '3': { state: 'MG', city: 'Belo Horizonte' },
        '4': { state: 'BA', city: 'Salvador' }, '5': { state: 'PE', city: 'Recife' },
        '6': { state: 'PA', city: 'Belém' }, '7': { state: 'DF', city: 'Brasília' },
        '8': { state: 'PR', city: 'Curitiba' }, '9': { state: 'RS', city: 'Porto Alegre' },
      };

      // State → region map follows the same five-region partition used by
      // the shipping calculator and the seller-side per-region pricing.
      const stateRegionMap: Record<string, string> = {
        RS: 'South', SC: 'South', PR: 'South',
        SP: 'Southeast', RJ: 'Southeast', MG: 'Southeast', ES: 'Southeast',
        GO: 'Center-West', MT: 'Center-West', MS: 'Center-West', DF: 'Center-West',
        AC: 'North', AP: 'North', AM: 'North', PA: 'North', RO: 'North', RR: 'North', TO: 'North',
        AL: 'Northeast', BA: 'Northeast', CE: 'Northeast', MA: 'Northeast', PB: 'Northeast',
        PE: 'Northeast', PI: 'Northeast', RN: 'Northeast', SE: 'Northeast',
      };

      const info = cepStateMap[cep[0]] || { state: 'SP', city: 'São Paulo' };
      const region = stateRegionMap[info.state] || 'Southeast';
      return json({ cep, state: info.state, city: info.city, region });
    },
  },
  // GET /api/distribution-centers — list of warehouses for admin/debug UIs.
  {
    pattern: /^\/api\/distribution-centers$/,
    handler: async () => {
      await delay(100);
      return json(distributionCenters);
    },
  },
  // POST /api/shipping/calculate — distance-based shipping calculation.
  // Takes the customer's coordinates, finds the nearest DC via Haversine,
  // and returns cost + ETA bucketed by distance.
  {
    pattern: /^\/api\/shipping\/calculate$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(150);
      const body = JSON.parse((init?.body as string) || '{}');

      const { latitude, longitude } = body;

      // Fallback if coordinates were not provided — keep the legacy region
      // lookup working so older clients don't break.
      if (latitude == null || longitude == null) {
        const regionKey: Record<string, string> = {
          'South': 'south', 'Southeast': 'southeast', 'Center-West': 'centerWest',
          'North': 'north', 'Northeast': 'northeast',
        };
        const key = regionKey[body.region] || 'southeast';
        const defaultShipping: Record<string, number> = { south: 0, southeast: 0, centerWest: 0, north: 25, northeast: 20 };
        const cost = defaultShipping[key] ?? 0;
        return json({ shippingCost: cost, isFreeShipping: cost === 0, deliveryDays: 5, nearestCenter: distributionCenters[0], distanceKm: 0 });
      }

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
  // POST /api/shipping/options — returns every carrier's offer for a given
  // destination. Used on the product detail page and the cart so the buyer
  // can pick between Economy / Standard / Express.
  {
    pattern: /^\/api\/shipping\/options$/,
    handler: async (_url, init) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(150);
      const body = JSON.parse((init?.body as string) || '{}');
      const { latitude, longitude } = body;
      if (latitude == null || longitude == null) return json({ error: 'Coordinates required' }, 400);

      // When a sellers[] payload is provided, compute shipping per seller —
      // each seller may resolve to a different nearest warehouse.
      const sellers: Array<{ sellerId: string; sellerName: string }> = body.sellers || [];
      if (sellers.length > 0) {
        const results = sellers.map(s => {
          const { center, distanceKm } = findNearestCenter(latitude, longitude);
          const options = calculateShippingOptions(distanceKm);
          return { sellerId: s.sellerId, sellerName: s.sellerName, nearestCenter: center, distanceKm, options };
        });
        return json(results);
      }

      // Single-product flow.
      const { center, distanceKm } = findNearestCenter(latitude, longitude);
      const options = calculateShippingOptions(distanceKm);
      return json({ nearestCenter: center, distanceKm, options });
    },
  },
  // GET /api/logistics/dashboard — aggregate metrics powering the admin panel.
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
          Southeast: 45, South: 22, Northeast: 18, 'Center-West': 10, North: 5,
        },
      });
    },
  },
  // POST /api/contact — contact form submissions. Server returns 201 even on
  // the mock so the success branch in the UI is exercised end to end.
  {
    pattern: /^\/api\/contact$/,
    handler: async (_url: URL, init?: RequestInit) => {
      if (init?.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      await delay(300);
      const body = JSON.parse(init.body as string);
      console.debug('[MockServer] Contact received:', body);
      return json({ success: true, message: 'Message received successfully' }, 201);
    },
  },
  // GET/POST /api/products/:id/reviews — nested endpoint keeps the
  // product → reviews relationship explicit in the URL, which makes future
  // HTTP caching per product and DB-level RLS straightforward.
  {
    pattern: /^\/api\/products\/([^/?]+)\/reviews$/,
    handler: async (url, init) => {
      const id = url.pathname.match(/\/api\/products\/([^/?]+)\/reviews$/)?.[1] || '';
      const list = reviewsStore[id] || [];

      if (!init || init.method === 'GET' || init.method === undefined) {
        await delay(150);
        // Newest first — the standard UX in reviews UIs.
        const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        // Aggregate on the server to guarantee everyone sees the same number,
        // regardless of client-side rounding differences.
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

        // Business validations centralized in the handler — keeps the mock
        // strict so the frontend doesn't accidentally rely on permissive
        // behavior that a real backend wouldn't allow.
        if (!userId || !userName) return json({ error: 'Invalid user' }, 401);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return json({ error: 'Rating must be an integer between 1 and 5' }, 400);
        }
        if (comment.length < 5) return json({ error: 'Comment too short' }, 400);

        // One review per user per product. 409 (Conflict) is the semantically
        // correct status for a uniqueness violation.
        if (list.some(r => r.userId === userId)) {
          return json({ error: "You've already reviewed this product." }, 409);
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

        // Update the product's aggregate fields so cards reflect the new
        // review without needing to refetch the full product.
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
  // --- Institutional content -------------------------------------------------
  // Separate endpoints (not one /institutional bundle) so each document can
  // have an independent cache TTL once a real CDN sits in front.
  {
    pattern: /^\/api\/institutional\/about$/,
    handler: async () => {
      await delay(80);
      return json(aboutContent);
    },
  },
  {
    pattern: /^\/api\/institutional\/history$/,
    handler: async () => {
      await delay(80);
      return json(historyContent);
    },
  },
  {
    pattern: /^\/api\/institutional\/terms$/,
    handler: async () => {
      await delay(80);
      return json(termsContent);
    },
  },
];

// Linear scan — acceptable for ~15 routes. Larger APIs would warrant a trie.
function matchRoute(pathname: string): ((url: URL, init?: RequestInit) => Promise<Response>) | null {
  for (const route of routes) {
    if (route.pattern.test(pathname)) return route.handler;
  }
  return null;
}

/**
 * Installs the fetch interceptor for /api/* requests.
 * Strategy: monkey-patch window.fetch — simple and transparent, the app code
 * doesn't need to know whether it's talking to the mock or a real backend.
 */
export function installMockServer() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString(), window.location.origin);

    if (url.pathname.startsWith('/api/')) {
      const handler = matchRoute(url.pathname);
      if (handler) {
        // GET and POST handlers share the same pattern for some endpoints,
        // so for write methods we walk every match until one accepts the verb.
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

    // Non-API requests fall through to the real fetch (assets, images, etc.)
    return originalFetch(input, init);
  };

  console.info('[MockServer] Mock REST endpoints installed — set VITE_API_URL to use a real backend.');
}
