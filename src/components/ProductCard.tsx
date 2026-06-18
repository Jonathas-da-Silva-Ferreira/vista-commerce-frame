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

/**
 * Custom event que o Header escuta para animar o badge do carrinho.
 *
 * Por quê um CustomEvent (e não um campo em CartContext): o "pulso" é
 * efêmero — não pertence ao estado da aplicação, só ao momento do clique.
 * Adicionar `lastAddedAt` ao context provocaria re-render de todos os
 * consumidores a cada add. Event = fire-and-forget, observado só por quem
 * se importa.
 */
const CART_PULSE_EVENT = 'nexora:cart-pulse';

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    // Card inteiro é <Link>: preventDefault evita navegar quando o
    // usuário só quer adicionar; stopPropagation impede bubbling para o
    // handler de hover do card (que poderia disparar outros efeitos).
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    // Dispara o pulso global — Header escuta este evento e anima o badge.
    // Despachado no window porque o Header vive numa árvore de portal/
    // layout separado deste card.
    window.dispatchEvent(new CustomEvent(CART_PULSE_EVENT));
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  const favorited = isFavorite(product.id);

  return (
    <Link
      to={`/product/${product.id}`}
      // hover:-translate-y-1 cria o "lift" sutil que comunica interatividade
      // melhor que sombra sozinha; transition cobre TODAS as propriedades
      // animáveis (shadow, transform) num único ease coerente.
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          // loading="lazy" + decoding="async" + aspect-square (no parent)
          // são a tríade contra CLS: imagem ocupa o espaço CERTO desde o
          // primeiro paint, mesmo sem ter baixado ainda.
          loading="lazy"
          decoding="async"
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
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorited}
        >
          {/* `key={favorited}` força remount do ícone ao alternar, replayando
              animate-scale-in. Comunica visualmente que a ação registrou. */}
          <Heart
            key={String(favorited)}
            className={`w-4 h-4 animate-scale-in ${
              favorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'
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
