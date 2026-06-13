import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import SEO from '@/components/SEO';
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
      {/* Per-route SEO: unique title/description/canonical for the homepage.
          Without this, every route would inherit the same static <title>
          from index.html and search engines would flag duplicate metadata. */}
      <SEO
        title="Your modern online marketplace"
        description="Shop electronics, fashion, home and more on Nexora. Compare carriers, track shipping by ZIP and check out securely."
        canonicalPath="/"
      />
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/*
          A single, descriptive H1 is required for both SEO and screen-reader
          navigation. We use sr-only so the visual hero (the banner below)
          isn't disrupted, but assistive tech and crawlers still get a clear
          page topic. This is preferable to leaving the page H1-less.
        */}
        <h1 className="sr-only">Nexora — Your modern online marketplace</h1>

        {/* Search is the primary CTA for users with strong intent */}
        <section aria-label="Search products">
          <SearchBar />
        </section>

        {/* Rotating promotional banner — the only "commercial" block on home */}
        <section aria-label="Featured promotions">
          <Banner banners={banners} loading={bannerLoading} />
        </section>

        {/* Category grid is the navigation backbone of the marketplace */}
        <section aria-labelledby="home-categories-heading">
          <h2 id="home-categories-heading" className="text-2xl font-bold mb-4">Categories</h2>
          <CategoryGrid categories={categories} />
        </section>
      </div>
    </MainLayout>
  );
}
