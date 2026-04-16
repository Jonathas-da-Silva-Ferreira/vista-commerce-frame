import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import CategoryHeader from '@/components/CategoryHeader';
import FilterSidebar, { defaultFilterState, type FilterState } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { useProducts, useCategories } from '@/hooks/useApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // useParams captura o :slug quando a rota é /categoria/:slug.
  // Mantemos compat com ?categoria=X (CategoryGrid e links antigos)
  // para evitar refactor em cascata e quebrar URLs já compartilhadas.
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterState, setFilterState] = useState<FilterState>({ ...defaultFilterState });

  const query = searchParams.get('q') || '';
  // Prioridade: slug da rota (URL semântica/SEO) > query param (legado).
  const categorySlug = routeSlug || searchParams.get('categoria') || '';

  const isSpecialFeatured = categorySlug === 'melhores-produtos';
  const isSpecialPromotion = categorySlug === 'promocao';
  const isSpecialCategory = isSpecialFeatured || isSpecialPromotion;

  const { categories } = useCategories();
  const category = useMemo(() => categories.find(c => c.slug === categorySlug), [categories, categorySlug]);

  const filters = useMemo(() => ({
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

  const { data: products, total, loading } = useProducts(filters, currentPage, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [categorySlug, query, filterState]);
  useEffect(() => { setFilterState(prev => ({ ...prev, subcategory: '' })); }, [categorySlug]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) params.set('q', newQuery); else params.delete('q');
    setSearchParams(params);
  };

  const handleFiltersChange = (partial: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...partial }));
  };

  const clearFilters = () => {
    setSearchParams({});
    setFilterState({ ...defaultFilterState });
  };

  // Build page title & description
  const pageTitle = category?.name
    || (query ? `Resultados para "${query}"` : 'Todos os Produtos');
  const pageDescription = category?.description
    || (query ? `${total} resultado${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}` : 'Explore nosso catálogo completo de produtos.');

  const breadcrumbs = [
    { label: 'Início', to: '/' },
    { label: pageTitle },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>

        {/* Category Header */}
        <CategoryHeader title={pageTitle} description={pageDescription} breadcrumbs={breadcrumbs} />

        {/* Results count + mobile filter toggle */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Main layout: sidebar + grid */}
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-xl p-4 shadow-card sticky top-24">
              <h2 className="font-bold mb-4">Filtros</h2>
              <FilterSidebar
                categories={categories}
                activeCategory={categorySlug}
                filters={filterState}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-card p-6 shadow-xl animate-slide-up overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Filtros</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <FilterSidebar
                  categories={categories}
                  activeCategory={categorySlug}
                  filters={filterState}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={clearFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Products grid + pagination */}
          <div className="flex-1">
            <ProductGrid products={products} loading={loading} />

            {totalPages > 1 && (
              <>
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="icon" onClick={() => setCurrentPage(page)} className="w-10 h-10">
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-muted-foreground">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">Página {currentPage} de {totalPages}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
