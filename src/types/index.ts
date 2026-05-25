export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount: number;
  seller: string;
  stock: number;
  sellerId?: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
  // Region-based shipping policy. The five regions match the country-wide
  // distribution model the calculator uses; using fixed keys (not a Record)
  // gives us compile-time guarantees on missing regions.
  shipping?: {
    south: number;
    southeast: number;
    centerWest: number;
    north: number;
    northeast: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  productCount?: number;
  subcategories?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

// Distribution center — each one carries its geographic coordinates so the
// Haversine calculator can resolve the nearest warehouse for a buyer.
export interface DistributionCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

// Result of the (simpler) shipping calculation: cost, ETA, nearest center,
// and the raw distance for traceability.
export interface ShippingResult {
  shippingCost: number;
  isFreeShipping: boolean;
  deliveryDays: number;
  nearestCenter: DistributionCenter;
  distanceKm: number;
}

// Carrier definition. The distance multiplier lets the cost scale with the
// actual route length instead of being a flat rate.
export interface Carrier {
  id: string;
  name: string;
  basePrice: number;
  distanceMultiplier: number;
  baseDays: number;
  tag?: string;
}

// A computed shipping offer for a specific carrier. Combines static carrier
// data with the realized distance to produce a final price/ETA pair.
export interface ShippingOption {
  carrier: Carrier;
  cost: number;
  days: number;
  isFreeShipping: boolean;
  recommendation?: 'cheapest' | 'fastest' | 'best-value';
}

// Per-seller shipping result — multi-seller carts produce one of these per
// seller because each seller may ship from a different warehouse.
export interface SellerShippingResult {
  sellerId: string;
  sellerName: string;
  nearestCenter: DistributionCenter;
  distanceKm: number;
  options: ShippingOption[];
  selectedOptionId?: string;
}

// Product review. userId is kept distinct from userName so we can enforce the
// "one review per user per product" rule against an immutable identifier
// rather than a mutable display string.
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  // 1..5 integer rating; half-stars only appear in the aggregate average,
  // not in user input, so validation stays trivial.
  rating: number;
  comment: string;
  createdAt: string; // ISO 8601 — sortable lexicographically and locale-friendly.
}

// Aggregate summary returned with the list so the client doesn't have to
// recompute the average (and risk drifting if the backend changes the rule).
export interface ReviewsSummary {
  reviews: Review[];
  average: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  image?: string;
  link?: string;
  buttonText?: string;
}

// --- Institutional content ----------------------------------------------------
// Sections modeled as generic { id, title, body } so marketing can add/remove
// blocks without schema migrations — much more resilient than locking in
// specific fields like mission/vision/values.
export interface ContentSection {
  id: string;
  title: string;
  body: string;
}

export interface AboutContent {
  companyName: string;
  tagline: string;
  description: string;
  sections: ContentSection[];
}

// year is a string (not number) so the model can carry mixed formats like
// "2024 Q3" or "Mar/2025" later without a breaking change.
export interface HistoryMilestone {
  year: string;
  title: string;
  description: string;
}

export interface HistoryContent {
  title: string;
  intro: string;
  milestones: HistoryMilestone[];
}

export interface TermsContent {
  title: string;
  // ISO 8601 — formatting is the component's job (Intl.DateTimeFormat), not
  // the content's, which keeps the API locale-agnostic.
  lastUpdated: string;
  intro: string;
  sections: ContentSection[];
}
