import { X } from 'lucide-react';
import { defaultFilterState, type FilterState } from '@/components/FilterSidebar';
import { formatCurrency } from '@/lib/utils';

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemove: (partial: Partial<FilterState>) => void;
}

/**
 * ActiveFilterChips — torna visível QUAIS filtros estão ativos e dá uma
 * forma de removê-los individualmente.
 *
 * Por quê: o sidebar de filtros mostra TUDO disponível, mas o usuário
 * perde rapidamente a noção do que está realmente aplicado quando há 3+
 * filtros simultâneos. Chips resolvem isso com affordance clara (X = remover).
 *
 * Padrão UX clássico: Amazon, MercadoLivre, AirBnB usam exatamente isso.
 */
export default function ActiveFilterChips({ filters, onRemove }: ActiveFilterChipsProps) {
  // Cada chip é {label, reset} — `reset` carrega o partial que zera o filtro
  // específico, deixando o handler unificado.
  const chips: { label: string; reset: Partial<FilterState> }[] = [];

  // Comparação contra o default decide se o filtro está "ativo" — esconde
  // chips que apenas refletem o estado neutro (não fazer isso polui a UI
  // com chips inúteis tipo "Preço: R$0–R$5000").
  if (
    filters.priceRange[0] !== defaultFilterState.priceRange[0] ||
    filters.priceRange[1] !== defaultFilterState.priceRange[1]
  ) {
    chips.push({
      label: `${formatCurrency(filters.priceRange[0])} – ${formatCurrency(filters.priceRange[1])}`,
      // Reset volta ao range padrão (não [0,0], que filtraria tudo fora).
      reset: { priceRange: defaultFilterState.priceRange },
    });
  }

  if (filters.minRating > 0) {
    chips.push({
      label: `${filters.minRating}★ & up`,
      reset: { minRating: 0 },
    });
  }

  if (filters.subcategory) {
    chips.push({
      label: filters.subcategory,
      reset: { subcategory: '' },
    });
  }

  if (filters.sortBy && filters.sortBy !== defaultFilterState.sortBy) {
    chips.push({
      label: `Sort: ${filters.sortBy.replace('-', ' ')}`,
      reset: { sortBy: defaultFilterState.sortBy },
    });
  }

  // Nada ativo → não renderiza nada. Evita uma faixa vazia que tomaria
  // espaço vertical sem comunicar nenhuma informação.
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4" aria-label="Active filters">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onRemove(chip.reset)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors animate-fade-in"
        >
          {chip.label}
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
