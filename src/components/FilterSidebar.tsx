import { Link } from 'react-router-dom';
import { ChevronDown, X, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { useCategoryLabel } from '@/hooks/useCategoryLabel';
// Subcategory labels come from the API as raw pt-BR strings — this hook
// localizes them at render time without breaking the filter contract (the
// API still receives the original Portuguese value).
import { useSubcategoryLabel } from '@/hooks/useSubcategoryLabel';

// Sort options keep stable VALUES (used by the API) but their LABELS are
// resolved via i18n at render time so they react to language changes.
const SORT_KEYS = ['relevance', 'best-sellers', 'price-asc', 'price-desc', 'rating', 'newest'] as const;

export interface FilterState {
  priceRange: [number, number];
  sortBy: string;
  minRating: number;
  subcategory: string;
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
  subcategory: '',
};

export default function FilterSidebar({
  categories,
  activeCategory,
  filters,
  onFiltersChange,
  onClearFilters,
  onClose,
}: FilterSidebarProps) {
  const { t } = useTranslation();
  const labelFor = useCategoryLabel();
  const subLabelFor = useSubcategoryLabel();
  const ratingOptions = [4, 3, 2, 1];
  const activeCategoryData = categories.find(c => c.slug === activeCategory);
  return (
    <div className="space-y-6">
      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          {t('filters.categories')}
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
            <Link
              to="/produtos"
              className={`block py-2 px-3 rounded-lg transition-colors text-sm ${!activeCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              onClick={onClose}
            >
              {t('filters.allCategories')}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/produtos?categoria=${cat.slug}`}
                className={`block py-2 px-3 rounded-lg transition-colors text-sm ${activeCategory === cat.slug ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                onClick={onClose}
              >
                {labelFor(cat.slug, cat.name)}
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Subcategories — the API value (Portuguese) is preserved as the
          filter key; only the visible label is translated via i18n. */}
      {activeCategoryData?.subcategories && activeCategoryData.subcategories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
            {t('filters.subcategories')}
            <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1">
              <button
                onClick={() => onFiltersChange({ subcategory: '' })}
                className={`block w-full text-left py-2 px-3 rounded-lg transition-colors text-sm ${!filters.subcategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              >
                {t('filters.allSubcategories')}
              </button>
              {activeCategoryData.subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => onFiltersChange({ subcategory: sub })}
                  className={`block w-full text-left py-2 px-3 rounded-lg transition-colors text-sm ${filters.subcategory === sub ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                >
                  {subLabelFor(sub)}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          {t('filters.priceRange')}
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
              <span className="text-muted-foreground">{t('common.until')}</span>
              <span className="bg-muted px-2 py-1 rounded">{formatCurrency(filters.priceRange[1])}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          {t('filters.rating')}
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1">
            <button
              onClick={() => onFiltersChange({ minRating: 0 })}
              className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm transition-colors ${filters.minRating === 0 ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
            >
              {t('filters.allSubcategories')}
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
                <span>{t('filters.andAbove')}</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sort */}
      <div>
        <span className="font-semibold block mb-3">{t('filters.sortBy')}</span>
        <Select value={filters.sortBy} onValueChange={(v) => onFiltersChange({ sortBy: v })}>
          <SelectTrigger className="w-full"><SelectValue placeholder={t('filters.sortBy')} /></SelectTrigger>
          <SelectContent>
            {SORT_KEYS.map(key => (
              <SelectItem key={key} value={key}>{t(`filters.sort.${key}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={onClearFilters}>
        <X className="w-4 h-4 mr-2" />
        {t('filters.clear')}
      </Button>
    </div>
  );
}
