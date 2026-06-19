
## Objetivo

Corrigir duplicações de renderização e mover "Featured" e "Deals" para suas categorias dedicadas, sem mexer no visual/tema.

## 1. HomePage — remover seções duplicadas

`src/pages/HomePage.tsx`:
- Remover `<DealsGrid />` e `<FeaturedCarousel />` (e seus imports).
- Manter: SearchBar, Banner, CategoryGrid, RecentlyViewed.
- Resultado: produtos só aparecem dentro das categorias. A Home vira porta de entrada para navegação por categoria + recém-vistos.

## 2. Categorias especiais já funcionam — apenas validar

`ProductsPage.tsx` já trata `best-products` e `deals` como categorias dinâmicas via flags `featured`/`promotion` (linhas 47–67). Os cards do `CategoryGrid` já linkam para `/products?category=<slug>`, então clicar em "Best Products" ou "Deals" leva à listagem filtrada — sem hardcode, baseado em `isFeatured` / `isPromotion` do produto.

Nada a alterar aqui; só confirmar que continua funcionando após remover as seções da Home.

## 3. Arquivos órfãos

Após remoção, `src/components/home/DealsGrid.tsx` e `src/components/home/FeaturedCarousel.tsx` ficam sem uso. Deletar para não confundir manutenção futura.

`useFeaturedProducts` e `usePromotionProducts` em `useApi.ts` continuam usados? Não — só eram consumidos pelos dois componentes removidos. Manter os hooks (são pequenos e a `ProductsPage` usa a mesma API via `getProducts({featured:true})`), mas marcar como dispensáveis — ou remover. **Decisão: remover** para reduzir superfície morta.

## 4. Duplicação de render / re-render

Revisão rápida do que já está correto e do que ajustar:

- ✅ Header/Footer montados uma só vez em `App.tsx`; `MainLayout` é pass-through.
- ✅ `useApi` tem cache de módulo + dedupe de in-flight + `startedRef` contra StrictMode.
- ✅ `useProducts` já usa `useMemo` no `apiFilters`.
- ⚠️ `useCachedList` tem `loader` em deps do `useEffect`. Como os callers passam arrow inline (`() => api.getCategories()`), a referência muda a cada render. O `startedRef` impede refetch mas o efeito ainda reexecuta sem necessidade. **Fix:** remover `loader` das deps (já é capturado no closure e protegido por `startedRef`) — só `[key]`.
- ⚠️ `ProductsPage` linha 74: `useEffect(..., [..., filterState])` com `filterState` como objeto. Como `useUrlFilters` deriva o objeto a cada render, isso reseta a página em todo render. **Fix:** depender da string serializada (`JSON.stringify(filterState)`) ou dos campos individuais.

## 5. Skeletons / flash

Já existem `BannerSkeleton`, `CategoryCardSkeleton`, `ProductCardSkeleton` e `RouteFallback` no `App.tsx` reserva altura mínima. Verificar que `CategoryGrid` consome skeleton enquanto `useCategories` carrega — hoje ele renderiza grid vazio. **Fix pequeno:** passar `loading` para `CategoryGrid` e mostrar 12 `CategoryCardSkeleton` durante o fetch inicial.

## Arquivos afetados

- `src/pages/HomePage.tsx` — remover Deals/Featured + passar loading de categorias
- `src/components/CategoryGrid.tsx` — aceitar `loading` e renderizar skeletons
- `src/hooks/useApi.ts` — corrigir deps de `useCachedList`; remover hooks `useFeaturedProducts` / `usePromotionProducts` órfãos
- `src/pages/ProductsPage.tsx` — corrigir deps do `useEffect` que reseta página
- Deletar: `src/components/home/DealsGrid.tsx`, `src/components/home/FeaturedCarousel.tsx`

## Fora do escopo

- Visual/tema/layout permanecem idênticos.
- Sem mudanças no backend, mockServer ou dados.
- Painel admin e rotas não são tocados.
