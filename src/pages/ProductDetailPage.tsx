import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, Star, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useProduct, useCategories, useRelatedProducts } from '@/hooks/useApi';
import { useLocation } from '@/contexts/LocationContext';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-1 md:pb-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              i === selectedIndex
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-muted-foreground/40'
            }`}
          >
            <img src={img} alt={`${name} - ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-square overflow-hidden rounded-xl bg-muted">
        <img
          src={images[selectedIndex]}
          alt={name}
          className="w-full h-full object-cover animate-fade-in"
          key={selectedIndex}
        />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const { product, loading } = useProduct(id);
  const { categories } = useCategories();
  const { products: relatedProducts } = useRelatedProducts(product?.id, product?.category);

  const category = categories.find(c => c.slug === product?.category);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-5 bg-muted rounded w-48 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-3">
                <div className="hidden md:flex flex-col gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-20 h-20 bg-muted rounded-lg" />
                  ))}
                </div>
                <div className="flex-1 aspect-square bg-muted rounded-xl" />
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-12 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
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
          <Link to="/produtos" className="text-primary hover:underline">Voltar para produtos</Link>
        </div>
      </MainLayout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const allImages = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/produtos" className="hover:text-foreground transition-colors">Produtos</Link>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/produtos?categoria=${category.slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery */}
          <div className="relative">
            <ImageGallery images={allImages} name={product.name} />
            {discount && (
              <span className="absolute top-4 right-4 md:left-auto bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-sm font-bold z-10">
                -{discount}%
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vendido por <span className="text-primary font-medium">{product.seller}</span></p>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted'}`} />
                ))}
              </div>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground text-sm">({product.reviewCount} avaliações)</span>
            </div>

            {/* Price */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-1">
              {product.originalPrice && (
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</p>
                  {discount && (
                    <span className="text-sm font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                      -{discount}% OFF
                    </span>
                  )}
                </div>
              )}
              <p className="text-3xl md:text-4xl font-bold text-primary">{formatCurrency(product.price)}</p>
              <p className="text-sm text-muted-foreground">
                Em até <span className="font-semibold text-foreground">12x</span> de{' '}
                <span className="font-semibold text-foreground">{formatCurrency(product.price / 12)}</span> sem juros
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold mb-2">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-muted/50">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Frete Grátis</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-muted/50">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Compra Segura</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-muted/50">
                <RotateCcw className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Devolução Grátis</span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  {product.stock} em estoque
                </span>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 h-12 text-base font-semibold" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart(product.id) ? 'Atualizar Carrinho' : 'Comprar'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`h-12 w-12 ${isFavorite(product.id) ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}`}
                  onClick={() => toggleFavorite(product)}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-destructive' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Produtos Relacionados</h2>
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">🤖 IA em breve</span>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
