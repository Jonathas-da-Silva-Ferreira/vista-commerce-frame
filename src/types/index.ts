// Public domain types shared across UI components. We keep them framework-
// agnostic so they can be reused in tests, edge functions, and pages alike.

export type ProductStatus = 'active' | 'hidden' | 'deleted';

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  image_url?: string | null;
  category?: string | null;
  category_id?: string | null;
  seller_id?: string;
  status?: ProductStatus;
  sales_count?: number;
  created_at?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parent_id?: string | null;
  enabled: boolean;
  sort_order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
