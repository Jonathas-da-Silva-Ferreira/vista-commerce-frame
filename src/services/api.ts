import type { Product, Category, PaginatedResponse, SearchFilters } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  async getProducts(filters?: SearchFilters, page = 1, limit = 12): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters?.query) params.append('q', filters.query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    return this.fetch<PaginatedResponse<Product>>(`/products?${params}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.fetch<Product>(`/products/${id}`);
  }

  async getProductsByCategory(categorySlug: string, page = 1, limit = 12): Promise<PaginatedResponse<Product>> {
    return this.fetch<PaginatedResponse<Product>>(`/products?category=${categorySlug}&page=${page}&limit=${limit}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.fetch<Product[]>('/products/featured');
  }

  async getPromotionProducts(): Promise<Product[]> {
    return this.fetch<Product[]>('/products/promotions');
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.fetch<Category[]>('/categories');
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    return this.fetch<Category>(`/categories/${slug}`);
  }

  // Search
  async search(query: string): Promise<Product[]> {
    return this.fetch<Product[]>(`/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiService();
