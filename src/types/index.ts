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
  shipping?: {
    sul: number;
    sudeste: number;
    centroOeste: number;
    norte: number;
    nordeste: number;
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

// Centro de distribuição — cada um possui coordenadas geográficas
// para cálculo de distância via Haversine até o cliente
export interface DistributionCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

// Resultado completo do cálculo de frete avançado —
// inclui prazo, centro mais próximo e distância calculada
export interface ShippingResult {
  shippingCost: number;
  isFreeShipping: boolean;
  deliveryDays: number;
  nearestCenter: DistributionCenter;
  distanceKm: number;
}

// Transportadora com multiplicador de distância —
// permite escalar o custo base proporcionalmente à distância real
export interface Carrier {
  id: string;
  name: string;
  basePrice: number;
  distanceMultiplier: number;
  baseDays: number;
  // Tag exibida ao lado da sugestão inteligente ("Mais barato", "Mais rápido", etc.)
  tag?: string;
}

// Opção calculada de frete para uma transportadora específica —
// combina dados da Carrier com distância real para gerar preço/prazo finais
export interface ShippingOption {
  carrier: Carrier;
  cost: number;
  days: number;
  isFreeShipping: boolean;
  // Recomendação inteligente baseada em custo-benefício
  recommendation?: 'cheapest' | 'fastest' | 'best-value';
}

// Resultado de frete por vendedor — agrupa opções de transportadora
// com o centro de distribuição mais próximo do vendedor
export interface SellerShippingResult {
  sellerId: string;
  sellerName: string;
  nearestCenter: DistributionCenter;
  distanceKm: number;
  options: ShippingOption[];
  // Opção selecionada pelo usuário (default: melhor custo-benefício)
  selectedOptionId?: string;
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
