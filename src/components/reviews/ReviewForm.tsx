import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Pure controlled form. Kept dumb so it's drop-in usable from a modal, the
// post-order page, or anywhere else we need a review capture surface.
interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  submitting?: boolean;
}

export function ReviewForm({ onSubmit, submitting }: ReviewFormProps) {
  // Two rating states: the committed one (clicked) and a transient hover one.
  // Separating them prevents flicker as the user moves the mouse off after
  // selecting a value.
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation gives instant feedback and avoids a wasted
    // round-trip when the user obviously hasn't filled the form out.
    if (rating < 1) {
      toast({ title: 'Pick a rating', description: 'Choose 1 to 5 stars to rate the product.', variant: 'destructive' });
      return;
    }
    if (comment.trim().length < 5) {
      toast({ title: 'Comment too short', description: 'Write at least 5 characters.', variant: 'destructive' });
      return;
    }
    try {
      await onSubmit({ rating, comment: comment.trim() });
      // Only reset on success so a network failure preserves the text the
      // user just wrote — losing a long comment to a transient error is a
      // top reason people abandon reviews.
      setRating(0);
      setComment('');
    } catch (err) {
      toast({
        title: 'Could not submit',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-border bg-card">
      <div>
        <p className="text-sm font-semibold mb-2">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => {
            // hover wins over rating so the preview reflects what a click
            // would commit to — common pattern in star rating widgets.
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star className={`w-7 h-7 ${active ? 'fill-accent text-accent' : 'text-muted-foreground/40'}`} />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-muted-foreground">{rating}/5</span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="text-sm font-semibold block mb-2">Comment</label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this product…"
          rows={4}
          // 500 chars is generous for genuine reviews while still capping the
          // payload to defend against low-effort abuse.
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/500</p>
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : 'Submit review'}
      </Button>
    </form>
  );
}
