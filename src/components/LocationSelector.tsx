import { useState } from 'react';
import { MapPin, Loader2, X, Warehouse, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from '@/contexts/LocationContext';
import { formatCurrency } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function LocationSelector() {
  const { location, shipping, loading, error, calculateShipping, clearLocation } = useLocation();
  const [zip, setZip] = useState('');
  const [open, setOpen] = useState(false);

  // ZIP input is masked while typing so the user can paste freely (digits or
  // formatted) and we always end up with the canonical 5+3 layout used by the
  // backend lookup. The underlying postal-code logic still targets BR ZIPs.
  const formatZip = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculateShipping(zip);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground transition-colors text-left max-w-[200px]">
          <MapPin className="w-4 h-4 shrink-0 text-primary" />
          {location ? (
            <span className="text-xs leading-tight truncate">
              <span className="text-[10px] text-muted-foreground block">Ship to</span>
              <span className="font-medium">{location.city || location.state} - {location.state}</span>
            </span>
          ) : (
            <span className="text-xs font-medium">
              <span className="text-[10px] text-muted-foreground block">Enter your</span>
              ZIP code
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Calculate shipping &amp; delivery</h4>
            {location && (
              <button onClick={clearLocation} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'OK'}
            </Button>
          </form>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {location && shipping && (
            <div className="text-sm space-y-2 pt-2 border-t border-border">
              <p className="font-medium">{location.city || location.state} - {location.state}</p>
              <p className="text-muted-foreground text-xs">Region: {location.region}</p>

              {/* Delivery ETA is the single most important number for the
                  buyer — surfaced first and with stronger weight. */}
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Delivery in up to <span className="font-semibold">{shipping.deliveryDays} business days</span></span>
              </div>

              {/* Showing the originating warehouse builds buyer trust by being
                  transparent about where the package ships from. */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Warehouse className="w-3.5 h-3.5" />
                <span>Shipped from {shipping.nearestCenter.city} - {shipping.nearestCenter.state}</span>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Distance: ~{shipping.distanceKm} km
              </p>

              {shipping.isFreeShipping ? (
                <p className="text-sm font-semibold text-green-500">✓ Free shipping</p>
              ) : (
                <p className="text-sm">
                  Shipping: <span className="font-semibold text-primary">{formatCurrency(shipping.shippingCost)}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
