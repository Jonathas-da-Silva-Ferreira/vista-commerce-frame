import { useState, useEffect, useMemo } from 'react';
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import CategoryHeader from '@/components/CategoryHeader';
import FilterSidebar from '@/components/FilterSidebar';
import SEO from '@/components/SEO';
import ActiveFilterChips from '@/components/products/ActiveFilterChips';
import { Button } from '@/components/ui/button';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useSearchParams, useParams } from 'react-router-dom';
import { useUrlFilters } from '@/hooks/useUrlFilters';

const ITEMS_PER_PAGE = 8;

/**
 * ProductsPage — listagem com filtros 100% sincronizados na URL.
 *
 * Mudança arquitetural-chave: filterState ANTES vivia em useState local.
 * Agora a fonte única de verdade é a URL (useUrlFilters), o que permite:
 *  - Refresh preservar filtros aplicados.
 *  - Compartilhar link com filtros já ativos.
 *  - Botões voltar/avançar do browser navegarem entre estados de filtro.
 *  - SEO/SSR futuro entender a intenção sem rodar JS.
 *
 * O ActiveFilterChips lê desses mesmos filtros e expõe X para remover
 * cada um individualmente — UX de marketplace consolidada.
 */
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // useUrlFilters encapsula serialização/deserialização — esta página
  // trabalha apenas com o FilterState tipado e nunca toca em searchParams
  // diretamente para campos de filtro.
  const { filters: filterState, setFilters: handleFiltersChange, clearFilters: clearAllFilters } = useUrlFilters();

  const query = searchParams.get('q') || '';
  const categorySlug = routeSlug || searchParams.get('category') || '';

  // "Categorias especiais" (best-products, deals) não filtram pelo campo
  // category — alternam flags featured/promotion no request. Tratá-las como
  // categorias normais filtraria por slug inexistente e devolveria zero.
  const isSpecialFeatured = categorySlug === 'best-products';
  const isSpecialPromotion = categorySlug === 'deals';
  const isSpecialCategory = isSpecialFeatured || isSpecialPromotion;

  const { categories } = useCategories();
  const category = useMemo(
    () => categories.find(c => c.slug === categorySlug),
    [categories, categorySlug]
  );

  const apiFilters = useMemo(() => ({
    category: isSpecialCategory ? undefined : categorySlug || undefined,
    subcategory: filterState.subcategory || undefined,
    query: query || undefined,
    minPrice: filterState.priceRange[0],
    maxPrice: filterState.priceRange[1],
    sortBy: filterState.sortBy !== 'relevance' ? filterState.sortBy : undefined,
    featured: isSpecialFeatured || undefined,
    promotion: isSpecialPromotion || undefined,
    minRating: filterState.minRating || undefined,
  }), [categorySlug, query, filterState, isSpecialCategory, isSpecialFeatured, isSpecialPromotion]);

  const { data: products, total, loading } = useProducts(apiFilters, currentPage, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Reset de paginação quando o dataset muda — evita ficar na página 5 de
  // um resultado de 2 páginas (renderizaria vazio).
  // ATENÇÃO: depender de `filterState` (objeto) re-disparava a cada render
  // porque useUrlFilters recria a referência. Serializar via apiFilters
  // (já memoizado) dá uma chave estável que só muda quando algo real mudou.
  const resetKey = JSON.stringify(apiFilters);
  useEffect(() => { setCurrentPage(1); }, [resetKey]);
  // Mudar de categoria limpa a subcategoria selecionada — "Smartphones" não
  // existe dentro de "Casa", então manter o filtro daria zero resultados.
  useEffect(() => {
    if (filterState.subcategory) handleFiltersChange({ subcategory: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) params.set('q', newQuery); else params.delete('q');
    setSearchParams(params);
  };

  // Hierarquia de título: mais específico → menos específico. Garante que
  // o heading sempre descreve a visão mais estreita escolhida pelo usuário.
  const subcategoryLabel = filterState.subcategory;
  const categoryLabel = category?.name ?? '';
  const pageTitle = subcategoryLabel
    || categoryLabel
    || (query ? `Results for "${query}"` : 'All Products');
  const pageDescription = category?.description
    || (query ? `${total} ${total === 1 ? 'product' : 'products'} found` : 'Browse our full product catalog.');

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    ...(subcategoryLabel && category
      ? [{ label: categoryLabel, to: `/products?category=${category.slug}` }, { label: subcategoryLabel }]
      : [{ label: pageTitle }]),
  ];

  return (
    <MainLayout>
      <SEO
        title={pageTitle === 'All Products' ? 'All products' : pageTitle}
        description={`${pageDescription} Browse ${total} ${total === 1 ? 'product' : 'products'} on Nexora.`}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>

        <CategoryHeader title={pageTitle} description={pageDescription} breadcrumbs={breadcrumbs} />

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'product' : 'products'} found
          </p>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-xl p-4 shadow-card sticky top-24">
              <h2 className="font-bold mb-4">Filters</h2>
              <FilterSidebar
                categories={categories}
                activeCategory={categorySlug}
                filters={filterState}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearAllFilters}
              />
            </div>
          </aside>

          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-card p-6 shadow-xl animate-slide-up overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <FilterSidebar
                  categories={categories}
                  activeCategory={categorySlug}
                  filters={filterState}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={clearAllFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            {/* Chips de filtros ativos: visíveis antes do grid para dar
                contexto do "porque estou vendo só isso" e permitir remover
                rapidamente sem abrir o sidebar. */}
            <ActiveFilterChips filters={filterState} onRemove={handleFiltersChange} />

            <ProductGrid products={products} loading={loading} />

            {totalPages > 1 && (
              <>
                <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Product pagination">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="icon" onClick={() => setCurrentPage(page)} className="w-10 h-10" aria-label={`Go to page ${page}`} aria-current={currentPage === page ? 'page' : undefined}>
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-muted-foreground" aria-hidden="true">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </nav>
                <p className="text-center text-sm text-muted-foreground mt-4">Page {currentPage} of {totalPages}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
