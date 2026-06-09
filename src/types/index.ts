// Public domain types shared across UI components. We keep them framework-
// agnostic so they can be reused in tests, edge functions, and pages alike.
//
// The Product/Category shapes are intentionally permissive (many optional
// fields) so the same interfaces serve BOTH the legacy mock dataset and the
// new Supabase-backed records. As the storefront migrates to the DB the
// extra optional fields can be removed.

export type ProductStatus = 'active' | 'hidden' | 'deleted';

export interface Product {
  // Core identity & commerce
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  // Imagery: image (single canonical URL) used historically; image_url is
  // the DB column name. We keep both so callers can use whichever exists.
  image?: string | null;
  image_url?: string | null;
  images?: string[];

  // Taxonomy
  category?: string | null;
  category_id?: string | null;
  subcategory?: string | null;

  // Merchandising metadata used by storefront cards/lists
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  seller?: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
  isNew?: boolean;

  // Admin/DB-derived fields
  seller_id?: string;
  status?: ProductStatus;
  sales_count?: number;
  created_at?: string;
}

export interface Category {
  id: string;
  // slug doubles as the storefront URL segment. Optional because legacy
  // mock data sometimes used `id` as the slug.
  slug?: string;
  name: string;
  parent_id?: string | null;
  enabled?: boolean;
  sort_order?: number;
  // UI-only fields kept on the type so the storefront grid can render
  // without a separate "category presentation" layer.
  icon?: string;
  color?: string;
  subcategories?: Array<{ id: string; name: string }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Cart & checkout
// ---------------------------------------------------------------------------
export interface CartItem {
  product: Product;
  quantity: number;
  // Optional snapshot of selected variant info; null/undefined means default.
  variant?: string;
}

// ---------------------------------------------------------------------------
// Shipping (ViaCEP + freight calculation results)
// ---------------------------------------------------------------------------
export interface ShippingResult {
  postalCode: string;
  city?: string;
  state?: string;
  options: Array<{
    carrier: string;
    service: string;
    price: number;
    estimatedDays: number;
  }>;
}

// ---------------------------------------------------------------------------
// Banners (storefront hero/promotional)
// ---------------------------------------------------------------------------
export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  position?: number;
  active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

// ---------------------------------------------------------------------------
// Institutional content (Sobre / História / Termos)
// ---------------------------------------------------------------------------
export interface AboutContent {
  title: string;
  body: string;
  mission?: string;
  values?: string[];
}

export interface HistoryContent {
  title: string;
  body: string;
  timeline?: Array<{ year: string; event: string }>;
}

export interface TermsContent {
  title: string;
  body: string;
  sections?: Array<{ title: string; body: string }>;
}

// ---------------------------------------------------------------------------
// Generic paginated response from the mock API
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
