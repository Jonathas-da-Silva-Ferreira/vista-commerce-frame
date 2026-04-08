import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { ShippingResult } from '@/types';

interface LocationData {
  cep: string;
  state: string;
  region: string;
  city?: string;
  // Coordenadas geográficas do cliente — derivadas da capital do estado
  // via lookup estático porque ViaCEP não retorna lat/lng
  latitude: number;
  longitude: number;
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

// Mapeamento UF → região seguindo divisão oficial do IBGE
const UF_TO_REGION: Record<string, string> = {
  RS: 'Sul', SC: 'Sul', PR: 'Sul',
  SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
  AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
};

// Coordenadas aproximadas por capital do estado — usado como fallback
// porque a API ViaCEP não retorna latitude/longitude.
// Em produção, integrar com API de geocoding (Google Maps, Nominatim)
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  AC: { lat: -9.97, lng: -67.81 }, AL: { lat: -9.67, lng: -35.74 },
  AP: { lat: 0.03, lng: -51.07 }, AM: { lat: -3.12, lng: -60.02 },
  BA: { lat: -12.97, lng: -38.51 }, CE: { lat: -3.72, lng: -38.53 },
  DF: { lat: -15.78, lng: -47.93 }, ES: { lat: -20.32, lng: -40.34 },
  GO: { lat: -16.68, lng: -49.25 }, MA: { lat: -2.53, lng: -44.28 },
  MT: { lat: -15.60, lng: -56.10 }, MS: { lat: -20.44, lng: -54.65 },
  MG: { lat: -19.92, lng: -43.94 }, PA: { lat: -1.46, lng: -48.50 },
  PB: { lat: -7.12, lng: -34.86 }, PR: { lat: -25.43, lng: -49.27 },
  PE: { lat: -8.05, lng: -34.87 }, PI: { lat: -5.09, lng: -42.80 },
  RJ: { lat: -22.91, lng: -43.17 }, RN: { lat: -5.79, lng: -35.21 },
  RS: { lat: -30.03, lng: -51.23 }, RO: { lat: -8.76, lng: -63.90 },
  RR: { lat: 2.82, lng: -60.67 }, SC: { lat: -27.60, lng: -48.55 },
  SP: { lat: -23.55, lng: -46.63 }, SE: { lat: -10.91, lng: -37.07 },
  TO: { lat: -10.18, lng: -48.33 },
};

/**
 * Consulta ViaCEP para obter UF e cidade, depois enriquece com coordenadas
 * via lookup estático por estado (capital como aproximação).
 */
async function fetchLocationFromViaCep(cep: string): Promise<LocationData> {
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!res.ok) throw new Error('Falha na consulta do CEP');

  const data = await res.json();
  if (data.erro) throw new Error('CEP não encontrado');

  const state = data.uf as string;
  const region = UF_TO_REGION[state];
  if (!region) throw new Error('Estado não mapeado para região');

  const coords = STATE_COORDS[state] || { lat: -15.78, lng: -47.93 }; // fallback: Brasília

  return {
    cep,
    state,
    city: data.localidade || undefined,
    region,
    latitude: coords.lat,
    longitude: coords.lng,
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

  // Recalcula frete ao restaurar localização do storage
  useEffect(() => {
    if (location && !shipping) {
      fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep: location.cep,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
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
      // Etapa 1: resolve localização real via ViaCEP + coordenadas por estado
      const locData = await fetchLocationFromViaCep(cleanCep);

      // Etapa 2: envia coordenadas para o mock server calcular distância
      // até o centro de distribuição mais próximo via Haversine
      const shipRes = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep: locData.cep,
          latitude: locData.latitude,
          longitude: locData.longitude,
        }),
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
