import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, Star, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, CheckCircle2, Loader2, Zap, DollarSign, Award } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useProduct, useCategories, useRelatedProducts } from '@/hooks/useApi';
import { useLocation } from '@/contexts/LocationContext';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import type { ShippingOption } from '@/types';

// Gallery is split out so the "currently selected image" state stays local —
// nothing outside this widget needs to know which thumbnail is active.
function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* flex-col-reverse keeps the main image on top on mobile without
          duplicating markup or hiding nodes per breakpoint. */}
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

      {/* key={selectedIndex} forces a remount so the fade-in animation
          replays each time the buyer picks a new image. */}
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

const RECOMMENDATION_LABELS: Record<string, { label: string; icon: typeof Zap }> = {
  cheapest: { label: 'Cheapest', icon: DollarSign },
  fastest: { label: 'Fastest', icon: Zap },
  'best-value': { label: 'Best value', icon: Award },
};

// Per-product shipping calculator with multi-carrier comparison. Lives inside
// this page (not a shared component) because the recommendation copy and
// "trust badges" beneath it are product-detail specific.
function ShippingCalculator({ productId }: { productId: string }) {
  const { location, loading: locLoading, error, calculateShipping } = useLocation();
  const [zip, setZip] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [nearestCenter, setNearestCenter] = useState<{ name: string; city: string; state: string } | null>(null);
  const [distanceKm, setDistanceKm] = useState(0);

  const formatZip = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  // Refetch carrier options whenever the user's location changes so the
  // displayed prices/days always reflect the current destination.
  useEffect(() => {
    if (location) {
      fetch('/api/shipping/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          productId,
        }),
      })
        .then(r => r.json())
        .then(data => {
          setShippingOptions(data.options || []);
          setNearestCenter(data.nearestCenter || null);
          setDistanceKm(data.distanceKm || 0);
        })
        .catch(() => {});
    }
  }, [location, productId]);

  const handleCalc = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculateShipping(zip);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sm">Calculate shipping &amp; delivery</span>
      </div>
      <form onSubmit={handleCalc} className="flex gap-2">
        <Input placeholder="00000-000" value={zip} onChange={e => setZip(formatZip(e.target.value))} className="h-9" maxLength={9} />
        <Button type="submit" variant="outline" size="sm" className="h-9" disabled={locLoading}>
          {locLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calculate'}
        </Button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}

      {shippingOptions.length > 0 && location && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-3 text-sm">
          <p className="text-xs text-muted-foreground">
            Delivery to {location.city || location.state} • Shipped from {nearestCenter?.city} (~{distanceKm} km)
          </p>
          <div className="space-y-2">
            {shippingOptions.map(option => {
              const rec = option.recommendation ? RECOMMENDATION_LABELS[option.recommendation] : null;
              return (
                <div
                  key={option.carrier.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    option.recommendation === 'best-value' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{option.carrier.name}</span>
                    {rec && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                        <rec.icon className="w-3 h-3" />
                        {rec.label}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-primary">{formatCurrency(option.cost)}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{option.days} days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trust badges directly under the calculator — proximity to the price
          maximizes their reassurance effect right before "Add to cart". */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-muted/50">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium">Secure Checkout</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-muted/50">
          <RotateCcw className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium">Free Returns</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-muted/50">
          <Truck className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium">Fast Delivery</span>
        </div>
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

  // Skeleton mirrors the final layout so we don't shift content when data
  // arrives — keeps CLS low, which helps both UX and Core Web Vitals.
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
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products" className="text-primary hover:underline">Back to products</Link>
        </div>
      </MainLayout>
    );
  }

  // Discount is derived from the price pair — never store it; that's how
  // promo banners go stale when a sale ends.
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Gallery fallback ensures we always have at least one image to render.
  const allImages = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/products?category=${category.slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="relative">
            <ImageGallery images={allImages} name={product.name} />
            {discount && (
              <span className="absolute top-4 right-4 md:left-auto bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-sm font-bold z-10">
                -{discount}%
              </span>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sold by <span className="text-primary font-medium">{product.seller}</span></p>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            </div>

            {/* Math.floor on the rating prevents an inflated count of filled
                stars (e.g. 3.7 should still show 3 filled, not 4). */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted'}`} />
                ))}
              </div>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground text-sm">({product.reviewCount} reviews)</span>
            </div>

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
              {/* 12x installment hint is a marketplace convention that lifts
                  conversion by reframing high tickets as monthly amounts. */}
              <p className="text-sm text-muted-foreground">
                Up to <span className="font-semibold text-foreground">12x</span> of{' '}
                <span className="font-semibold text-foreground">{formatCurrency(product.price / 12)}</span> interest-free
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <ShippingCalculator productId={product.id} />

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  {/* aria-labels make icon-only +/- discoverable to screen
                      readers; the visible number between them stays as the
                      single source of truth for the current quantity. */}
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg" aria-live="polite">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  {product.stock} in stock
                </span>
              </div>

              <div className="flex gap-3">
                {/* CTA label changes once the item is already in the cart so
                    the user sees the actual outcome of clicking. */}
                <Button className="flex-1 h-12 text-base font-semibold" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart(product.id) ? 'Update cart' : 'Add to cart'}
                </Button>
                {/* Icon-only buttons need an explicit accessible name so
                    screen readers announce the action. The label flips with
                    state so users know whether they are adding or removing
                    the product from their wishlist. */}
                <Button
                  variant="outline"
                  size="lg"
                  className={`h-12 w-12 ${isFavorite(product.id) ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}`}
                  onClick={() => toggleFavorite(product)}
                  aria-label={isFavorite(product.id) ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                  aria-pressed={isFavorite(product.id)}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-destructive' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews positioned right after the buy box — social proof at the
            exact moment of decision converts better than below related items. */}
        <ProductReviews productId={product.id} />

        {relatedProducts.length > 0 && (
          <section className="border-t border-border pt-10 mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Products</h2>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
