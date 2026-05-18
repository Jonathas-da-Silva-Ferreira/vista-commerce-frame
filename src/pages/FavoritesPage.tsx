import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();
  // useTranslation re-renders the page on language change, so labels stay
  // in sync without any manual subscription.
  const { t } = useTranslation();

  if (favorites.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('favorites.empty')}</h1>
          <p className="text-muted-foreground mb-6">{t('favorites.emptyDesc')}</p>
          <Link to="/produtos">
            <Button size="lg">{t('cart.explore')}</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('favorites.title')}</h1>
            {/* Intl.NumberFormat is locale-aware and avoids a custom plural map. */}
            <p className="text-muted-foreground">
              {new Intl.NumberFormat().format(favorites.length)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFavorites}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t('common.remove')}
          </Button>
        </div>

        <ProductGrid products={favorites} />
      </div>
    </MainLayout>
  );
}
