import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

// SearchBar accepts an optional onSearch callback so pages already in the
// listing view (ProductsPage) can update URL params in place instead of
// triggering a full navigation — avoids a flash of empty results.
export default function SearchBar({ initialQuery = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/products?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-12 h-12 text-base bg-card border-2 border-border focus:border-primary rounded-full shadow-soft"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-1 h-10 w-10 rounded-full hover:bg-primary/10"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </form>
  );
}
