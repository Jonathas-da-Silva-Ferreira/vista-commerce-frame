import { Clock } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

/**
 * RecentlyViewed — seção "Vistos recentemente" baseada em localStorage.
 *
 * Por que na home: usuário que retorna ao site geralmente quer continuar
 * de onde parou. Mostrar produtos que ele já visitou aumenta drasticamente
 * a chance de voltar a uma ficha que ficou "em consideração".
 *
 * Renderização condicional: só aparece se houver itens. Para um usuário
 * novo (zero histórico), a seção não existe — não há "vazio" pra mostrar.
 */
export default function RecentlyViewed() {
  const { items } = useRecentlyViewed();

  // Sem histórico, sem seção. Manter um "empty state" aqui seria pior:
  // chamaria atenção pro fato de que o usuário ainda não navegou nada.
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="space-y-4">
      <h2 id="recent-heading" className="text-2xl font-bold inline-flex items-center gap-2">
        <Clock className="w-6 h-6 text-muted-foreground" />
        Recently viewed
      </h2>

      {/* Mesma estrutura de scroll horizontal do FeaturedCarousel —
          consistência visual entre seções "scrolláveis" da home. */}
      <div className="-mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-4 pb-2">
          {items.map(product => (
            <div key={product.id} className="snap-start shrink-0 w-[220px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
