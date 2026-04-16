import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/SearchBar';
import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import { useCategories, useBanners } from '@/hooks/useApi';

/**
 * HomePage — entrada principal do marketplace.
 *
 * Decisão de arquitetura:
 * Removemos as listas "Produtos em Destaque" e "Promoções" da home para
 * forçar a navegação por categorias (padrão de marketplaces reais como
 * Mercado Livre/Amazon). Isso reduz ruído visual, melhora performance
 * (menos requests na landing) e direciona o usuário ao funil correto.
 *
 * Promoções e Destaques continuam acessíveis, mas apenas como categorias
 * dedicadas (/produtos?categoria=promocao e ?categoria=melhores-produtos),
 * o que mantém a lógica de filtragem centralizada em ProductsPage e evita
 * duplicação de componentes de listagem.
 */
export default function HomePage() {
  // Apenas dados estritamente necessários para a home: categorias + banners.
  // Hooks de produtos foram removidos intencionalmente para não disparar
  // chamadas desnecessárias à API na landing.
  const { categories } = useCategories();
  const { banners, loading: bannerLoading } = useBanners();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Busca em destaque: principal CTA para usuários com intenção definida */}
        <section>
          <SearchBar />
        </section>

        {/* Banner promocional rotativo — único bloco "comercial" da home */}
        <section>
          <Banner banners={banners} loading={bannerLoading} />
        </section>

        {/* Grid de categorias é o eixo central de navegação */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <CategoryGrid categories={categories} />
        </section>
      </div>
    </MainLayout>
  );
}
