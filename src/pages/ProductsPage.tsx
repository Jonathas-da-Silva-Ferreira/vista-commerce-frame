import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Filter, X, ChevronDown, ChevronLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useProducts, useCategories } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';

const ITEMS_PER_PAGE = 8;

const sortOptions = [
  { value: 'relevance', label: 'Mais Relevantes' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Mais Avaliados' },
  { value: 'newest', label: 'Mais Recentes' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [openSections, setOpenSections] = useState({ categories: true, price: true });

  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('categoria') || '';

  const isSpecialFeatured = categorySlug === 'melhores-produtos';
  const isSpecialPromotion = categorySlug === 'promocao';
  const isSpecialCategory = isSpecialFeatured || isSpecialPromotion;

  const { categories } = useCategories();
  const category = useMemo(() => categories.find(c => c.slug === categorySlug), [categories, categorySlug]);

  const filters = useMemo(() => ({
    category: isSpecialCategory ? undefined : categorySlug,
    query,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy: sortBy !== 'relevance' ? sortBy : undefined,
    featured: isSpecialFeatured || undefined,
    promotion: isSpecialPromotion || undefined,
  }), [categorySlug, query, priceRange, sortBy, isSpecialCategory, isSpecialFeatured, isSpecialPromotion]);

  const { data: products, total, loading } = useProducts(filters, currentPage, ITEMS_PER_PAGE);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [categorySlug, query, priceRange, sortBy]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) { params.set('q', newQuery); } else { params.delete('q'); }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 5000]);
    setSortBy('relevance');
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Categorias
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.categories ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
            <Link
              to="/produtos"
              className={`block py-2 px-3 rounded-lg transition-colors text-sm ${!categorySlug ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              onClick={() => setShowFilters(false)}
            >
              Todas as Categorias
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/produtos?categoria=${cat.slug}`}
                className={`block py-2 px-3 rounded-lg transition-colors text-sm ${categorySlug === cat.slug ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                onClick={() => setShowFilters(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Faixa de Preço
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 px-1">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={5000}
              min={0}
              step={50}
              className="mt-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="bg-muted px-2 py-1 rounded">{formatCurrency(priceRange[0])}</span>
              <span className="text-muted-foreground">até</span>
              <span className="bg-muted px-2 py-1 rounded">{formatCurrency(priceRange[1])}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="w-4 h-4 mr-2" />
        Limpar Filtros
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>

        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="w-4 h-4" />
          {category ? (
            <span className="text-foreground font-medium">{category.name}</span>
          ) : query ? (
            <span className="text-foreground font-medium">Busca: "{query}"</span>
          ) : (
            <span className="text-foreground font-medium">Todos os Produtos</span>
          )}
        </nav>

        {category && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground mt-1">Encontre os melhores produtos em {category.name.toLowerCase()}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            {!category && (
              <h1 className="text-2xl font-bold">{query ? `Resultados para "${query}"` : 'Todos os Produtos'}</h1>
            )}
            <p className="text-muted-foreground">{total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-xl p-4 shadow-card sticky top-24">
              <h2 className="font-bold mb-4">Filtros</h2>
              <FilterSidebar />
            </div>
          </aside>

          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-card p-6 shadow-xl animate-slide-up overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Filtros</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></Button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          <div className="flex-1">
            <ProductGrid products={products} loading={loading} />

            {totalPages > 1 && (
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
            )}

            {totalPages > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-4">Página {currentPage} de {totalPages}</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
