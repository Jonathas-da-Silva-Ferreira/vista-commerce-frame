import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import { categories, mockApi } from '@/data/mockData';
import type { Product } from '@/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [promotionProducts, setPromotionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, promotions] = await Promise.all([
          mockApi.getFeaturedProducts(),
          mockApi.getPromotionProducts(),
        ]);
        setFeaturedProducts(featured);
        setPromotionProducts(promotions);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Search Bar */}
        <section>
          <SearchBar />
        </section>

        {/* Banner */}
        <section>
          <Banner />
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <CategoryGrid categories={categories} />
        </section>

        {/* Featured Products */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Produtos em Destaque</h2>
          <ProductGrid products={featuredProducts} loading={loading} />
        </section>

        {/* Promotions */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Promoções</h2>
          <ProductGrid products={promotionProducts} loading={loading} />
        </section>
      </div>
    </MainLayout>
  );
}
