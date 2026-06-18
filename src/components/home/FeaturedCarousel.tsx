import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { useFeaturedProducts } from '@/hooks/useApi';

/**
 * FeaturedCarousel — seção horizontal de produtos em destaque na home.
 *
 * Por que carrossel (e não grid):
 *  - Em mobile, scroll horizontal com snap economiza viewport vertical
 *    (a home já tem banner + categorias acima).
 *  - Em desktop, mostra 4–5 cards "espiando" e convida ao scroll lateral
 *    (gesto natural em trackpads).
 *
 * Implementação CSS-only com snap-x (sem library de carrossel) — zero JS,
 * acessível por teclado (tab navega pelos cards), nativo em todos os browsers.
 */
export default function FeaturedCarousel() {
  const { products, loading } = useFeaturedProducts();

  // Sem produtos e sem loading: a seção inteira desaparece. Renderizar
  // "Nenhum destaque" na home seria um anúncio de fraqueza do catálogo.
  if (!loading && products.length === 0) return null;

  return (
    <section aria-labelledby="featured-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="featured-heading" className="text-2xl font-bold">
          Featured products
        </h2>
        {/* Link "Ver todos" leva pra rota canônica de destaques — mantém
            a HomePage enxuta e a ProductsPage como ponto central de filtro. */}
        <Link
          to="/category/best-products"
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/*
        scroll-snap-x faz cada card "ancorar" no início da viewport
        durante o scroll horizontal. -mx-4/px-4 estende o scroll até as
        bordas do container pai (efeito de "edge bleed" típico de apps mobile).
      */}
      <div className="-mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-4 pb-2">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                // w-[220px] casa com a largura média de um card no grid;
                // shrink-0 impede que flex comprima os cards ao caber.
                <div key={i} className="snap-start shrink-0 w-[220px]">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.slice(0, 10).map(product => (
                <div key={product.id} className="snap-start shrink-0 w-[220px]">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
