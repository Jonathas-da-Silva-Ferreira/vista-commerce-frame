import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ShoppingBag } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation as useShipLocation } from '@/contexts/LocationContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Confirmation step. This route is wrapped in <ProtectedRoute /> at the
 * router level, so this component can safely assume an authenticated user;
 * the guard handles redirect-to-login + return-after-login.
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { location } = useShipLocation();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  // Empty cart on this route means the user navigated here directly or
  // refreshed after completing an order — send them back to shopping.
  useEffect(() => {
    if (!processing && !done && items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, processing, done, navigate]);

  const handleConfirm = async () => {
    if (!location) {
      toast.error('Shipping address (ZIP) is required.');
      return;
    }
    setProcessing(true);
    try {
      // Inventory decrement mirrors what CartPage previously did. Doing it
      // in parallel keeps perceived latency low even with many sellers.
      await Promise.all(
        items.map(item =>
          fetch(`/api/products/${item.product.id}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity }),
          }),
        ),
      );
      clearCart();
      setDone(true);
      toast.success('Order confirmed!');
    } catch {
      toast.error('Could not complete checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank you, {user?.name}!</h1>
          <p className="text-muted-foreground mb-6">
            Your order has been placed. A confirmation has been sent to {user?.email}.
          </p>
          <Button size="lg" onClick={() => navigate('/products')}>
            <ShoppingBag className="w-5 h-5 mr-2" /> Continue shopping
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Confirm your order</h1>

        <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-semibold">{user?.name} <span className="text-muted-foreground font-normal">({user?.email})</span></p>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="truncate mr-2">{product.name} × {quantity}</span>
                <span className="font-medium shrink-0">{formatCurrency(product.price * quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="font-bold">Subtotal</span>
            <span className="font-bold text-xl text-primary">{formatCurrency(total)}</span>
          </div>

          <Button className="w-full h-12 text-base font-semibold" onClick={handleConfirm} disabled={processing}>
            {processing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>) : 'Confirm and pay'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
