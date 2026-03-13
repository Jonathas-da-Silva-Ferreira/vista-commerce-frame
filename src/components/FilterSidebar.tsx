import { Link } from 'react-router-dom';
import { ChevronDown, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Category } from '@/types';
import { formatCurrency } from '@/lib/utils';

const sortOptions = [
  { value: 'relevance', label: 'Mais Relevantes' },
  { value: 'best-sellers', label: 'Mais Vendidos' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'newest', label: 'Mais Recentes' },
];

export interface FilterState {
  priceRange: [number, number];
  sortBy: string;
  minRating: number;
}

interface FilterSidebarProps {
  categories: Category[];
  activeCategory?: string;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onClose?: () => void;
}

export const defaultFilterState: FilterState = {
  priceRange: [0, 5000],
  sortBy: 'relevance',
  minRating: 0,
};

export default function FilterSidebar({
  categories,
  activeCategory,
  filters,
  onFiltersChange,
  onClearFilters,
  onClose,
}: FilterSidebarProps) {
  const ratingOptions = [4, 3, 2, 1];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Categorias
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
            <Link
              to="/produtos"
              className={`block py-2 px-3 rounded-lg transition-colors text-sm ${!activeCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              onClick={onClose}
            >
              Todas as Categorias
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/produtos?categoria=${cat.slug}`}
                className={`block py-2 px-3 rounded-lg transition-colors text-sm ${activeCategory === cat.slug ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                onClick={onClose}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Subcategories for active category */}
      {activeCategoryData?.subcategories && activeCategoryData.subcategories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
            Subcategorias
            <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1">
              {activeCategoryData.subcategories.map((sub) => (
                <button
                  key={sub}
                  className="block w-full text-left py-2 px-3 rounded-lg transition-colors text-sm hover:bg-muted"
                >
                  {sub}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Faixa de Preço
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 px-1">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => onFiltersChange({ priceRange: value as [number, number] })}
              max={5000}
              min={0}
              step={50}
              className="mt-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="bg-muted px-2 py-1 rounded">{formatCurrency(filters.priceRange[0])}</span>
              <span className="text-muted-foreground">até</span>
              <span className="bg-muted px-2 py-1 rounded">{formatCurrency(filters.priceRange[1])}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Avaliação
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1">
            <button
              onClick={() => onFiltersChange({ minRating: 0 })}
              className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm transition-colors ${filters.minRating === 0 ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
            >
              Todas
            </button>
            {ratingOptions.map((rating) => (
              <button
                key={rating}
                onClick={() => onFiltersChange({ minRating: rating })}
                className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm transition-colors ${filters.minRating === rating ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                <span>& acima</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sort */}
      <div>
        <span className="font-semibold block mb-3">Ordenar por</span>
        <Select value={filters.sortBy} onValueChange={(v) => onFiltersChange({ sortBy: v })}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={onClearFilters}>
        <X className="w-4 h-4 mr-2" />
        Limpar Filtros
      </Button>
    </div>
  );
}
