import type { Product, Category, Banner, PaginatedResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(
    filters?: { category?: string; query?: string; minPrice?: number; maxPrice?: number; sortBy?: string; featured?: boolean; promotion?: boolean; minRating?: number },
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });

    if (filters?.query) params.append('q', filters.query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.featured) params.append('featured', 'true');
    if (filters?.promotion) params.append('promotion', 'true');

    return this.request<PaginatedResponse<Product>>(`/api/products?${params}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/products/featured');
  }

  async getPromotionProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/products/promotions');
  }

  async getRelatedProducts(productId: string, category: string): Promise<Product[]> {
    const params = new URLSearchParams({ category, exclude: productId, limit: '4' });
    return this.request<Product[]>(`/api/products/related?${params}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    return this.request<Category>(`/api/categories/${slug}`);
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    return this.request<Banner[]>('/api/banners');
  }

  // Search
  async search(query: string): Promise<Product[]> {
    return this.request<Product[]>(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiService();
