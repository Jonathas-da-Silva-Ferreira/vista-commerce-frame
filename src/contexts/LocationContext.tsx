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

// Chave fixa para localStorage — centralizada como constante
// para facilitar busca e evitar typos em múltiplos pontos
const STORAGE_KEY = 'marketbr_location';

export function LocationProvider({ children }: { children: ReactNode }) {
  // Inicializa estado com valor do localStorage via lazy initializer —
  // evita leitura síncrona do storage a cada re-render
  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  // shipping separado de location porque pode ser recalculado independentemente
  // (ex: mesmo CEP, mas produto diferente com frete diferente)
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalcula frete genérico ao restaurar localização do storage —
  // necessário porque o shipping não é persistido (depende de dados do backend)
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

  // useCallback para estabilizar referência — evita re-renders desnecessários
  // em componentes que recebem calculateShipping como prop
  const calculateShipping = useCallback(async (cep: string) => {
    // Remove tudo que não é número para aceitar CEP com ou sem máscara
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setError('CEP inválido. Informe 8 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Pipeline de 2 etapas: primeiro resolve CEP → localização,
      // depois localização → custo de frete. Separado para permitir
      // futura troca do provider de CEP sem afetar cálculo de frete
      const locRes = await fetch(`/api/location?cep=${cleanCep}`);
      if (!locRes.ok) throw new Error('CEP não encontrado');
      const locData: LocationData = await locRes.json();

      const shipRes = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: locData.cep, state: locData.state, region: locData.region }),
      });
      const shipData: ShippingResult = await shipRes.json();

      setLocation(locData);
      setShipping(shipData);
      // Persiste apenas localização — frete é recalculado dinamicamente
      // pois pode variar por produto
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
