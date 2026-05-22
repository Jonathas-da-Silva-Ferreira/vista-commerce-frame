import { useState } from 'react';
import { MapPin, Loader2, X, Warehouse, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from '@/contexts/LocationContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function LocationSelector() {
  const { location, shipping, loading, error, calculateShipping, clearLocation } = useLocation();
  const [cep, setCep] = useState('');
  const [open, setOpen] = useState(false);
  // Every visible label below routes through i18n; the form data (CEP/city)
  // stays raw because it's user/API content rather than UI copy.
  const { t } = useTranslation();

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculateShipping(cep);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground transition-colors text-left max-w-[200px]">
          <MapPin className="w-4 h-4 shrink-0 text-primary" />
          {location ? (
            <span className="text-xs leading-tight truncate">
              <span className="text-[10px] text-muted-foreground block">{t('location.sendTo')}</span>
              <span className="font-medium">{location.city || location.state} - {location.state}</span>
            </span>
          ) : (
            <span className="text-xs font-medium">
              <span className="text-[10px] text-muted-foreground block">{t('location.enterYour')}</span>
              {t('location.cep')}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{t('location.calculateTitle')}</h4>
            {location && (
              <button onClick={clearLocation} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="00000-000"
              value={cep}
              onChange={e => setCep(formatCep(e.target.value))}
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
              <p className="text-muted-foreground text-xs">{t('location.region')}: {location.region}</p>

              {/* Prazo de entrega — informação mais importante para o cliente */}
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{t('location.deliveryIn')} <span className="font-semibold">{shipping.deliveryDays} {t('location.businessDays')}</span></span>
              </div>

              {/* Centro de distribuição — transparência sobre origem do envio */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Warehouse className="w-3.5 h-3.5" />
                <span>{t('location.sentFrom')} {shipping.nearestCenter.city} - {shipping.nearestCenter.state}</span>
              </div>

              {/* Distância calculada — dado técnico que valida o cálculo */}
              <p className="text-[10px] text-muted-foreground">
                {t('location.distance')}: ~{shipping.distanceKm} km
              </p>

              {shipping.isFreeShipping ? (
                <p className="text-sm font-semibold text-green-500">✓ {t('location.freeShipping')}</p>
              ) : (
                <p className="text-sm">
                  {t('location.shipping')}: <span className="font-semibold text-primary">R$ {shipping.shippingCost.toFixed(2)}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
