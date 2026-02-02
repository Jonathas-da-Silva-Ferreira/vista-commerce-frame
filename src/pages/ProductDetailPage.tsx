import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, Star, Minus, Plus, ShoppingCart, Truck } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { mockApi, categories, products as allProducts } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await mockApi.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="h-10 bg-muted rounded w-1/3" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/produtos" className="text-primary hover:underline">
            Voltar para produtos
          </Link>
        </div>
      </MainLayout>
    );
  }

  const category = categories.find(c => c.slug === product.category);
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/produtos" className="hover:text-foreground transition-colors">
            Produtos
          </Link>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link
                to={`/produtos?categoria=${category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {discount && (
              <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
                -{discount}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">Vendido por {product.seller}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount} avaliações)</span>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-4">
              {product.originalPrice && (
                <p className="text-muted-foreground line-through text-lg">
                  {formatCurrency(product.originalPrice)}
                </p>
              )}
              <p className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Em até 12x de {formatCurrency(product.price / 12)}
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold mb-2">Descrição</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Shipping */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <Truck className="w-5 h-5" />
              <span>Frete grátis para todo o Brasil</span>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.stock} disponíveis)
                </span>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart(product.id) ? 'Atualizar Carrinho' : 'Adicionar ao Carrinho'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleFavorite(product)}
                  className={isFavorite(product.id) ? 'text-destructive border-destructive' : ''}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-destructive' : ''}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Produtos Relacionados</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
