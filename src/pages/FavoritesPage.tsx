import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ProductGrid from '@/components/ProductGrid';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';

// Single SEO snippet rendered once — extracted so both render branches
// (empty state and populated list) share the same metadata without
// duplicating the JSX inside each MainLayout.
const favoritesSeo = (
  <SEO
    title="Your favorite products"
    description="Saved products you love on Nexora. Revisit your wishlist and add them to your cart whenever you're ready."
  />
);

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">You don't have any favorites yet</h1>
          <p className="text-muted-foreground mb-6">Save products to view them later.</p>
          <Link to="/products">
            <Button size="lg">Explore products</Button>
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
            <h1 className="text-2xl font-bold">My Favorites</h1>
            {/* Intl.NumberFormat avoids hand-rolling locale-aware grouping. */}
            <p className="text-muted-foreground">
              {new Intl.NumberFormat('en-US').format(favorites.length)} {favorites.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFavorites}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear all
          </Button>
        </div>

        <ProductGrid products={favorites} />
      </div>
    </MainLayout>
  );
}
