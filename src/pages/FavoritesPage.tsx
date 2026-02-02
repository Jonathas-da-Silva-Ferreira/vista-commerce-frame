import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nenhum favorito ainda</h1>
          <p className="text-muted-foreground mb-6">
            Adicione produtos aos seus favoritos para encontrá-los facilmente depois
          </p>
          <Link to="/produtos">
            <Button size="lg">Explorar Produtos</Button>
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
            <h1 className="text-2xl font-bold">Meus Favoritos</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFavorites}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Favoritos
          </Button>
        </div>

        <ProductGrid products={favorites} />
      </div>
    </MainLayout>
  );
}
