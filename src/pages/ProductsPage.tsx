import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import CategoryHeader from '@/components/CategoryHeader';
import FilterSidebar, { defaultFilterState, type FilterState } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useCategoryLabel } from '@/hooks/useCategoryLabel';
// Localiza o rótulo de subcategoria (valor pt-BR vindo da API) para que
// breadcrumb e título reajam ao idioma ativo sem reload.
import { useSubcategoryLabel } from '@/hooks/useSubcategoryLabel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  // i18n hook is the single source of truth for any user-visible string here,
  // ensuring that filter labels, headings and result counts switch languages.
  const { t } = useTranslation();
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
  const labelFor = useCategoryLabel();
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

  // Build page title & description. Category names are localized via the
  // shared helper so titles/breadcrumbs flip languages with the rest of the UI.
  const pageTitle = category
    ? labelFor(category.slug, category.name)
    : (query ? t('products.resultsFor', { query }) : t('products.all'));
  const pageDescription = category?.description
    || (query ? t('products.found', { count: total }) : t('products.catalogDesc'));

  const breadcrumbs = [
    { label: t('common.home'), to: '/' },
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
            {/* i18next handles plural forms (found_one / found_other) per locale */}
            {t('products.found', { count: total })}
          </p>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            <Filter className="w-4 h-4 mr-2" />
            {t('common.filters')}
          </Button>
        </div>

        {/* Main layout: sidebar + grid */}
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-xl p-4 shadow-card sticky top-24">
              <h2 className="font-bold mb-4">{t('common.filters')}</h2>
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
                  <h2 className="text-lg font-bold">{t('common.filters')}</h2>
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
                <p className="text-center text-sm text-muted-foreground mt-4">{t('common.page')} {currentPage} {t('common.of')} {totalPages}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
