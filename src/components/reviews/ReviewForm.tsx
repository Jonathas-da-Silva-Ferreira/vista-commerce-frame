import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Pure controlled form, reusable for both creation and editing flows.
// Why a single form for both: the create/update payload is identical, so
// duplicating markup would just create two surfaces to keep in sync.
export interface ReviewFormValues {
  rating: number;
  title: string;
  comment: string;
}

interface ReviewFormProps {
  onSubmit: (data: ReviewFormValues) => Promise<void>;
  submitting?: boolean;
  // Optional initial values — when present the form is in "edit" mode and
  // the submit button label flips to make the action self-explanatory.
  initial?: Partial<ReviewFormValues>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function ReviewForm({ onSubmit, submitting, initial, submitLabel, onCancel }: ReviewFormProps) {
  // Two rating states: the committed one (clicked) and a transient hover one.
  // Separating them prevents flicker as the user moves the mouse off after
  // selecting a value.
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [comment, setComment] = useState(initial?.comment ?? '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation gives instant feedback. Server-side CHECK
    // constraints on the `reviews` table enforce the same rules so a
    // crafted request cannot bypass them.
    if (rating < 1) {
      toast({ title: 'Pick a rating', description: 'Choose 1 to 5 stars to rate the product.', variant: 'destructive' });
      return;
    }
    if (title.trim().length < 1) {
      toast({ title: 'Title required', description: 'Give your review a short headline.', variant: 'destructive' });
      return;
    }
    if (comment.trim().length < 5) {
      toast({ title: 'Comment too short', description: 'Write at least 5 characters.', variant: 'destructive' });
      return;
    }
    try {
      await onSubmit({ rating, title: title.trim(), comment: comment.trim() });
      // Only reset on success so a network failure preserves the text the
      // user just wrote — losing a long comment to a transient error is a
      // top reason people abandon reviews. In edit mode we keep the values
      // so the modal can close gracefully without flashing empty fields.
      if (!initial) {
        setRating(0);
        setTitle('');
        setComment('');
      }
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
        <label htmlFor="review-title" className="text-sm font-semibold block mb-2">Title</label>
        <Input
          id="review-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Sum it up in one line"
          // 120 chars matches the DB CHECK so client + server reject the
          // same overruns; consistent limits avoid confusing error rounds.
          maxLength={120}
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="text-sm font-semibold block mb-2">Comment</label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this product…"
          rows={4}
          // 2000 chars matches the DB-side check constraint.
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/2000</p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
            : (submitLabel ?? (initial ? 'Save changes' : 'Submit review'))}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
