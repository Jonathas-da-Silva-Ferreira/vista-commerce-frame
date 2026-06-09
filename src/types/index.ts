// Public domain types. Intentionally loose because this codebase straddles
// a legacy mock dataset and the new Supabase schema. Permissive index
// signatures + optional fields let both shapes flow through the same UI
// without invasive refactors. Tighten incrementally as the storefront
// migrates to the database.

export type ProductStatus = 'active' | 'hidden' | 'deleted';

// `any`-indexed records let legacy fields (shipping, discount, etc.) pass
// through without enumerating each one. The trade-off: less compile-time
// safety, but unblocks an in-progress migration.
type Loose = { [key: string]: any };

export interface Product extends Loose {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  image?: string | null;
  image_url?: string | null;
  images?: string[];
  category?: string | null;
  category_id?: string | null;
  subcategory?: string | null;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  seller?: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
  isNew?: boolean;
  seller_id?: string;
  sellerId?: string;
  status?: ProductStatus;
  sales_count?: number;
  created_at?: string;
}

export interface Category extends Loose {
  id: string;
  slug?: string;
  name: string;
  parent_id?: string | null;
  enabled?: boolean;
  sort_order?: number;
  description?: string;
  productCount?: number;
  icon?: string;
  color?: string;
  // `any[]` accepts both string[] (legacy) and {id,name}[] (newer);
  // consumers should narrow at the boundary if they care.
  subcategories?: any[];
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
export interface CartItem extends Loose {
  product: Product;
  quantity: number;
  variant?: string;
}

// ---------------------------------------------------------------------------
// Shipping — superset of every field used across the storefront and the
// freight engine. Quotes, options, distances, and per-seller breakdowns
// all share this loose surface.
// ---------------------------------------------------------------------------
export interface ShippingOption extends Loose {
  carrier?: any;
  service?: string;
  price?: number;
  cost?: number;
  estimatedDays?: number;
  days?: number;
  isFreeShipping?: boolean;
  recommendation?: any;
}

export interface ShippingResult extends Loose {
  postalCode?: string;
  city?: string;
  state?: string;
  options?: ShippingOption[];
  deliveryDays?: number;
  nearestCenter?: any;
  distanceKm?: number;
  isFreeShipping?: boolean;
  shippingCost?: number;
}

// Per-seller shipping breakdown used by the multi-seller cart flow.
export type SellerShippingResult = ShippingResult;

// Logistics support types — kept loose for the same reason as above.
export type DistributionCenter = Loose & { id: string; name?: string };
export type Carrier = Loose & { id?: string; name?: string };

// ---------------------------------------------------------------------------
// Banners
// ---------------------------------------------------------------------------
export interface Banner extends Loose {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string;
  link_url?: string | null;
  image?: string;
  link?: string;
  bgColor?: string;
  buttonText?: string;
  position?: number;
  active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

// ---------------------------------------------------------------------------
// Institutional content
// ---------------------------------------------------------------------------
export interface AboutContent extends Loose {
  title?: string;
  body?: string;
  companyName?: string;
  mission?: string;
  values?: string[];
}

export interface HistoryContent extends Loose {
  title?: string;
  body?: string;
  intro?: string;
  timeline?: any[];
}

export interface TermsContent extends Loose {
  title?: string;
  body?: string;
  sections?: any[];
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export interface Review extends Loose {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface ReviewsSummary extends Loose {
  // All fields optional — different sources populate different shapes
  // (count+average vs reviews+total). Consumers should pick what they need.
  count?: number;
  average?: number;
  total?: number;
  reviews?: any[];
  distribution?: Record<number, number>;
}

// ---------------------------------------------------------------------------
// Paginated mock-API envelope.
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
}
