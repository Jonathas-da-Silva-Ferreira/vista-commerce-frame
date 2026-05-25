import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';

// Owns the "can this user review?" rules so ReviewForm can stay a pure
// controlled input, reusable in other contexts (modals, post-order flows).
interface ProductReviewsProps {
  productId: string;
}

// Intl.DateTimeFormat is hoisted out of render — constructing one is
// surprisingly expensive and we'd otherwise rebuild it for every review row.
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit', month: 'short', year: 'numeric',
});

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, average, total, loading, error, submitReview } = useReviews(productId);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Business rule: one review per user per product. Memoized because the scan
  // would otherwise run on every keystroke in unrelated parent state.
  const userAlreadyReviewed = useMemo(
    () => !!user && reviews.some(r => r.userId === user.id),
    [reviews, user]
  );

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await submitReview({ userId: user.id, userName: user.name, ...data });
      toast({ title: 'Review submitted!', description: 'Thanks for sharing your experience.' });
      setShowForm(false);
    } finally {
      // Reset in finally so a failed request still unblocks the submit button.
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="border-t border-border pt-10 mt-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Customer reviews</h2>
          {/* Aggregate score is shown above individual reviews — social
              proof is most persuasive when seen before the long-form text. */}
          {!loading && total > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={average} size={20} />
              <span className="font-semibold text-lg">{average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({total} {total === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {/* CTA branches on auth so signed-out visitors get an actionable
            login link rather than a confusing disabled state. */}
        {isAuthenticated && !userAlreadyReviewed && !showForm && (
          <Button onClick={() => setShowForm(true)}>Write a review</Button>
        )}
        {!isAuthenticated && (
          <Button asChild variant="outline">
            <Link to="/login">Sign in to review</Link>
          </Button>
        )}
      </div>

      {showForm && isAuthenticated && (
        <div className="mb-8">
          <ReviewForm onSubmit={handleSubmit} submitting={submitting} />
        </div>
      )}

      {/* Make the "one review per product" rule visible up-front — silent
          rejections after a long write-up are a top frustration in reviews UX. */}
      {userAlreadyReviewed && !showForm && (
        <p className="text-sm text-muted-foreground mb-6 italic">
          You've already reviewed this product. Thanks for your feedback!
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading reviews…
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        // Actionable empty state — invites the next person to review instead
        // of simply reporting an absence of data.
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-medium">No reviews yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to review this product!</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <ul className="space-y-5">
          {reviews.map(r => (
            <li key={r.id} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3">
                {/* Initial avatar avoids depending on an external service
                    (e.g. Gravatar) and keeps the UI working offline. */}
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                  {r.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold">{r.userName}</p>
                    <time className="text-xs text-muted-foreground" dateTime={r.createdAt}>
                      {dateFormatter.format(new Date(r.createdAt))}
                    </time>
                  </div>
                  <StarRating value={r.rating} size={14} className="mt-1" />
                  <p className="mt-2 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {r.comment}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
