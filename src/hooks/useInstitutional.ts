// Hook genérico para conteúdo institucional.
//
// Por que UM hook genérico (e não 3 separados como em useApi.ts)?
// - O shape de cada conteúdo é diferente (About ≠ History ≠ Terms),
//   mas a MECÂNICA é idêntica: fetch único, sem parâmetros, com loading/error.
// - Genéricos com type parameter <T> evitam triplicação de boilerplate
//   (3 useState, 3 useEffect, 3 cancelled flags) e mantêm tipagem forte.
// - Cada página chama com o método específico do api service e recebe
//   o tipo correto inferido automaticamente.

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { AboutContent, HistoryContent, TermsContent } from '@/types';

// Union type evita acoplar o hook a strings mágicas — autocomplete e
// type-checking garantem que só métodos válidos sejam passados.
type InstitutionalFetcher<T> = () => Promise<T>;

function useInstitutional<T>(fetcher: InstitutionalFetcher<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag cancelled previne setState após unmount — evita o warning
    // "Can't perform a React state update on an unmounted component"
    // quando o usuário navega rápido entre páginas institucionais.
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcher()
      .then(result => { if (!cancelled) setData(result); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetcher é estável (método de classe singleton); dep vazio é seguro.

  return { data, loading, error };
}

// Wrappers tipados — evitam que o consumer precise importar o api service
// diretamente E garantem o tipo correto sem precisar passar generic manualmente.
export const useAbout = () => useInstitutional<AboutContent>(() => api.getAbout());
export const useHistory = () => useInstitutional<HistoryContent>(() => api.getHistory());
export const useTerms = () => useInstitutional<TermsContent>(() => api.getTerms());
