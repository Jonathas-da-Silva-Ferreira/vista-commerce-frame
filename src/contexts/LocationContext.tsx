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

// Mapeamento UF → região seguindo divisão oficial do IBGE —
// fonte única de verdade para evitar inconsistências entre componentes
const UF_TO_REGION: Record<string, string> = {
  RS: 'Sul', SC: 'Sul', PR: 'Sul',
  SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
  AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
};

/**
 * Consulta a API pública ViaCEP para obter dados reais de localização.
 * Decisão: usar ViaCEP ao invés do mock porque o mapeamento por primeiro
 * dígito do CEP era impreciso — ex: CEP 69 é AM, não PA.
 */
async function fetchLocationFromViaCep(cep: string): Promise<LocationData> {
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!res.ok) throw new Error('Falha na consulta do CEP');

  const data = await res.json();

  // ViaCEP retorna { erro: true } para CEPs válidos em formato mas inexistentes
  if (data.erro) throw new Error('CEP não encontrado');

  const state = data.uf as string;
  const region = UF_TO_REGION[state];

  if (!region) throw new Error('Estado não mapeado para região');

  return {
    cep,
    state,
    city: data.localidade || undefined,
    region,
  };
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalcula frete genérico ao restaurar localização do storage —
  // shipping não é persistido pois depende dos dados de produto no backend
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
      // Etapa 1: consulta ViaCEP (API real) para obter UF e cidade corretos
      const locData = await fetchLocationFromViaCep(cleanCep);

      // Etapa 2: calcula frete via mock server usando a região real
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
      setError('Não foi possível calcular o frete. Tente novamente.');
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
