import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import SEO from '@/components/SEO';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import { useCategories, useBanners } from '@/hooks/useApi';

/**
 * HomePage — porta de entrada do marketplace.
 *
 * Decisão arquitetural (junho/2026): produtos NUNCA aparecem soltos na
 * home. Todo produto pertence a uma categoria, e as listagens "Featured" /
 * "Deals" foram movidas para as categorias dedicadas `best-products` e
 * `deals` (ver ProductsPage.tsx → isSpecialFeatured / isSpecialPromotion).
 *
 * Por quê:
 *  - Evita duplicação: um mesmo produto em destaque + em oferta aparecia 3x
 *    (home featured, home deals, e dentro da própria categoria).
 *  - Hierarquia consistente: categorias são o único eixo de navegação,
 *    facilitando SEO (uma URL canônica por produto-em-contexto) e analytics.
 *  - Home enxuta = LCP mais rápido e menor superfície de re-render.
 */
export default function HomePage() {
  // Hooks com cache de módulo (useApi) — não disparam refetch em remount.
  const { categories, loading: categoriesLoading } = useCategories();
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
          {/* Banner é o LCP candidate — recebe loading explícito pra
              evitar layout shift entre skeleton e imagem final. */}
          <Banner banners={banners} loading={bannerLoading} />
        </section>

        <section aria-labelledby="home-categories-heading">
          <h2 id="home-categories-heading" className="text-2xl font-bold mb-4">Categories</h2>
          {/* CategoryGrid recebe loading para renderizar skeletons no fetch
              inicial — antes mostrava grid vazio durante ~200ms. */}
          <CategoryGrid categories={categories} loading={categoriesLoading} />
        </section>

        {/* RecentlyViewed self-gates: só renderiza se houver histórico em
            localStorage. Mantém a home declarativa (sem if condicional aqui). */}
        <RecentlyViewed />
      </div>
    </MainLayout>
  );
}
