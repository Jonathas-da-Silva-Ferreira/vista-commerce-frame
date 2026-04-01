import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface LocationData {
  cep: string;
  state: string;
  region: string;
  city?: string;
}

interface ShippingResult {
  shippingCost: number;
  isFreeShipping: boolean;
}

interface LocationContextType {
  location: LocationData | null;
  shipping: ShippingResult | null;
  loading: boolean;
  error: string | null;
  calculateShipping: (cep: string) => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

const STORAGE_KEY = 'marketbr_location';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate shipping when location loads from storage
  useEffect(() => {
    if (location && !shipping) {
      fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: location.cep, state: location.state, region: location.region }),
      })
        .then(r => r.json())
        .then(setShipping)
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateShipping = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setError('CEP inválido. Informe 8 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get location from CEP
      const locRes = await fetch(`/api/location?cep=${cleanCep}`);
      if (!locRes.ok) throw new Error('CEP não encontrado');
      const locData: LocationData = await locRes.json();

      // Calculate shipping
      const shipRes = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: locData.cep, state: locData.state, region: locData.region }),
      });
      const shipData: ShippingResult = await shipRes.json();

      setLocation(locData);
      setShipping(shipData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locData));
    } catch {
      setError('Não foi possível calcular o frete. Verifique o CEP.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setShipping(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <LocationContext.Provider value={{ location, shipping, loading, error, calculateShipping, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
