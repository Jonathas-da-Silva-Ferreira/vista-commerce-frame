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

// Sort options use stable string values (the API receives the value verbatim)
// and human labels for the UI — keeping them paired prevents drift between
// what the user sees and what gets sent over the wire.
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'best-sellers', label: 'Best sellers' },
  { value: 'price-asc', label: 'Lowest price' },
  { value: 'price-desc', label: 'Highest price' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
];

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
  const ratingOptions = [4, 3, 2, 1];
  const activeCategoryData = categories.find(c => c.slug === activeCategory);

  return (
    <div className="space-y-6">
      {/* Categories — visible list keeps the user oriented while filtering */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Categories
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
            <Link
              to="/products"
              className={`block py-2 px-3 rounded-lg transition-colors text-sm ${!activeCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              onClick={onClose}
            >
              All categories
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className={`block py-2 px-3 rounded-lg transition-colors text-sm ${activeCategory === cat.slug ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                onClick={onClose}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Subcategories appear only for categories that define them — avoids
          rendering an empty filter group that would just confuse users. */}
      {activeCategoryData?.subcategories && activeCategoryData.subcategories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
            Subcategories
            <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1">
              <button
                onClick={() => onFiltersChange({ subcategory: '' })}
                className={`block w-full text-left py-2 px-3 rounded-lg transition-colors text-sm ${!filters.subcategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              >
                All
              </button>
              {activeCategoryData.subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => onFiltersChange({ subcategory: sub })}
                  className={`block w-full text-left py-2 px-3 rounded-lg transition-colors text-sm ${filters.subcategory === sub ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Price range — slider gives faster exploration than two number inputs */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Price range
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
              <span className="text-muted-foreground">to</span>
              <span className="bg-muted px-2 py-1 rounded">{formatCurrency(filters.priceRange[1])}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating filter — "X stars and above" pattern matches Amazon/Mercado
          conventions and is more useful than exact-equality buckets. */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 hover:text-primary transition-colors">
          Rating
          <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1">
            <button
              onClick={() => onFiltersChange({ minRating: 0 })}
              className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm transition-colors ${filters.minRating === 0 ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
            >
              All
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
                <span>&amp; up</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sort */}
      <div>
        <span className="font-semibold block mb-3">Sort by</span>
        <Select value={filters.sortBy} onValueChange={(v) => onFiltersChange({ sortBy: v })}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={onClearFilters}>
        <X className="w-4 h-4 mr-2" />
        Clear filters
      </Button>
    </div>
  );
}
