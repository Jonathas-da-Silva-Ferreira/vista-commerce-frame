import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';

// Seção principal de avaliações — orquestra hook de dados, formulário e listagem.
// Mantemos toda a lógica de "pode avaliar?" aqui para que ReviewForm seja reutilizável.
interface ProductReviewsProps {
  productId: string;
}

// Formatação de data localizada — extraído para fora do render
// pois cria Intl.DateTimeFormat (operação custosa) a cada chamada.
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: 'short', year: 'numeric',
});

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, average, total, loading, error, submitReview } = useReviews(productId);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Verifica se o usuário atual já avaliou — regra: 1 review por usuário/produto.
  // useMemo evita scan a cada render quando reviews é grande.
  const userAlreadyReviewed = useMemo(
    () => !!user && reviews.some(r => r.userId === user.id),
    [reviews, user]
  );

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await submitReview({ userId: user.id, userName: user.name, ...data });
      toast({ title: 'Avaliação enviada!', description: 'Obrigado por compartilhar sua experiência.' });
      setShowForm(false);
    } finally {
      // setSubmitting no finally garante reset mesmo em erro,
      // evitando botão travado se a chamada falhar.
      setSubmitting(false);
    }
  };

  return (
    <section id="avaliacoes" className="border-t border-border pt-10 mt-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Avaliações dos clientes</h2>
          {/* Cabeçalho com média + total: padrão de e-commerce que reforça
              prova social antes mesmo de o usuário ler comentários individuais. */}
          {!loading && total > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={average} size={20} />
              <span className="font-semibold text-lg">{average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({total} {total === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>
          )}
        </div>

        {/* CTA condicional baseado em estado de auth — usuários deslogados
            recebem link para login ao invés de mensagem genérica de erro. */}
        {isAuthenticated && !userAlreadyReviewed && !showForm && (
          <Button onClick={() => setShowForm(true)}>Avaliar produto</Button>
        )}
        {!isAuthenticated && (
          <Button asChild variant="outline">
            <Link to="/login">Entrar para avaliar</Link>
          </Button>
        )}
      </div>

      {showForm && isAuthenticated && (
        <div className="mb-8">
          <ReviewForm onSubmit={handleSubmit} submitting={submitting} />
        </div>
      )}

      {/* Aviso explícito quando usuário já avaliou — transparência sobre a regra
          de negócio "1 review por produto" evita tentativas frustradas. */}
      {userAlreadyReviewed && !showForm && (
        <p className="text-sm text-muted-foreground mb-6 italic">
          Você já avaliou este produto. Obrigado pela contribuição!
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Carregando avaliações…
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        // Empty state acionável — mensagem positiva incentiva ser o primeiro a avaliar
        // ao invés de simplesmente informar ausência de dados.
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-medium">Nenhuma avaliação ainda.</p>
          <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a avaliar este produto!</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <ul className="space-y-5">
          {reviews.map(r => (
            <li key={r.id} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3">
                {/* Avatar gerado a partir da inicial — evita dependência de
                    serviço externo (gravatar) e funciona offline. */}
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
