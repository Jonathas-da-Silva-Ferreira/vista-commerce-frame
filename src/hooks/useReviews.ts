import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ---------------------------------------------------------------------------
// Domain shape returned by the hook. Kept local to the hook (instead of
// reusing the looser /types/Review) so consumers get strict typing and the
// editor can autocomplete fields without falling back to `any`.
// ---------------------------------------------------------------------------
export interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  // Joined from `profiles` to render an author label without a second query.
  author_name: string;
}

export interface ReviewDistribution {
  // Map of star value (1..5) → count. Always contains all five buckets so
  // the UI doesn't need to default missing entries when drawing bars.
  1: number; 2: number; 3: number; 4: number; 5: number;
}

interface SubmitPayload {
  rating: number;
  title: string;
  comment: string;
}

/**
 * useReviews — single source of truth for one product's review list.
 *
 * Why a dedicated hook instead of a global store:
 *  - Reviews are scoped to a single product page; they don't need to live
 *    in a context that re-renders unrelated parts of the app.
 *  - Re-fetching after each mutation gives us authoritative aggregates
 *    (average, total, distribution) computed from the same rows the UI
 *    is rendering — no drift between cards and the header summary.
 */
export function useReviews(productId: string | undefined) {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback keeps the function identity stable across renders so the
  // effect below doesn't refetch in a loop and components can pass `refresh`
  // around without breaking memoization downstream.
  const refresh = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    // Admins must see hidden reviews to moderate them; everyone else gets
    // the RLS-filtered list. Doing the branch client-side just changes
    // the *intent* of the query — the server still enforces the policy.
    const query = supabase
      .from('reviews')
      .select('id, product_id, user_id, rating, title, comment, verified_purchase, is_hidden, created_at, updated_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    const { data, error: qErr } = await query;
    if (qErr) {
      setError(qErr.message);
      setLoading(false);
      return;
    }

    // Hydrate author display names from profiles in a single batched query
    // to avoid the classic N+1 join problem.
    const userIds = Array.from(new Set((data ?? []).map(r => r.user_id)));
    let nameByUser: Record<string, string> = {};
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);
      nameByUser = Object.fromEntries(
        (profiles ?? []).map(p => [p.user_id, p.display_name || p.email?.split('@')[0] || 'User']),
      );
    }

    setRows(
      (data ?? []).map(r => ({
        ...r,
        author_name: nameByUser[r.user_id] ?? 'User',
      })) as ReviewRow[],
    );
    setLoading(false);
  }, [productId]);

  useEffect(() => { void refresh(); }, [refresh]);

  // ---------- Aggregates ----------
  // Hidden reviews are excluded from public aggregates so a moderated row
  // never inflates a product's rating. Admins still see them in the list
  // for moderation, but the headline metric stays "what shoppers see".
  const { visible, average, total, distribution } = useMemo(() => {
    const v = rows.filter(r => !r.is_hidden);
    const t = v.length;
    const avg = t === 0 ? 0 : v.reduce((s, r) => s + r.rating, 0) / t;
    const dist: ReviewDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of v) dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
    return { visible: v, average: avg, total: t, distribution: dist };
  }, [rows]);

  const userReview = useMemo(
    () => (user ? rows.find(r => r.user_id === user.id) ?? null : null),
    [rows, user],
  );

  // ---------- Mutations ----------
  // All mutations rely on RLS for the actual permission check; we still
  // gate the calls client-side to give immediate feedback and avoid
  // sending requests we know will be rejected.

  const create = useCallback(async (payload: SubmitPayload) => {
    if (!user) throw new Error('You must be signed in to review.');
    const { error: e } = await supabase.from('reviews').insert({
      product_id: productId!,
      user_id: user.id,
      rating: payload.rating,
      title: payload.title.trim(),
      comment: payload.comment.trim(),
    });
    if (e) throw new Error(e.message);
    await refresh();
  }, [productId, refresh, user]);

  const update = useCallback(async (reviewId: string, payload: SubmitPayload) => {
    // We do NOT send is_hidden / verified_purchase — the BEFORE UPDATE
    // trigger rejects changes to those columns for non-admins anyway.
    const { error: e } = await supabase
      .from('reviews')
      .update({
        rating: payload.rating,
        title: payload.title.trim(),
        comment: payload.comment.trim(),
      })
      .eq('id', reviewId);
    if (e) throw new Error(e.message);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (reviewId: string) => {
    const { error: e } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (e) throw new Error(e.message);
    await refresh();
  }, [refresh]);

  const setHidden = useCallback(async (reviewId: string, hidden: boolean) => {
    if (!isAdmin) throw new Error('Only admins can moderate reviews.');
    const { error: e } = await supabase
      .from('reviews')
      .update({ is_hidden: hidden })
      .eq('id', reviewId);
    if (e) throw new Error(e.message);
    await refresh();
  }, [isAdmin, refresh]);

  return {
    // Public list for shoppers (no hidden rows); admins get the full list
    // via `all` so they can moderate without a second query.
    reviews: isAdmin ? rows : visible,
    all: rows,
    average,
    total,
    distribution,
    userReview,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    setHidden,
  };
}
