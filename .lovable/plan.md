## Objetivo

Elevar a dinâmica percebida do site atacando os 4 eixos em um pacote médio coeso: performance percebida, fluidez visual, conversão na Home e busca/filtros. Sem mexer em regras de negócio, autenticação ou backend.

## Entregáveis

### 1. Performance percebida

- **Code-splitting por rota** em `src/App.tsx`: trocar `import` estáticos por `React.lazy` para todas as páginas exceto `HomePage` (LCP). Envolver `<Routes>` num `<Suspense fallback={<RouteFallback />}>`.
- **Barra de progresso de navegação** (estilo NProgress) no topo, disparada por mudança de `location.pathname` — feedback imediato em cada clique.
- **Skeletons padronizados**: criar `src/components/skeletons/` com `ProductCardSkeleton`, `CategoryCardSkeleton`, `BannerSkeleton`. Substituir os `loading` atuais nos componentes que hoje renderizam vazio.
- **Lazy-load de imagens** em `ProductGrid` e `CategoryGrid`: `loading="lazy"`, `decoding="async"` e `width`/`height` explícitos para zerar CLS. Imagem do banner principal recebe `fetchpriority="high"`.

### 2. Fluidez visual

- **Transições de rota** com `framer-motion` + `AnimatePresence` (fade + slide curto de 200ms). Isolado num componente `AnimatedRoutes` para não poluir `App.tsx`.
- **Micro-interações nos `ProductCard`**: hover com lift sutil (`translateY(-4px)` + shadow), animação de favoritar (escala no coração), e animação de "adicionar ao carrinho" — o card emite uma partícula visual que voa até o ícone do carrinho no header.
- **Badge de carrinho com contador animado** (escala bounce quando aumenta).

### 3. Conversão na Home

A home hoje é só `search + banner + categorias`. Vamos adicionar 3 seções abaixo das categorias (sem retirar nada do que existe):

- **Produtos em destaque** (`featured=true`) — carrossel horizontal com snap.
- **Ofertas do dia** (`promotion=true`) — grid de 4 produtos com badge de desconto e contador "restam X".
- **Vistos recentemente** — lê de `localStorage` (chave `nexora:recent`), só renderiza se houver itens. Grava ao entrar em `ProductDetailPage`.

Cada seção tem `<h2>` semântico + link "Ver todos" apontando pra `/category/best-products` ou `/category/deals`.

### 4. Busca e filtros

- **Autocomplete instantâneo** no `SearchBar`: debounce 250ms, lista até 6 sugestões (nome do produto + categoria). Navegação por teclado (↑↓ Enter Esc). Reusa o hook `useProducts` com `limit=6`.
- **Sincronização completa de filtros na URL** em `ProductsPage`: `priceMin`, `priceMax`, `sort`, `rating`, `subcategory` viram search params. Refresh e compartilhamento preservam o estado.
- **Chips de filtros ativos** acima do `ProductGrid` — cada chip remove um filtro ao clicar no X.

## Arquivos

```text
src/
  App.tsx                                 (lazy + Suspense + AnimatedRoutes)
  components/
    AnimatedRoutes.tsx                    (novo)
    NavigationProgress.tsx                (novo)
    SearchBar.tsx                         (autocomplete)
    ProductCard.tsx                       (micro-interações + fly-to-cart)
    skeletons/
      ProductCardSkeleton.tsx             (novo)
      CategoryCardSkeleton.tsx            (novo)
      BannerSkeleton.tsx                  (novo)
    home/
      FeaturedCarousel.tsx                (novo)
      DealsGrid.tsx                       (novo)
      RecentlyViewed.tsx                  (novo)
    products/
      ActiveFilterChips.tsx               (novo)
  hooks/
    useRecentlyViewed.ts                  (novo, localStorage)
    useUrlFilters.ts                      (novo, sync filtros↔URL)
  pages/
    HomePage.tsx                          (3 novas seções)
    ProductsPage.tsx                      (URL sync + chips)
    ProductDetailPage.tsx                 (grava em recent)
```

## Detalhes técnicos

- **framer-motion** já está disponível no projeto Lovable; não precisa instalar.
- **NavigationProgress** usa `useLocation` + `useEffect`; barra é um `<div>` fixo com `transform: scaleX()` animado via CSS — zero dependência extra.
- **Fly-to-cart**: ref no botão "Adicionar" e ref global no ícone do carrinho expostos via `CartContext`; ao adicionar, clona a imagem do produto num portal e anima posição com `framer-motion` (`layoutId` ou `animate` com coordenadas calculadas via `getBoundingClientRect`).
- **useRecentlyViewed**: máximo 12 itens, dedupe por `id`, mais recente primeiro, TTL informal de 30 dias.
- **useUrlFilters**: encapsula `useSearchParams`, expõe `{ filters, setFilter, clearAll }`. Serialização: números viram string, arrays viram CSV. Decodificação no mount evita "flash" de filtros vazios.
- **Autocomplete**: usa `useProducts({ query }, 1, 6)` com `useDeferredValue` pra não bloquear digitação.
- **Suspense fallback**: layout neutro com `<Header />` e skeleton genérico no `<main>` — evita pular o header durante a transição.

## Fora de escopo desta rodada

- Tradução PT-BR completa (UI ainda em EN).
- Server-side rendering / Edge caching.
- Refatoração do mockServer ou camada de dados.
- Mudanças no Admin.

## Riscos

- **Animações em mobile**: respeitar `prefers-reduced-motion` em todas as transições novas (transição vira `opacity` simples ou nenhuma).
- **URL sync** pode colidir com `useEffect` que reseta paginação — preciso garantir que mudança de filtro por URL não dispare loop. Solução: comparar valor anterior antes de chamar `setSearchParams`.
- **Fly-to-cart** depende de o ref do carrinho existir no header em todas as rotas — já garantido pelo `StorefrontShell` que monta `<Header />` uma vez.
