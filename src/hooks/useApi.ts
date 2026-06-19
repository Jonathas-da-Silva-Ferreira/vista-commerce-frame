import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import type { Product, Category, Banner, PaginatedResponse } from '@/types';

// Module-level cache.
//
// Why: the previous implementation initialised every hook with `loading: true`
// and an empty payload, then refetched on every mount. Navigating away and
// back (Home -> Category -> Home) therefore showed an empty state for a few
// hundred ms — read by users as the dreaded "white flash". By memoising
// resolved promises and their last value at the module scope we:
//
//   1) Deduplicate concurrent requests for the same key (only one network
//      round-trip even if N components ask at the same moment).
//   2) Return cached data synchronously on remount, so the page paints with
//      content immediately and no skeleton is shown for already-known data.
//
// We deliberately keep this lightweight (no TTL, no LRU) because the dataset
// is small and the marketplace mock server is already fast. For production a
// real query client (TanStack Query) would back this with proper invalidation.
const dataCache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

function cachedFetch<T>(key: string, loader: () => Promise<T>): Promise<T> {
  // Coalesce simultaneous callers behind a single promise.
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const promise = loader()
    .then(result => {
      dataCache.set(key, result);
      return result;
    })
    .finally(() => {
      // Allow future refetches once this one settles.
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}

function getCached<T>(key: string): T | undefined {
  return dataCache.get(key) as T | undefined;
}

export function useProducts(
  filters?: { category?: string; query?: string; minPrice?: number; maxPrice?: number; sortBy?: string; featured?: boolean; promotion?: boolean; minRating?: number },
  page = 1,
  limit = 12
) {
  // The filter key doubles as our cache key — identical queries hit the cache.
  const filterKey = `products:${JSON.stringify({ filters, page, limit })}`;
  const cached = getCached<PaginatedResponse<Product>>(filterKey);

  const [data, setData] = useState<PaginatedResponse<Product>>(
    cached ?? { data: [], total: 0, page: 1, limit, hasMore: false }
  );
  // Only show a loading state when there's no cached data — otherwise we'd
  // flash a skeleton over content we already have.
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hit = getCached<PaginatedResponse<Product>>(filterKey);
    if (hit) {
      setData(hit);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    cachedFetch(filterKey, () => api.getProducts(filters, page, limit))
      .then(result => { if (!cancelled) setData(result); })
      .catch(err => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { ...data, loading, error };
}

export function useProduct(id: string | undefined) {
  const key = id ? `product:${id}` : '';
  const cached = id ? getCached<Product>(key) : undefined;

  const [product, setProduct] = useState<Product | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && !!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const hit = getCached<Product>(key);
    if (hit) {
      setProduct(hit);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    cachedFetch(key, () => api.getProductById(id))
      .then(result => { if (!cancelled) setProduct(result); })
      .catch(err => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id, key]);

  return { product, loading, error };
}

function useCachedList<T>(key: string, loader: () => Promise<T[]>) {
  const cached = getCached<T[]>(key);
  const [items, setItems] = useState<T[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  // loaderRef captura a função sem fazê-la entrar nas deps do useEffect.
  // Callers passam arrow inline (ex.: `() => api.getCategories()`), cuja
  // identidade muda a cada render — se entrasse nas deps, o efeito re-rodaria
  // a cada render mesmo com `key` estável. A ref garante 1 fetch por key.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;

    cachedFetch(key, () => loaderRef.current())
      .then(result => { if (!cancelled) setItems(result); })
      .catch(err => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // Apenas `key` na lista: trocar de key = nova chave de cache = novo fetch.
    // loader é estável via ref (ver acima). cachedFetch já deduplica in-flight
    // contra StrictMode double-invoke, então não precisamos de startedRef.
  }, [key]);

  return { items, loading, error };
}

export function useCategories() {
  const { items, loading, error } = useCachedList<Category>('categories', () => api.getCategories());
  return { categories: items, loading, error };
}

// useFeaturedProducts/usePromotionProducts foram removidos: produtos em
// destaque/promoção agora vivem exclusivamente dentro das categorias
// `best-products` e `deals`, consumidos via useProducts({featured/promotion}).
// Manter hooks órfãos só convida re-introdução acidental de seções duplicadas.

export function useRelatedProducts(productId: string | undefined, category: string | undefined) {
  const key = productId && category ? `related:${category}:${productId}` : '';
  const cached = key ? getCached<Product[]>(key) : undefined;

  const [products, setProducts] = useState<Product[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached && !!key);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || !category) return;
    let cancelled = false;

    cachedFetch(key, () => api.getRelatedProducts(productId, category))
      .then(result => { if (!cancelled) setProducts(result); })
      .catch(err => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [productId, category, key]);

  return { products, loading, error };
}

export function useBanners() {
  const { items, loading, error } = useCachedList<Banner>('banners', () => api.getBanners());
  return { banners: items, loading, error };
}
