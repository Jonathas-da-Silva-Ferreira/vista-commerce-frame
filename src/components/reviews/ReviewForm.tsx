import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Formulário de envio de review — isolado em componente próprio para permitir
// reutilização (modal, página de pedidos, etc) e facilitar testes.
interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  submitting?: boolean;
}

export function ReviewForm({ onSubmit, submitting }: ReviewFormProps) {
  // Dois estados de rating: rating definitivo (clicado) e hover (preview).
  // Separar evita "flicker" quando o usuário move o mouse após selecionar.
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação client-side antes do submit — feedback imediato e
    // economia de request desnecessário ao backend.
    if (rating < 1) {
      toast({ title: 'Selecione uma nota', description: 'Escolha de 1 a 5 estrelas para avaliar.', variant: 'destructive' });
      return;
    }
    if (comment.trim().length < 5) {
      toast({ title: 'Comentário muito curto', description: 'Escreva ao menos 5 caracteres.', variant: 'destructive' });
      return;
    }
    try {
      await onSubmit({ rating, comment: comment.trim() });
      // Reset apenas após sucesso — preserva input em caso de erro de rede,
      // evitando frustração do usuário que escreveu um texto longo.
      setRating(0);
      setComment('');
    } catch (err) {
      toast({
        title: 'Não foi possível enviar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-border bg-card">
      <div>
        <p className="text-sm font-semibold mb-2">Sua nota</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => {
            // active = preenchida (hover tem prioridade sobre rating definitivo
            // para mostrar preview do que será selecionado se clicar).
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
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
        <label htmlFor="review-comment" className="text-sm font-semibold block mb-2">Comentário</label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Conte sua experiência com o produto…"
          rows={4}
          maxLength={500}
          // maxLength previne abuso (DoS leve) e mantém UI limpa —
          // limite generoso o suficiente para reviews detalhadas reais.
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/500</p>
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…</> : 'Enviar avaliação'}
      </Button>
    </form>
  );
}
