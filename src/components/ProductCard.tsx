import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Discount is derived (not stored) so it always reflects the latest price
  // pair — Math.round avoids confusing fractional "-23.7%" badges.
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    // Card is a Link, so we must stop the click from also navigating to the
    // detail page when the user just wants to drop the item in the cart.
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {discount && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-lg text-xs font-bold">
            -{discount}%
          </span>
        )}

        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 w-8 h-8 bg-card/90 rounded-full flex items-center justify-center hover:bg-card transition-colors"
          aria-label={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="mb-3">
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through mr-2">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full"
          // Variant flips once the item is already in the cart so the affordance
          // matches the action available (re-add vs already added).
          variant={isInCart(product.id) ? 'secondary' : 'default'}
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isInCart(product.id) ? 'In cart' : 'Add'}
        </Button>
      </div>
    </Link>
  );
}
