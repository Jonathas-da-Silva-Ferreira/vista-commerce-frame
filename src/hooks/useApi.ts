import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { mockApi, categories as fallbackCategories } from '@/data/mockData';
import type { Product, Category, PaginatedResponse } from '@/types';

const IS_API_CONFIGURED = Boolean(import.meta.env.VITE_API_URL);

/**
 * Resolves API calls: tries the real API first, falls back to mock if not configured.
 */
async function resolve<T>(apiFn: () => Promise<T>, mockFn: () => Promise<T>): Promise<T> {
  if (!IS_API_CONFIGURED) return mockFn();
  try {
    return await apiFn();
  } catch {
    console.warn('[API] Falling back to mock data');
    return mockFn();
  }
}

export function useProducts(
  filters?: { category?: string; query?: string; minPrice?: number; maxPrice?: number; sortBy?: string },
  page = 1,
  limit = 12
) {
  const [data, setData] = useState<PaginatedResponse<Product>>({ data: [], total: 0, page: 1, limit, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify({ filters, page, limit });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    resolve(
      () => api.getProducts(filters, page, limit),
      () => mockApi.getProducts(filters, page, limit)
    )
      .then(result => { if (!cancelled) setData(result); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filterKey]);

  return { ...data, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);

    resolve(
      () => api.getProductById(id),
      () => mockApi.getProductById(id)
    )
      .then(result => { if (!cancelled) setProduct(result); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    resolve(
      () => api.getCategories(),
      () => mockApi.getCategories()
    )
      .then(result => { if (!cancelled) setCategories(result); })
      .catch(() => { if (!cancelled) setCategories(fallbackCategories); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { categories, loading };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resolve(
      () => api.getFeaturedProducts(),
      () => mockApi.getFeaturedProducts()
    )
      .then(result => { if (!cancelled) setProducts(result); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { products, loading };
}

export function usePromotionProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resolve(
      () => api.getPromotionProducts(),
      () => mockApi.getPromotionProducts()
    )
      .then(result => { if (!cancelled) setProducts(result); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { products, loading };
}

export function useRelatedProducts(productId: string | undefined, category: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId || !category) return;
    let cancelled = false;

    resolve(
      () => api.getRelatedProducts(productId, category),
      () => mockApi.getRelatedProducts(productId, category)
    )
      .then(result => { if (!cancelled) setProducts(result); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [productId, category]);

  return { products, loading };
}
