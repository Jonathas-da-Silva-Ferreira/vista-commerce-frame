import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import { useCategories, useBanners } from '@/hooks/useApi';

/**
 * HomePage — the marketplace entry point.
 *
 * We deliberately keep this page lean (search, banner, categories). The
 * featured/promotion lists were removed so users are funneled through the
 * category navigation — the same pattern Amazon and similar marketplaces
 * use. Less noise on the landing page → faster TTFB and clearer intent.
 * Promotions and Best Products remain reachable as dedicated category
 * routes, which keeps all filtering logic centralized in ProductsPage.
 */
export default function HomePage() {
  // Only fetch what's strictly needed for the landing view — additional
  // product calls would slow the LCP without paying off in conversion.
  const { categories } = useCategories();
  const { banners, loading: bannerLoading } = useBanners();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Search is the primary CTA for users with strong intent */}
        <section>
          <SearchBar />
        </section>

        {/* Rotating promotional banner — the only "commercial" block on home */}
        <section>
          <Banner banners={banners} loading={bannerLoading} />
        </section>

        {/* Category grid is the navigation backbone of the marketplace */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <CategoryGrid categories={categories} />
        </section>
      </div>
    </MainLayout>
  );
}
