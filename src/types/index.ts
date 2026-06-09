// Public domain types shared across UI components. Intentionally permissive
// because the codebase straddles the old mock dataset and the new
// Supabase-backed schema. Once the storefront fully migrates to the DB,
// the legacy-only optional fields can be pruned.

export type ProductStatus = 'active' | 'hidden' | 'deleted';

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;

  // Imagery — `image`/`images` are legacy; `image_url` matches the DB column.
  image?: string | null;
  image_url?: string | null;
  images?: string[];

  // Taxonomy
  category?: string | null;
  category_id?: string | null;
  subcategory?: string | null;

  // Merchandising
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  seller?: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
  isNew?: boolean;

  // Admin/DB-derived
  seller_id?: string;
  status?: ProductStatus;
  sales_count?: number;
  created_at?: string;
}

// Subcategories tolerate both legacy string-only and richer object lists.
// Components that need a uniform shape should normalize at the boundary.
export type SubcategoryRef = string | { id: string; name: string };

export interface Category {
  id: string;
  slug?: string;
  name: string;
  parent_id?: string | null;
  enabled?: boolean;
  sort_order?: number;
  description?: string;
  productCount?: number;
  // Presentation hints kept on the type so the storefront grid can render
  // without a separate "category presentation" layer.
  icon?: string;
  color?: string;
  subcategories?: SubcategoryRef[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------
export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

// ---------------------------------------------------------------------------
// Shipping — superset of fields used by the freight engine and the
// presentation layer; not all are always populated.
// ---------------------------------------------------------------------------
export interface ShippingOption {
  carrier: string;
  service: string;
  price: number;
  estimatedDays: number;
}

export interface ShippingResult {
  postalCode: string;
  city?: string;
  state?: string;
  options?: ShippingOption[];
  // Legacy/aggregated single-quote fields used by LocationSelector.
  deliveryDays?: number;
  nearestCenter?: string;
  distanceKm?: number;
  isFreeShipping?: boolean;
  shippingCost?: number;
}

// ---------------------------------------------------------------------------
// Banners — superset of DB and legacy fields. Either `image` or `image_url`
// is acceptable; consumers should fall back.
// ---------------------------------------------------------------------------
export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  // DB column
  image_url?: string;
  link_url?: string | null;
  // Legacy fields used by the storefront Banner component
  image?: string;
  link?: string;
  bgColor?: string;
  buttonText?: string;
  // Scheduling/admin
  position?: number;
  active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

// ---------------------------------------------------------------------------
// Institutional content — schema kept loose because pages render rich,
// hand-authored content with varying section shapes.
// ---------------------------------------------------------------------------
export interface AboutContent {
  title: string;
  body?: string;
  companyName?: string;
  mission?: string;
  values?: string[];
  [key: string]: unknown;
}

export interface HistoryContent {
  title: string;
  body?: string;
  intro?: string;
  timeline?: Array<{ year: string; event: string }>;
  [key: string]: unknown;
}

export interface TermsContent {
  title: string;
  body?: string;
  sections?: Array<{ id?: string; title: string; body: string }>;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Paginated mock-API envelope. Tolerates both old and new field names.
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  // The mock API switched naming over time; support both.
  pageSize?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
}
