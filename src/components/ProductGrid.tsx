import type { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

/**
 * Renderiza grid de produtos com 3 estados explícitos: loading, vazio, dados.
 * Skeleton é EXTRAÍDO (componente próprio) — antes vivia inline e duplicava
 * o markup do ProductCard. Reuso garante que mudanças no card real são
 * refletidas no placeholder também.
 */
export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
