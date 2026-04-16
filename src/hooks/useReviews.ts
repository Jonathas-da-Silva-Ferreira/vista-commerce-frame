import { useState, useEffect, useCallback } from 'react';
import type { Review, ReviewsSummary } from '@/types';

// Hook desacoplado para gerenciar reviews de um produto específico.
// Centraliza fetch, estado de loading/error e mutation (post) para que
// componentes de UI permaneçam puramente apresentacionais.
export function useReviews(productId: string | undefined) {
  const [data, setData] = useState<ReviewsSummary>({ reviews: [], average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback estável permite refetch manual após criar nova review,
  // evitando duplicação de lógica de fetch entre montagem e mutation.
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) throw new Error('Falha ao carregar avaliações');
      const json: ReviewsSummary = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // submitReview retorna o resultado para o componente decidir o que fazer
  // (toast, fechar form, etc) — separa responsabilidades de UX e dados.
  const submitReview = useCallback(async (payload: { userId: string; userName: string; rating: number; comment: string }) => {
    if (!productId) throw new Error('Produto inválido');
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    // Status 409 = conflito (usuário já avaliou) — tratamos como erro de negócio
    // explícito para o componente exibir mensagem específica ao usuário.
    if (!res.ok) throw new Error(json.error || 'Falha ao enviar avaliação');
    // Refetch após sucesso garante consistência (média/total atualizados pelo servidor),
    // evitando que cliente calcule errado por race conditions ou regras de negócio diferentes.
    await fetchReviews();
    return json as Review;
  }, [productId, fetchReviews]);

  return { ...data, loading, error, submitReview, refetch: fetchReviews };
}
