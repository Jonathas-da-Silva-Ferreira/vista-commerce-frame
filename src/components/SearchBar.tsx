import { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

/**
 * SearchBar — busca com autocomplete instantâneo.
 *
 * Decisões de design:
 *  - Debounce de 250ms: equilíbrio entre sensação de "tempo real" e
 *    evitar disparar uma query a cada tecla. < 200ms parece nervoso,
 *    > 300ms parece travado.
 *  - useDeferredValue além do debounce: React 18 dá prioridade ao input
 *    do usuário (digitação fluida) e só recalcula sugestões quando há
 *    folga — combate o "lag de digitação" em devices fracos.
 *  - Sugestões clicáveis viram <Link>: navegação por clique e Enter,
 *    foco visível, suporte a Cmd+Click para abrir em nova aba (UX padrão).
 *  - Teclado: ↑↓ navega, Enter ativa, Esc fecha. Acessibilidade não-negociável.
 */
export default function SearchBar({ initialQuery = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  // Índice da sugestão "selecionada" via teclado — -1 = nada selecionado
  // (Enter envia o termo bruto em vez de uma sugestão).
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce manual com setTimeout: lib externa seria overkill para um único
  // input. cleanup do useEffect garante cancelamento do timer anterior.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  // useDeferredValue marca essa string como "baixa prioridade" — React vai
  // priorizar o input do usuário em re-renders concorrentes.
  const deferredQuery = useDeferredValue(debouncedQuery);

  // Memoiza o filter object para que useProducts não dispare nova request
  // por identidade de objeto em cada render. Sem isso, o cache key mudaria
  // a cada digitação mesmo com o termo igual.
  const filters = useMemo(
    () => (deferredQuery.length >= 2 ? { query: deferredQuery } : undefined),
    [deferredQuery]
  );

  // limit=6: número confortável de sugestões — mais que isso vira lista
  // de produtos (já temos a página /products pra isso).
  const { data: suggestions } = useProducts(filters, 1, 6);

  // Fechar ao clicar fora — padrão de combobox. mousedown (não click)
  // dispara antes do focus, evitando race entre "clicar na sugestão" e
  // "fechar o dropdown".
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const submit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setIsOpen(false);
    if (onSearch) onSearch(trimmed);
    else navigate(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Só processa teclas de navegação quando há sugestões visíveis — caso
    // contrário deixa o comportamento default (form submit via Enter).
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit(query);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Modulo permite loop: passar do último volta ao primeiro.
      setActiveIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Se há sugestão ativa, navega direto pro produto — atalho de poder.
      if (activeIndex >= 0) navigate(`/product/${suggestions[activeIndex].id}`);
      else submit(query);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(query);
  };

  const showSuggestions = isOpen && debouncedQuery.length >= 2 && suggestions.length > 0;

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            // ARIA combobox: combina input + listbox para leitores de tela
            // entenderem o pattern de autocomplete.
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `sugg-${activeIndex}` : undefined}
            className="pr-20 h-12 text-base bg-card border-2 border-border focus:border-primary rounded-full shadow-soft"
          />
          {query && (
            // Botão de limpar aparece apenas com conteúdo — evita ruído visual
            // num input vazio. type="button" impede submit acidental do form.
            <button
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="absolute right-11 h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-1 h-10 w-10 rounded-full hover:bg-primary/10"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </form>

      {showSuggestions && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 mt-2 w-full bg-card border border-border rounded-2xl shadow-lg overflow-hidden animate-fade-in"
        >
          {suggestions.map((p, i) => (
            <li
              key={p.id}
              id={`sugg-${i}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <Link
                to={`/product/${p.id}`}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  i === activeIndex ? 'bg-muted' : 'hover:bg-muted'
                }`}
              >
                {/* Thumbnail pequeno ajuda no scan visual: usuários
                    reconhecem produtos por imagem mais rápido que por texto. */}
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {formatCurrency(p.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
