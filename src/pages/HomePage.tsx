import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import { useCategories, useFeaturedProducts, usePromotionProducts, useBanners } from '@/hooks/useApi';

export default function HomePage() {
  const { categories, loading: catLoading } = useCategories();
  const { products: featuredProducts, loading: featLoading } = useFeaturedProducts();
  const { products: promotionProducts, loading: promoLoading } = usePromotionProducts();
  const { banners, loading: bannerLoading } = useBanners();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <section>
          <SearchBar />
        </section>

        <section>
          <Banner banners={banners} loading={bannerLoading} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <CategoryGrid categories={categories} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Produtos em Destaque</h2>
          <ProductGrid products={featuredProducts} loading={featLoading} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Promoções</h2>
          <ProductGrid products={promotionProducts} loading={promoLoading} />
        </section>
      </div>
    </MainLayout>
  );
}
