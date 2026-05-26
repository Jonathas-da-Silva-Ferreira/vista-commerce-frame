import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck, Zap, DollarSign, Award, MapPin, Loader2, Package, Clock, AlertCircle, Lock } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { SellerShippingResult } from '@/types';

// Recommendation chip per shipping option type. Centralizing icon+label
// here means we don't repeat the visual encoding in every render branch.
const RECOMMENDATION_LABELS: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  cheapest: { label: 'Cheapest', icon: DollarSign, color: 'text-green-600 bg-green-500/10' },
  fastest: { label: 'Fastest', icon: Zap, color: 'text-amber-600 bg-amber-500/10' },
  'best-value': { label: 'Best value', icon: Award, color: 'text-primary bg-primary/10' },
};

/**
 * Inline ZIP-code capture for the cart. Extracted from the page body so the
 * input state (the typed but not-yet-submitted ZIP) doesn't leak into the
 * page-wide LocationContext until the user explicitly submits.
 */
function CartZipInput() {
  const { location, loading, error, calculateShipping, clearLocation } = useLocation();
  const [zip, setZip] = useState('');

  const formatZip = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculateShipping(zip);
  };

  if (location) {
    // Already resolved — show a compact summary with an escape hatch.
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-medium">{location.city || location.state} - {location.state}</p>
            <p className="text-xs text-muted-foreground">{location.region} region • ZIP {location.cep}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearLocation} className="text-xs h-7">
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">Enter your ZIP code to calculate shipping</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="00000-000"
          value={zip}
          onChange={e => setZip(formatZip(e.target.value))}
          className="h-9 text-sm"
          maxLength={9}
        />
        <Button type="submit" size="sm" className="h-9 shrink-0" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calculate'}
        </Button>
      </form>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { location } = useLocation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sellerShipping, setSellerShipping] = useState<SellerShippingResult[]>([]);
  // Tracks the user's carrier choice per seller (sellerId → carrierId).
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, string>>({});
  const [shippingLoading, setShippingLoading] = useState(false);

  // Group items by seller so the UI can mirror real-marketplace "packages",
  // where each seller may ship from a different warehouse.
  const sellerGroups = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      const key = item.product.seller;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  // Pre-compute per-seller subtotals so each package card can render its own
  // total without re-summing on every render of the surrounding component.
  const sellerSubtotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.entries(sellerGroups).forEach(([seller, sellerItems]) => {
      totals[seller] = sellerItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    });
    return totals;
  }, [sellerGroups]);

  // Fetch shipping options whenever the customer's location or cart contents
  // change — both can affect the rate and the originating warehouse.
  useEffect(() => {
    if (!location || items.length === 0) {
      setSellerShipping([]);
      return;
    }

    const sellers = [...new Set(items.map(i => i.product.seller))].map(name => ({
      sellerId: name,
      sellerName: name,
    }));

    setShippingLoading(true);
    fetch('/api/shipping/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        sellers,
      }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to calculate shipping');
        return r.json();
      })
      .then((data: SellerShippingResult[]) => {
        setSellerShipping(data);
        // Default selection = best value per seller. We respect any previous
        // explicit choice the user already made via `...prev`.
        const defaults: Record<string, string> = {};
        data.forEach(s => {
          const bestValue = s.options.find(o => o.recommendation === 'best-value') || s.options[0];
          defaults[s.sellerId] = bestValue.carrier.id;
        });
        setSelectedCarriers(prev => ({ ...defaults, ...prev }));
      })
      .catch(() => {
        setSellerShipping([]);
        toast.error('Could not calculate shipping. Please try again.');
      })
      .finally(() => setShippingLoading(false));
  }, [location, items]);

  const totalShipping = useMemo(() => {
    return sellerShipping.reduce((sum, s) => {
      const carrierId = selectedCarriers[s.sellerId];
      const option = s.options.find(o => o.carrier.id === carrierId);
      return sum + (option?.cost || 0);
    }, 0);
  }, [sellerShipping, selectedCarriers]);

  // Full-order ETA is bound by the slowest package — the buyer expects the
  // last item to arrive within this window.
  const maxDays = useMemo(() => {
    return sellerShipping.reduce((max, s) => {
      const carrierId = selectedCarriers[s.sellerId];
      const option = s.options.find(o => o.carrier.id === carrierId);
      return Math.max(max, option?.days || 0);
    }, 0);
  }, [sellerShipping, selectedCarriers]);

  const handleCheckout = () => {
    if (!location) {
      toast.error('Enter your ZIP code before checkout.');
      return;
    }
    // Guests are redirected to /login with the intended destination in
    // router state. ProtectedRoute would do the same on direct navigation,
    // but doing it here gives us a smoother in-cart UX (toast + banner).
    if (!isAuthenticated) {
      toast.info('Please sign in to complete your purchase.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    // Authenticated path: hand off to the dedicated confirmation page.
    // Keeping order finalization out of CartPage isolates payment logic
    // from cart editing and makes the protected boundary explicit.
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add products to your cart to continue shopping</p>
          <Link to="/products">
            <Button size="lg">Explore products <ArrowRight className="w-5 h-5 ml-2" /></Button>
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
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} from {Object.keys(sellerGroups).length} {Object.keys(sellerGroups).length === 1 ? 'seller' : 'sellers'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">Clear cart</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items grouped by seller — mirrors how multi-store marketplaces
              package shipments and lets each seller pick their own carrier. */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(sellerGroups).map(([sellerName, sellerItems], groupIndex) => {
              const sellerShip = sellerShipping.find(s => s.sellerId === sellerName);
              const selectedId = selectedCarriers[sellerName];
              const selectedOption = sellerShip?.options.find(o => o.carrier.id === selectedId);

              return (
                <div key={sellerName} className="bg-card rounded-xl shadow-card overflow-hidden border border-border/50">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm">Package {groupIndex + 1} • {sellerName}</span>
                        {sellerShip && (
                          <p className="text-[11px] text-muted-foreground">
                            Shipped from {sellerShip.nearestCenter.city} - {sellerShip.nearestCenter.state} (~{sellerShip.distanceKm} km)
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{formatCurrency(sellerSubtotals[sellerName])}</span>
                  </div>

                  <div className="divide-y divide-border/50">
                    {sellerItems.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-4 p-4">
                        <Link to={`/product/${product.id}`} className="flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${product.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1 text-sm">
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">Unit price: {formatCurrency(product.price)}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-primary text-sm">{formatCurrency(product.price * quantity)}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItem(product.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {shippingLoading && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculating delivery options...
                    </div>
                  )}
                  {sellerShip && sellerShip.options.length > 0 && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Choose your delivery
                      </p>
                      <div className="grid gap-2">
                        {sellerShip.options.map(option => {
                          const isSelected = selectedId === option.carrier.id;
                          const rec = option.recommendation ? RECOMMENDATION_LABELS[option.recommendation] : null;
                          return (
                            <button
                              key={option.carrier.id}
                              onClick={() => setSelectedCarriers(prev => ({ ...prev, [sellerName]: option.carrier.id }))}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-sm ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border hover:border-muted-foreground/40'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-primary' : 'border-muted-foreground/40'
                                }`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                                <span className="font-medium">{option.carrier.name}</span>
                                {rec && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 ${rec.color}`}>
                                    <rec.icon className="w-3 h-3" />
                                    {rec.label}
                                  </span>
                                )}
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <span className="font-semibold">{formatCurrency(option.cost)}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" /> {option.days} days
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {selectedOption && (
                        <p className="text-xs text-muted-foreground pt-1">
                          ✓ Package shipping: <span className="font-semibold text-foreground">{formatCurrency(selectedOption.cost)}</span> • ETA: <span className="font-semibold text-foreground">{selectedOption.days} business days</span>
                        </p>
                      )}
                    </div>
                  )}
                  {!location && !shippingLoading && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Enter your ZIP code in the summary to view delivery options
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Order summary — sticky so it remains in view during scroll */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-card sticky top-24 space-y-5 border border-border/50">
              <h2 className="text-lg font-bold">Order Summary</h2>

              {/* Inline ZIP capture keeps users from having to scroll up to
                  the header just to unlock checkout. */}
              <CartZipInput />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>

                {/* Per-seller shipping breakdown — full cost transparency */}
                {sellerShipping.length > 0 && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-primary/20">
                    {sellerShipping.map(s => {
                      const carrierId = selectedCarriers[s.sellerId];
                      const option = s.options.find(o => o.carrier.id === carrierId);
                      return (
                        <div key={s.sellerId} className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate mr-2">
                            Shipping {s.sellerName} <span className="text-[10px]">({option?.carrier.name})</span>
                          </span>
                          <span className="font-medium shrink-0">{option ? formatCurrency(option.cost) : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total shipping</span>
                  {location ? (
                    <span className="font-semibold">{formatCurrency(totalShipping)}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Calculate above</span>
                  )}
                </div>

                {location && maxDays > 0 && (
                  <div className="flex items-center gap-2 text-xs bg-primary/5 rounded-lg p-2.5">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      Full delivery within <span className="font-bold text-foreground">{maxDays} business days</span>
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <div className="text-right">
                    <span className="font-bold text-xl text-primary">{formatCurrency(total + totalShipping)}</span>
                    {total + totalShipping > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        or 12x of {formatCurrency((total + totalShipping) / 12)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold"
                size="lg"
                onClick={handleCheckout}
                disabled={!location}
              >
                {!location ? 'Enter your ZIP code' : isAuthenticated ? 'Checkout' : 'Sign in to checkout'}
                {isAuthenticated || !location ? <ArrowRight className="w-5 h-5 ml-2" /> : <Lock className="w-4 h-4 ml-2" />}
              </Button>

              {/* Inline guidance: state explicitly that auth is required so
                  guests aren't surprised by the redirect when they click. */}
              {!isAuthenticated && location && (
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  You need to sign in to complete your purchase.{' '}
                  <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="text-primary hover:underline font-medium">
                    Login to continue
                  </Link>
                </p>
              )}

              {!location && (
                <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  ZIP code required to complete checkout
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our terms of use
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
