import { Link } from 'react-router-dom';
import { ChevronRight, Flame } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { usePromotionProducts } from '@/hooks/useApi';

/**
 * DealsGrid — seção "Ofertas do dia" na home.
 *
 * Por quê separado de FeaturedCarousel: produtos em promoção têm dinâmica
 * diferente (urgência, desconto visível) e merecem visual próprio com
 * ícone de chama, fundo destacado e CTA mais agressivo.
 *
 * Grid fixo de 4 (não carrossel) porque ofertas precisam ser TODAS visíveis
 * de uma vez — esconder atrás de scroll lateral derruba a conversão.
 */
export default function DealsGrid() {
  const { products, loading } = usePromotionProducts();

  if (!loading && products.length === 0) return null;

  return (
    <section
      aria-labelledby="deals-heading"
      className="space-y-4 rounded-2xl bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent p-4 md:p-6 border border-destructive/20"
    >
      <div className="flex items-center justify-between">
        <h2 id="deals-heading" className="text-2xl font-bold inline-flex items-center gap-2">
          {/* animate-pulse no ícone reforça a sensação de urgência sem
              distrair do conteúdo principal (mantém duração suave). */}
          <Flame className="w-6 h-6 text-destructive animate-pulse" />
          Today's deals
        </h2>
        <Link
          to="/category/deals"
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
