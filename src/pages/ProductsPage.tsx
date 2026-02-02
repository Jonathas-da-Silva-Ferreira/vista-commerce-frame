import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Filter, X } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { categories, mockApi } from '@/data/mockData';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('categoria') || '';
  const category = categories.find(c => c.slug === categorySlug);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await mockApi.getProducts({ category: categorySlug, query });
        setProducts(result.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, categorySlug]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          {category ? (
            <span className="text-foreground font-medium">{category.name}</span>
          ) : query ? (
            <span className="text-foreground font-medium">Busca: "{query}"</span>
          ) : (
            <span className="text-foreground font-medium">Todos os Produtos</span>
          )}
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {category ? category.name : query ? `Resultados para "${query}"` : 'Todos os Produtos'}
            </h1>
            <p className="text-muted-foreground">
              {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(query || categorySlug) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-background p-6' : 'hidden'
            } lg:block lg:static lg:w-64 lg:flex-shrink-0`}
          >
            {showFilters && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="text-lg font-bold">Filtros</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Categorias</h3>
                <div className="space-y-2">
                  <Link
                    to="/produtos"
                    className={`block py-1.5 px-2 rounded-lg transition-colors ${
                      !categorySlug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setShowFilters(false)}
                  >
                    Todas
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/produtos?categoria=${cat.slug}`}
                      className={`block py-1.5 px-2 rounded-lg transition-colors ${
                        categorySlug === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => setShowFilters(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
