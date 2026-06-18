import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import SEO from '@/components/SEO';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import DealsGrid from '@/components/home/DealsGrid';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import { useCategories, useBanners } from '@/hooks/useApi';

/**
 * HomePage — entrada do marketplace.
 *
 * Estrutura otimizada para conversão e descoberta:
 *  1. Search (intenção alta — atalho para usuários decididos)
 *  2. Banner (LCP candidate — promoção em destaque)
 *  3. Categories (navegação backbone)
 *  4. Recently viewed (continuar de onde parou — retornantes)
 *  5. Today's deals (urgência + conversão)
 *  6. Featured (descoberta de novidades)
 *
 * Ordem importa: vistos recentemente antes de ofertas porque usuário
 * retornante tem maior chance de converter num produto já considerado
 * que em um totalmente novo. Para usuário novo, RecentlyViewed simplesmente
 * não renderiza (return null) e a hierarquia segue natural.
 */
export default function HomePage() {
  const { categories } = useCategories();
  const { banners, loading: bannerLoading } = useBanners();

  return (
    <MainLayout>
      <SEO
        title="Your modern online marketplace"
        description="Shop electronics, fashion, home and more on Nexora. Compare carriers, track shipping by ZIP and check out securely."
        canonicalPath="/"
      />
      <div className="container mx-auto px-4 py-6 space-y-8">
        <h1 className="sr-only">Nexora — Your modern online marketplace</h1>

        <section aria-label="Search products">
          <SearchBar />
        </section>

        <section aria-label="Featured promotions">
          <Banner banners={banners} loading={bannerLoading} />
        </section>

        <section aria-labelledby="home-categories-heading">
          <h2 id="home-categories-heading" className="text-2xl font-bold mb-4">Categories</h2>
          <CategoryGrid categories={categories} />
        </section>

        {/* Componente decide internamente se renderiza (só aparece se houver
            histórico em localStorage). Sem JS condicional aqui — mantém a
            HomePage declarativa e fácil de ler. */}
        <RecentlyViewed />

        <DealsGrid />

        <FeaturedCarousel />
      </div>
    </MainLayout>
  );
}
