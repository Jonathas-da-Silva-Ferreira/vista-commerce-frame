import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, Pencil, Trash2, EyeOff, Eye, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReviews, type ReviewRow } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from './StarRating';
import { ReviewForm, type ReviewFormValues } from './ReviewForm';

interface ProductReviewsProps {
  productId: string;
}

// Hoisted because constructing Intl formatters is surprisingly expensive
// and we'd otherwise rebuild one for every review row on every render.
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit', month: 'short', year: 'numeric',
});

// A small tolerance prevents flagging rows as "edited" just because the
// BEFORE-INSERT trigger ran in the same statement (created_at and
// updated_at are both `now()` but can differ by microseconds).
const EDIT_TOLERANCE_MS = 1500;
function wasEdited(r: ReviewRow): boolean {
  return new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() > EDIT_TOLERANCE_MS;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const {
    reviews, average, total, distribution, userReview,
    loading, error, create, update, remove, setHidden,
  } = useReviews(productId);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  // UI state — kept local because none of it is needed outside this widget.
  const [submitting, setSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [deleting, setDeleting] = useState<ReviewRow | null>(null);

  const handleCreate = async (data: ReviewFormValues) => {
    setSubmitting(true);
    try {
      await create(data);
      toast({ title: 'Review submitted!', description: 'Thanks for sharing your experience.' });
      setShowCreate(false);
    } catch (err) {
      // Re-throw so ReviewForm's catch shows the message in a toast too;
      // we still log here in case the form is unmounted before the toast fires.
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: ReviewFormValues) => {
    if (!editing) return;
    setSubmitting(true);
    try {
      await update(editing.id, data);
      toast({ title: 'Review updated', description: 'Your changes are now live.' });
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast({ title: 'Review deleted' });
    } catch (err) {
      toast({
        title: 'Could not delete',
        description: err instanceof Error ? err.message : 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleHidden = async (r: ReviewRow) => {
    try {
      await setHidden(r.id, !r.is_hidden);
      toast({ title: r.is_hidden ? 'Review restored' : 'Review hidden' });
    } catch (err) {
      toast({
        title: 'Moderation failed',
        description: err instanceof Error ? err.message : 'Try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section id="reviews" className="border-t border-border pt-10 mt-10">
      {/* ----- Header: aggregate score + distribution + CTA ------------- */}
      <div className="grid md:grid-cols-[1fr,2fr] gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Customer reviews</h2>
          {!loading && total > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <StarRating value={average} size={22} />
                <span className="font-semibold text-2xl">{average.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {total} {total === 1 ? 'review' : 'reviews'}
              </p>
            </>
          ) : !loading ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : null}
        </div>

        {/* Star distribution — most-stars first matches Amazon/Mercado Livre
            so it feels familiar and lets users scan to "is this 5-star or
            polarized?" at a glance. */}
        {!loading && total > 0 && (
          <div className="space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map(stars => {
              const count = distribution[stars];
              const pct = total === 0 ? 0 : (count / total) * 100;
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-muted-foreground">{stars}★</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                      aria-label={`${pct.toFixed(0)}% of reviews are ${stars} stars`}
                    />
                  </div>
                  <span className="w-10 text-right text-muted-foreground tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ----- Write/Sign-in CTA --------------------------------------- */}
      <div className="mb-6">
        {isAuthenticated && !userReview && !showCreate && (
          <Button onClick={() => setShowCreate(true)}>Write a review</Button>
        )}
        {isAuthenticated && userReview && !showCreate && (
          <p className="text-sm text-muted-foreground italic">
            You've already reviewed this product. Use ✏️ Edit to update your rating or comment.
          </p>
        )}
        {!isAuthenticated && (
          <Button asChild variant="outline">
            <Link to="/login">Sign in to review</Link>
          </Button>
        )}
      </div>

      {showCreate && isAuthenticated && (
        <div className="mb-8">
          <ReviewForm
            onSubmit={handleCreate}
            submitting={submitting}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* ----- States -------------------------------------------------- */}
      {loading && (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading reviews…
        </div>
      )}
      {error && !loading && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && reviews.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-medium">No reviews yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to review this product!</p>
        </div>
      )}

      {/* ----- Review list -------------------------------------------- */}
      {!loading && reviews.length > 0 && (
        <ul className="space-y-5">
          {reviews.map(r => {
            // Ownership / moderation flags computed once per row — cheaper
            // than threading useMemo into a child component for a list this
            // size, and keeps each row self-contained.
            const isOwner = !!user && user.id === r.user_id;
            const edited = wasEdited(r);

            return (
              <li
                key={r.id}
                className={`p-5 rounded-xl border bg-card ${
                  r.is_hidden ? 'border-dashed border-destructive/40 bg-destructive/5' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                    {r.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{r.author_name}</p>
                        {/* Verified badge is server-derived from the user's
                            order history, so it cannot be spoofed via the
                            client and is safe to display as social proof. */}
                        {r.verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            <BadgeCheck className="w-3 h-3" />
                            Verified purchase
                          </span>
                        )}
                        {r.is_hidden && (
                          <span className="text-[11px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground" dateTime={r.created_at}>
                        {dateFormatter.format(new Date(r.created_at))}
                        {edited && (
                          <span className="ml-2 italic">
                            · Edited {dateFormatter.format(new Date(r.updated_at))}
                          </span>
                        )}
                      </time>
                    </div>

                    <StarRating value={r.rating} size={14} className="mt-1" />
                    {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                    <p className="mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                      {r.comment}
                    </p>

                    {/* Per-row actions. Visible only to the owner or an admin;
                        the underlying RLS policies enforce the same rule
                        server-side so a crafted request still gets denied. */}
                    {(isOwner || isAdmin) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(r)}
                            aria-label="Edit your review"
                          >
                            <Pencil className="w-4 h-4 mr-1.5" />
                            Edit
                          </Button>
                        )}
                        {(isOwner || isAdmin) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(r)}
                            aria-label="Delete this review"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Delete
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleHidden(r)}
                            aria-label={r.is_hidden ? 'Restore review' : 'Hide review'}
                          >
                            {r.is_hidden
                              ? <><Eye className="w-4 h-4 mr-1.5" /> Restore</>
                              : <><EyeOff className="w-4 h-4 mr-1.5" /> Hide</>}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ----- Edit modal --------------------------------------------- */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit your review</DialogTitle>
            <DialogDescription>
              Update your rating or comment. The change is saved in place and
              the original review keeps its creation date.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <ReviewForm
              initial={{ rating: editing.rating, title: editing.title, comment: editing.comment }}
              onSubmit={handleEdit}
              submitting={submitting}
              onCancel={() => setEditing(null)}
              submitLabel="Save changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ----- Delete confirmation ----------------------------------- */}
      <AlertDialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the review and update the product's
              average rating. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
