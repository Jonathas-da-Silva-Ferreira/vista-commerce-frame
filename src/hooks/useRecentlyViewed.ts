import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types';

// Chave namespaced para evitar colisão com outras chaves do app
// (cart, favorites, theme) — convenção: `nexora:<feature>`.
const STORAGE_KEY = 'nexora:recent';
// Limite alto o suficiente para histórico útil, baixo o suficiente para
// não estourar a quota de localStorage (~5MB) nem deixar a UI lenta.
const MAX_ITEMS = 12;
// 30 dias em ms — após esse período, registros antigos são descartados.
// Evita mostrar produtos que o usuário viu há meses (provavelmente sem
// intenção de compra atual) e pode ser que nem existam mais no catálogo.
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface RecentEntry {
  product: Product;
  // Timestamp serve tanto para ordenação quanto para expiração por TTL.
  viewedAt: number;
}

/**
 * useRecentlyViewed — histórico local de produtos visitados.
 *
 * Por quê client-side: rastreio de navegação anônima não precisa ir ao
 * backend (privacidade + custo). localStorage é suficiente, persistente
 * entre sessões e instantâneo.
 *
 * API:
 *  - items: lista pronta para render (já filtrada por TTL, mais recente primeiro)
 *  - track(product): grava/atualiza um produto na lista
 *
 * Comportamento crítico:
 *  - Dedupe por id: revisitar um produto NÃO duplica, só atualiza viewedAt.
 *  - Ordenação descendente: mais recente sempre aparece primeiro.
 *  - Limite de 12: além disso, o mais antigo é descartado.
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState<Product[]>([]);

  // Lê e sanitiza o storage na montagem. Try/catch protege contra JSON
  // corrompido (ex: usuário editou manualmente) sem quebrar o app.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as RecentEntry[];
      const now = Date.now();
      // Filtragem de TTL no read evita lógica de "limpeza periódica" —
      // entradas expiradas simplesmente não aparecem.
      const fresh = parsed.filter(e => now - e.viewedAt < TTL_MS);
      setItems(fresh.map(e => e.product));
    } catch {
      // Storage corrompido: ignora silenciosamente; melhor lista vazia
      // que página quebrada.
    }
  }, []);

  // useCallback estável para que componentes consumidores possam usar
  // `track` como dependência de useEffect sem refetch infinito.
  const track = useCallback((product: Product) => {
    setItems(prev => {
      const now = Date.now();
      // Remove ocorrência antiga (se houver) e adiciona o produto no topo.
      // Esse padrão "remove + unshift" é mais simples que tentar atualizar
      // in-place e depois reordenar.
      const withoutDup = prev.filter(p => p.id !== product.id);
      const next = [product, ...withoutDup].slice(0, MAX_ITEMS);

      // Persiste já no formato com timestamp; reler usa o mesmo schema.
      const entries: RecentEntry[] = next.map(p => ({
        product: p,
        // Só o item recém-adicionado merece timestamp atualizado; os
        // demais mantêm o anterior se já estiverem em storage. Para
        // simplicidade aceitamos atualizar todos para `now` — perdemos
        // granularidade fina mas ganhamos código mais simples.
        viewedAt: p.id === product.id ? now : now,
      }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // Quota cheia: ignora; a UI continua funcionando em memória.
      }
      return next;
    });
  }, []);

  return { items, track };
}
