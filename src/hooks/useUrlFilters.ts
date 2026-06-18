import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { defaultFilterState, type FilterState } from '@/components/FilterSidebar';

/**
 * useUrlFilters — fonte única de verdade para filtros: a URL.
 *
 * Por quê na URL e não em useState:
 *  1. Refresh preserva o estado (estado em memória se perde).
 *  2. Compartilhar link = compartilhar filtro aplicado (UX de marketplace).
 *  3. Histórico do browser permite voltar/avançar entre conjuntos de filtros.
 *  4. SSR/SEO futuro fica trivial (a URL já carrega a intenção).
 *
 * Schema dos params (curtos para URLs limpas):
 *  - q          → query de busca
 *  - category   → slug da categoria (legacy; rota /category/:slug é preferida)
 *  - sub        → subcategoria
 *  - min, max   → faixa de preço
 *  - sort       → critério de ordenação
 *  - rating     → rating mínimo (1–5)
 *
 * Decisão de design: arrays não aparecem aqui (priceRange é tupla fixa min/max,
 * serializada como dois campos escalares). Isso evita o cuspideiro de CSVs
 * codificados na URL e mantém os params legíveis a olho nu.
 */
export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Reconstrói o FilterState a partir dos params. useMemo evita criar um
  // novo objeto a cada render (importante porque ele é dependência de
  // useEffect em ProductsPage).
  const filters: FilterState = useMemo(() => {
    const min = Number(searchParams.get('min'));
    const max = Number(searchParams.get('max'));
    const rating = Number(searchParams.get('rating'));
    return {
      // Number(null|'') vira NaN; isFinite garante valores válidos antes
      // de aceitar — caso contrário o slider exibe NaN e quebra.
      priceRange: [
        Number.isFinite(min) && min > 0 ? min : defaultFilterState.priceRange[0],
        Number.isFinite(max) && max > 0 ? max : defaultFilterState.priceRange[1],
      ],
      sortBy: searchParams.get('sort') || defaultFilterState.sortBy,
      minRating: Number.isFinite(rating) && rating > 0 ? rating : 0,
      subcategory: searchParams.get('sub') || '',
    };
  }, [searchParams]);

  /**
   * Atualiza um subconjunto de filtros, mesclando com os params atuais.
   *
   * Por que mesclar e não substituir: outras chaves (q, category) também
   * vivem na URL e não devem ser apagadas quando o usuário muda só o
   * sortBy. Substituição total causaria perda silenciosa da busca/categoria.
   */
  const setFilters = useCallback((partial: Partial<FilterState>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);

      // Cada campo é serializado individualmente porque cada um tem regra
      // própria de "quando omitir da URL" (URLs limpas só carregam o que
      // diverge do default — caso contrário a barra ficaria poluída).
      if (partial.priceRange) {
        const [min, max] = partial.priceRange;
        // Só serializa min/max se diferem do default — evita ?min=0&max=5000
        // em toda página de listagem.
        if (min !== defaultFilterState.priceRange[0]) next.set('min', String(min));
        else next.delete('min');
        if (max !== defaultFilterState.priceRange[1]) next.set('max', String(max));
        else next.delete('max');
      }

      if (partial.sortBy !== undefined) {
        if (partial.sortBy && partial.sortBy !== defaultFilterState.sortBy) {
          next.set('sort', partial.sortBy);
        } else {
          next.delete('sort');
        }
      }

      if (partial.minRating !== undefined) {
        if (partial.minRating > 0) next.set('rating', String(partial.minRating));
        else next.delete('rating');
      }

      if (partial.subcategory !== undefined) {
        if (partial.subcategory) next.set('sub', partial.subcategory);
        else next.delete('sub');
      }

      return next;
    }, { replace: true });
    // replace:true evita poluir o histórico — cada ajuste fino de filtro
    // não merece uma entrada própria no back button.
  }, [setSearchParams]);

  /**
   * Remove TODOS os filtros, preservando query (q) e categoria.
   *
   * Por que preservar: usuário clicou "limpar filtros" dentro de
   * "Eletrônicos" — não faz sentido tirá-lo da categoria também.
   */
  const clearFilters = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams();
      const q = prev.get('q');
      const category = prev.get('category');
      if (q) next.set('q', q);
      if (category) next.set('category', category);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return { filters, setFilters, clearFilters };
}
